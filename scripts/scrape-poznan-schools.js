const { ApifyClient } = require('apify-client');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

// Optimized Poznan school search terms
const poznanSearchTerms = [
    // Core searches - most comprehensive
    'szkoła Poznań',
    'przedszkole Poznań',
    'liceum Poznań',
    'technikum Poznań',
    
    // Nearby areas - key suburbs
    'szkoła Swarzędz',
    'szkoła Luboń',
    'szkoła Puszczykowo',
    'szkoła Mosina'
];

async function scrapePoznanSchools() {
    console.log('🏫 Starting Comprehensive Poznan Schools Data Scraping...');
    console.log('=======================================================');
    
    // Debug environment
    console.log('🔍 Environment Debug:');
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔑 APIFY_API_TOKEN present:', !!process.env.APIFY_API_TOKEN);
    console.log('🔑 APIFY_API_TOKEN length:', process.env.APIFY_API_TOKEN ? process.env.APIFY_API_TOKEN.length : 0);
    console.log('🔑 APIFY_API_TOKEN starts with:', process.env.APIFY_API_TOKEN ? process.env.APIFY_API_TOKEN.substring(0, 10) + '...' : 'N/A');
    
    // Initialize Apify client with loaded environment
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });
    
    try {
        // Test Apify connection
        console.log('📡 Testing Apify connection...');
        const user = await client.user().get();
        console.log(`✅ Connected to Apify as: ${user.username}`);
        
        // Clear existing Poznan area schools (optional)
        console.log('🧹 Clearing existing Poznan area schools...');
        const deletedCount = await prisma.school.deleteMany({
            where: {
                OR: [
                    { address: { path: ['city'], string_contains: 'Poznań' } },
                    { address: { path: ['city'], string_contains: 'Poznan' } },
                    { address: { path: ['city'], string_contains: 'Swarzędz' } },
                    { address: { path: ['city'], string_contains: 'Luboń' } },
                    { address: { path: ['city'], string_contains: 'Puszczykowo' } },
                    { address: { path: ['city'], string_contains: 'Mosina' } },
                    { address: { path: ['city'], string_contains: 'Kórnik' } },
                    { address: { path: ['city'], string_contains: 'Tarnowo' } },
                    { address: { path: ['city'], string_contains: 'Dopiewo' } },
                    { address: { path: ['city'], string_contains: 'Czerwonak' } },
                    { address: { path: ['city'], string_contains: 'Murowana' } },
                    { address: { path: ['city'], string_contains: 'Kostrzyn' } }
                ]
            }
        });
        console.log(`🗑️ Removed ${deletedCount.count} existing Poznan area schools`);
        
        // Use Google Maps scraper to get Poznan schools
        console.log('🗺️ Starting Google Maps scraping for Poznan schools...');
        console.log(`🎯 Searching with ${poznanSearchTerms.length} different search terms`);
        
        const input = {
            searchStringsArray: poznanSearchTerms,
            maxCrawledPlacesPerSearch: 25, // Reduced for better performance
            language: 'pl',
            countryCode: 'pl', // Use lowercase country code
            includeImages: true,
            includeReviews: true,
            maxReviews: 5, // Reduced for better performance
            includeOpeningHours: true,
            includeContacts: true,
            includeWebsite: true,
            onlyDataFromSearchPage: false, // Get detailed data
            maxAutomaticZoomOut: 2 // Expand search area if needed
        };
        
        console.log('🎯 Input parameters:');
        console.log(`   - Search terms: ${poznanSearchTerms.length}`);
        console.log(`   - Max per search: ${input.maxCrawledPlacesPerSearch}`);
        console.log(`   - Language: ${input.language}`);
        console.log(`   - Include reviews: ${input.includeReviews}`);
        
        // Start the scraping run
        const run = await client.actor('compass/crawler-google-places').call(input);
        console.log(`🎯 Started scraping run: ${run.id}`);
        console.log(`🔗 Monitor at: https://console.apify.com/actors/runs/${run.id}`);
        
        // Wait for completion with progress updates
        console.log('⏳ Waiting for scraping to complete...');
        let attempts = 0;
        const maxAttempts = 120; // 20 minutes max for comprehensive scraping
        
        while (attempts < maxAttempts) {
            const runInfo = await client.run(run.id).get();
            console.log(`📊 Run status: ${runInfo.status} (attempt ${attempts + 1}/${maxAttempts})`);
            
            if (runInfo.status === 'SUCCEEDED') {
                console.log('✅ Scraping completed successfully!');
                
                // Get the results
                const { items } = await client.dataset(runInfo.defaultDatasetId).listItems();
                console.log(`📚 Found ${items.length} schools total`);
                
                // Filter for Poznan area schools
                const poznanSchools = items.filter(school => {
                    const address = (school.address || '').toLowerCase();
                    const title = (school.title || '').toLowerCase();
                    
                    return address.includes('poznań') || address.includes('poznan') ||
                           address.includes('swarzędz') || address.includes('luboń') ||
                           address.includes('puszczykowo') || address.includes('mosina') ||
                           address.includes('kórnik') || address.includes('tarnowo') ||
                           address.includes('dopiewo') || address.includes('czerwonak') ||
                           address.includes('murowana') || address.includes('kostrzyn') ||
                           title.includes('poznań') || title.includes('poznan');
                });
                
                console.log(`🎯 Filtered to ${poznanSchools.length} Poznan area schools`);
                
                // Show sample data
                if (poznanSchools.length > 0) {
                    console.log('📋 Sample school data:');
                    console.log(JSON.stringify(poznanSchools[0], null, 2));
                }
                
                // Process and save schools to database
                let savedCount = 0;
                let duplicateCount = 0;
                let errorCount = 0;
                
                for (const schoolData of poznanSchools) {
                    try {
                        const result = await saveSchoolToDatabase(schoolData);
                        if (result.isNew) {
                            savedCount++;
                            console.log(`💾 Saved new school ${savedCount}: ${schoolData.title}`);
                        } else {
                            duplicateCount++;
                            console.log(`⚠️ Duplicate school ${duplicateCount}: ${schoolData.title}`);
                        }
                    } catch (error) {
                        errorCount++;
                        console.error(`❌ Error saving school ${schoolData.title}:`, error.message);
                    }
                }
                
                console.log('\n🎉 Scraping Summary:');
                console.log(`   📚 Total schools found: ${items.length}`);
                console.log(`   🎯 Poznan area schools: ${poznanSchools.length}`);
                console.log(`   💾 New schools saved: ${savedCount}`);
                console.log(`   ⚠️ Duplicates skipped: ${duplicateCount}`);
                console.log(`   ❌ Errors: ${errorCount}`);
                
                // Get final database statistics
                await printDatabaseStats();
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
    // Enhanced mapping for better data quality
    const schoolRecord = {
        name: cleanSchoolName(schoolData.title || 'Unknown School'),
        type: determineSchoolType(schoolData.title, schoolData.categoryName),
        address: {
            street: extractStreet(schoolData.address),
            city: extractCity(schoolData.address),
            region: 'wielkopolskie', // Poznan is in Wielkopolskie voivodeship
            postalCode: extractPostalCode(schoolData.address),
            country: 'Polska'
        },
        contact: {
            phone: schoolData.phoneNumber || null,
            email: extractEmail(schoolData) || null,
            website: schoolData.website || null
        },
        location: {
            latitude: schoolData.location?.lat || null,
            longitude: schoolData.location?.lng || null
        },
        rating: schoolData.totalScore || null,
        reviewCount: schoolData.reviewsCount || 0,
        description: schoolData.description || null,
        isActive: true,
        googlePlaceId: schoolData.placeId || null,
        openingHours: schoolData.openingHours || null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // Check if school already exists (by name and address)
    const existingSchool = await prisma.school.findFirst({
        where: {
            name: schoolRecord.name,
            address: {
                path: ['city'],
                equals: schoolRecord.address.city
            }
        }
    });
    
    if (existingSchool) {
        return { school: existingSchool, isNew: false };
    }
    
    // Save to database
    const savedSchool = await prisma.school.create({
        data: schoolRecord
    });
    
    // Save images if available
    if (schoolData.imageUrls && schoolData.imageUrls.length > 0) {
        for (const [index, imageUrl] of schoolData.imageUrls.slice(0, 5).entries()) {
            try {
                await prisma.schoolImage.create({
                    data: {
                        schoolId: savedSchool.id,
                        url: imageUrl,
                        type: index === 0 ? 'main' : 'gallery',
                        altText: `${savedSchool.name} - Zdjęcie ${index + 1}`,
                        createdAt: new Date()
                    }
                });
            } catch (imageError) {
                console.error(`⚠️ Error saving image for ${savedSchool.name}:`, imageError.message);
            }
        }
    }
    
    // Save reviews if available
    if (schoolData.reviews && schoolData.reviews.length > 0) {
        for (const review of schoolData.reviews.slice(0, 10)) {
            try {
                await prisma.ratingsGoogle.create({
                    data: {
                        schoolId: savedSchool.id,
                        rating: review.stars || 0,
                        comment: review.text || '',
                        authorName: review.name || 'Anonymous',
                        publishedAt: review.publishedAtDate ? new Date(review.publishedAtDate) : new Date(),
                        createdAt: new Date()
                    }
                });
            } catch (reviewError) {
                console.error(`⚠️ Error saving review for ${savedSchool.name}:`, reviewError.message);
            }
        }
    }
    
    return { school: savedSchool, isNew: true };
}

// Enhanced helper functions
function cleanSchoolName(name) {
    return name
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/^(Szkoła|School|Liceum|Technikum|Przedszkole)\s*/i, (match) => {
            return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
        });
}

function extractStreet(address) {
    if (!address) return '';
    
    // Extract street part (before city/postal code)
    const parts = address.split(',');
    if (parts.length > 0) {
        const streetPart = parts[0].trim();
        // Remove postal code if it's at the beginning
        return streetPart.replace(/^\d{2}-\d{3}\s*/, '');
    }
    
    return '';
}

function extractCity(address) {
    if (!address) return 'Unknown';
    
    // Polish city patterns for Poznan area
    const cities = [
        'Poznań', 'Poznan', 'Swarzędz', 'Luboń', 'Puszczykowo', 
        'Mosina', 'Kórnik', 'Tarnowo Podgórne', 'Dopiewo', 
        'Czerwonak', 'Murowana Goślina', 'Kostrzyn'
    ];
    
    for (const city of cities) {
        if (address.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }
    
    // Fallback patterns
    const patterns = [
        /(\w+),?\s*\d{2}-\d{3}/, // City, postal code
        /\d{2}-\d{3}\s+(\w+)/, // Postal code City
        /(\w+)\s*,\s*Poland/, // City, Poland
    ];
    
    for (const pattern of patterns) {
        const match = address.match(pattern);
        if (match) return match[1];
    }
    
    return 'Unknown';
}

function extractPostalCode(address) {
    if (!address) return null;
    const postalMatch = address.match(/\d{2}-\d{3}/);
    return postalMatch ? postalMatch[0] : null;
}

function extractEmail(schoolData) {
    // Try to extract email from various fields
    const text = [
        schoolData.description,
        schoolData.website,
        schoolData.additionalInfo
    ].join(' ');
    
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : null;
}

function determineSchoolType(title, category) {
    if (!title) return 'INNE';
    
    const titleLower = title.toLowerCase();
    const categoryLower = (category || '').toLowerCase();
    
    if (titleLower.includes('przedszkole') || titleLower.includes('kindergarten')) {
        return 'PRZEDSZKOLE';
    } else if (titleLower.includes('szkoła podstawowa') || titleLower.includes('primary school')) {
        return 'PODSTAWOWA';
    } else if (titleLower.includes('liceum') || titleLower.includes('high school')) {
        return 'LICEUM';
    } else if (titleLower.includes('technikum') || titleLower.includes('technical')) {
        return 'TECHNIKUM';
    } else if (titleLower.includes('zawodowa') || titleLower.includes('vocational')) {
        return 'ZAWODOWA';
    } else if (titleLower.includes('gimnazjum') || titleLower.includes('middle school')) {
        return 'GIMNAZJUM';
    } else if (titleLower.includes('uniwersytet') || titleLower.includes('university') || titleLower.includes('uczelnia')) {
        return 'WYŻSZA';
    }
    
    return 'INNE';
}

async function printDatabaseStats() {
    console.log('\n📊 Final Database Statistics:');
    console.log('==============================');
    
    const totalSchools = await prisma.school.count();
    const poznanSchools = await prisma.school.count({
        where: {
            address: {
                path: ['region'],
                equals: 'wielkopolskie'
            }
        }
    });
    
    const schoolsByType = await prisma.school.groupBy({
        by: ['type'],
        _count: { type: true },
        where: {
            address: {
                path: ['region'],
                equals: 'wielkopolskie'
            }
        }
    });
    
    const schoolsByCity = await prisma.school.groupBy({
        by: ['address'],
        _count: { address: true },
        where: {
            address: {
                path: ['region'],
                equals: 'wielkopolskie'
            }
        }
    });
    
    console.log(`📚 Total schools in database: ${totalSchools}`);
    console.log(`🎯 Wielkopolskie schools: ${poznanSchools}`);
    
    console.log('\n📊 Schools by type:');
    schoolsByType.forEach(type => {
        console.log(`   ${type.type}: ${type._count.type}`);
    });
    
    console.log('\n🏙️ Schools by city (top 10):');
    const cityStats = schoolsByCity
        .map(item => ({ city: item.address.city, count: item._count.address }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    cityStats.forEach(city => {
        console.log(`   ${city.city}: ${city.count}`);
    });
}

// Run the scraper
if (require.main === module) {
    console.log('🎓 School Finder - Poznan Schools Comprehensive Scraper');
    console.log('======================================================');
    scrapePoznanSchools()
        .then(() => {
            console.log('✅ Poznan schools scraping completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Poznan schools scraping failed:', error);
            process.exit(1);
        });
}

module.exports = { scrapePoznanSchools, saveSchoolToDatabase };