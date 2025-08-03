const { ApifyClient } = require('apify-client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

async function testApifyActor() {
    console.log('🧪 Testing Apify Actor Parameters...');
    
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });
    
    // Simple test with minimal parameters
    const input = {
        searchStringsArray: ['szkoła podstawowa Poznań'],
        maxCrawledPlacesPerSearch: 5,
        language: 'pl',
        countryCode: 'pl'
    };
    
    console.log('📋 Test input:', JSON.stringify(input, null, 2));
    
    try {
        console.log('🚀 Starting actor...');
        const run = await client.actor('compass/crawler-google-places').call(input);
        console.log(`✅ Actor started successfully! Run ID: ${run.id}`);
        console.log(`🔗 Monitor at: https://console.apify.com/actors/runs/${run.id}`);
        
        // Wait a bit and check status
        console.log('⏳ Waiting 30 seconds to check status...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        const runInfo = await client.run(run.id).get();
        console.log(`📊 Run status: ${runInfo.status}`);
        
        if (runInfo.status === 'SUCCEEDED') {
            const { items } = await client.dataset(runInfo.defaultDatasetId).listItems();
            console.log(`📚 Found ${items.length} results`);
            if (items.length > 0) {
                console.log('📋 Sample result:', JSON.stringify(items[0], null, 2));
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📋 Error details:', error);
    }
}

testApifyActor().catch(console.error);