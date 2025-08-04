const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Debug:');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔑 APIFY_API_TOKEN present:', !!process.env.APIFY_API_TOKEN);
console.log('🔑 APIFY_API_TOKEN length:', process.env.APIFY_API_TOKEN ? process.env.APIFY_API_TOKEN.length : 0);
console.log('🔑 APIFY_API_TOKEN:', process.env.APIFY_API_TOKEN);

// Initialize Apify client with loaded environment
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function testConnection() {
    try {
        console.log('📡 Testing Apify connection...');
        const user = await client.user().get();
        console.log('✅ Connected successfully!');
        console.log('👤 User:', user.username);
        console.log('📧 Email:', user.email);
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('Error details:', error);
    }
}

testConnection();