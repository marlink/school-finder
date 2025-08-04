const { ApifyClient } = require('apify-client');

async function testApifyToken(tokenName, token) {
    console.log(`\n🧪 Testing ${tokenName}...`);
    console.log('🔑 Token present:', !!token);
    console.log('🔑 Token length:', token ? token.length : 0);
    
    if (!token) {
        console.error('❌ No token provided');
        return false;
    }
    
    try {
        const client = new ApifyClient({ token });
        const user = await client.user().get();
        console.log('✅ Connected successfully!');
        console.log('👤 User:', user.username);
        console.log('📧 Email:', user.email);
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('🔍 Error type:', error.type);
        return false;
    }
}

async function testAllTokens() {
    console.log('🧪 Testing All Apify Tokens...\n');
    
    // Test .env.local
    require('dotenv').config({ path: '.env.local' });
    const localToken = process.env.APIFY_API_TOKEN;
    const localWorks = await testApifyToken('.env.local', localToken);
    
    // Clear and test .env
    delete require.cache[require.resolve('dotenv')];
    require('dotenv').config({ path: '.env' });
    const envToken = process.env.APIFY_API_TOKEN;
    const envWorks = await testApifyToken('.env', envToken);
    
    console.log('\n📊 Summary:');
    console.log('🔹 .env.local token works:', localWorks);
    console.log('🔹 .env token works:', envWorks);
    
    if (envWorks) {
        console.log('\n✅ Recommendation: Use .env file for scraping');
    } else if (localWorks) {
        console.log('\n✅ Recommendation: Use .env.local file for scraping');
    } else {
        console.log('\n❌ No working tokens found');
    }
}

testAllTokens();