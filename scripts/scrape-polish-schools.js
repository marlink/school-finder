require('dotenv').config({ path: '.env.local' });
const { ApifyClient } = require('apify-client');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize Apify client
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapePolishSchools() {
    console.log('🚀 Starting Polish Schools Data Scraping...');
    
    try {
        // Test Apify connection
        console.log('📡 Testing Apify connection...');
        const user = await client.user().get();
        console.log(`✅ Connected to Apify as: ${user.username}`);
        
        // Use Google Maps scraper to get Polish schools
        console.log('🗺️ Starting Google Maps scraping for Polish schools...');
        
        const input = {
            searchStringsArray: [
                'szkoły podstawowe Warszawa',
                'liceum Kraków',
                'gimnazjum Gdańsk',
                'przedszkole Wrocław',
                'szkoła średnia Poznań'
            ],
            maxCrawledPlacesPerSearch: 20,
            language: 'pl',
            countryCode: 'PL',
            includeImages: true,
            includeReviews: false,
            maxReviews: 0
        };
        
        console.log('🎯 Input parameters:', JSON.stringify(input, null, 2));
        
        // Start the scraping run
        const run = await client.actor('compass/crawler-google-places').call(input);
        console.log(`🎯 Started scraping run: ${run.id}`);
        console.log(`🔗 Monitor at: https://console.apify.com/actors/runs/${run.id}`);
        
        // Wait for completion with progress updates
        console.log('⏳ Waiting for scraping to complete...');
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max
        
        while (attempts < maxAttempts) {
            const runInfo = await client.run(run.id).get();
            console.log(`📊 Run status: ${runInfo.status} (attempt ${attempts + 1}/${maxAttempts})`);
            
            if (runInfo.status === 'SUCCEEDED') {
                console.log('✅ Scraping completed successfully!');
                
                // Get the results
                const { items } = await client.dataset(runInfo.defaultDatasetId).listItems();
                console.log(`📚 Found ${items.length} schools total`);
                
                // Show sample data
                if (items.length > 0) {
                    console.log('📋 Sample school data:');
                    console.log(JSON.stringify(items[0], null, 2));
                }
                
                // Process and save schools to database
                let savedCount = 0;
                for (const schoolData of items) {
                    try {
                        await saveSchoolToDatabase(schoolData);
                        savedCount++;
                        console.log(`💾 Saved school ${savedCount}/${items.length}: ${schoolData.title}`);
                    } catch (error) {
                        console.error(`❌ Error saving school ${schoolData.title}:`, error.message);
                    }
                }
                
                console.log(`🎉 Successfully saved ${savedCount} schools to database!`);
                break;
                
            } else if (runInfo.status === 'FAILED') {
                console.error('❌ Scraping failed:', runInfo.statusMessage);
                break;
            } else if (runInfo.status === 'RUNNING') {
                console.log('🔄 Still running... waiting 10 seconds');
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        }
        
        if (attempts >= maxAttempts) {
            console.log('⏰ Timeout reached. Run may still be in progress.');
            console.log(`🔗 Check run status at: https://console.apify.com/actors/runs/${run.id}`);
        }
        
    } catch (error) {
        console.error('❌ Error during scraping:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function saveSchoolToDatabase(schoolData) {
    // Map Google Maps data to our database schema
    const schoolRecord = {
        name: schoolData.title || 'Unknown School',
        address: schoolData.address || '',
        city: extractCity(schoolData.address),
        voivodeship: extractVoivodeship(schoolData.address),
        postalCode: extractPostalCode(schoolData.address),
        phone: schoolData.phoneNumber || null,
        email: null, // Not available from Google Maps
        website: schoolData.website || null,
        latitude: schoolData.location?.lat || null,
        longitude: schoolData.location?.lng || null,
        schoolType: determineSchoolType(schoolData.title, schoolData.categoryName),
        description: schoolData.description || null,
        rating: schoolData.totalScore || null,
        reviewCount: schoolData.reviewsCount || 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
        where: {
            name: schoolRecord.name,
            address: schoolRecord.address
        }
    });
    
    if (existingSchool) {
        console.log(`⚠️ School already exists: ${schoolRecord.name}`);
        return existingSchool;
    }
    
    // Save to database
    const savedSchool = await prisma.school.create({
        data: schoolRecord
    });
    
    // Save images if available
    if (schoolData.imageUrls && schoolData.imageUrls.length > 0) {
        for (const imageUrl of schoolData.imageUrls.slice(0, 5)) { // Save first 5 images
            try {
                await prisma.schoolImage.create({
                    data: {
                        schoolId: savedSchool.id,
                        url: imageUrl,
                        type: 'gallery',
                        altText: `${savedSchool.name} - Image`,
                        createdAt: new Date()
                    }
                });
            } catch (imageError) {
                console.error(`⚠️ Error saving image for ${savedSchool.name}:`, imageError.message);
            }
        }
    }
    
    return savedSchool;
}

// Helper functions
function extractCity(address) {
    if (!address) return 'Unknown';
    
    // Polish address patterns
    const patterns = [
        /(\w+),?\s*\d{2}-\d{3}/, // City, postal code
        /\d{2}-\d{3}\s+(\w+)/, // Postal code City
        /(\w+)\s*,\s*Poland/, // City, Poland
    ];
    
    for (const pattern of patterns) {
        const match = address.match(pattern);
        if (match) return match[1];
    }
    
    // Fallback: take first word that's not a number
    const words = address.split(/[,\s]+/);
    for (const word of words) {
        if (word.length > 2 && !/^\d/.test(word)) {
            return word;
        }
    }
    
    return 'Unknown';
}

function extractVoivodeship(address) {
    if (!address) return 'Unknown';
    
    // Map major cities to voivodeships
    const voivodeshipMap = {
        'Warszawa': 'mazowieckie',
        'Warsaw': 'mazowieckie',
        'Kraków': 'małopolskie',
        'Krakow': 'małopolskie',
        'Gdańsk': 'pomorskie',
        'Gdansk': 'pomorskie',
        'Wrocław': 'dolnośląskie',
        'Wroclaw': 'dolnośląskie',
        'Poznań': 'wielkopolskie',
        'Poznan': 'wielkopolskie',
        'Łódź': 'łódzkie',
        'Lodz': 'łódzkie',
        'Szczecin': 'zachodniopomorskie',
        'Lublin': 'lubelskie',
        'Katowice': 'śląskie',
        'Białystok': 'podlaskie',
        'Bialystok': 'podlaskie',
        'Bydgoszcz': 'kujawsko-pomorskie',
        'Toruń': 'kujawsko-pomorskie',
        'Torun': 'kujawsko-pomorskie'
    };
    
    const city = extractCity(address);
    return voivodeshipMap[city] || 'Unknown';
}

function extractPostalCode(address) {
    if (!address) return null;
    const postalMatch = address.match(/\d{2}-\d{3}/);
    return postalMatch ? postalMatch[0] : null;
}

function determineSchoolType(title, category) {
    if (!title) return 'other';
    
    const titleLower = title.toLowerCase();
    const categoryLower = (category || '').toLowerCase();
    
    if (titleLower.includes('przedszkole') || titleLower.includes('kindergarten')) {
        return 'kindergarten';
    } else if (titleLower.includes('podstawowa') || titleLower.includes('primary') || titleLower.includes('sp ')) {
        return 'primary';
    } else if (titleLower.includes('gimnazjum') || titleLower.includes('middle')) {
        return 'middle';
    } else if (titleLower.includes('liceum') || titleLower.includes('high') || titleLower.includes('lo ')) {
        return 'high';
    } else if (titleLower.includes('technikum') || titleLower.includes('technical') || titleLower.includes('zawodowa')) {
        return 'technical';
    } else if (titleLower.includes('uniwersytet') || titleLower.includes('university') || titleLower.includes('college') || titleLower.includes('akademia')) {
        return 'university';
    }
    
    return 'other';
}

// Run the scraper
if (require.main === module) {
    console.log('🎓 School Finder - Polish Schools Data Scraper');
    console.log('===============================================');
    scrapePolishSchools()
        .then(() => {
            console.log('✅ Scraping completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Scraping failed:', error);
            process.exit(1);
        });
}

module.exports = { scrapePolishSchools, saveSchoolToDatabase };