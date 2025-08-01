const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addSearchIndexes() {
  try {
    console.log('🔧 Adding database indexes to improve search performance...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-search-indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ Successfully added all database indexes!');
    console.log('📊 Search performance should be significantly improved.');
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addSearchIndexes()
    .then(() => {
      console.log('🎉 Index creation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to create indexes:', error);
      process.exit(1);
    });
}

module.exports = { addSearchIndexes };