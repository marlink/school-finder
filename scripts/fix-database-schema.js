#!/usr/bin/env node

/**
 * Fix Database Schema - Add missing columns with default values
 * This script handles the schema migration for existing schools data
 */

const { PrismaClient } = require('@prisma/client');

async function fixDatabaseSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking current database structure...');
    
    // First, let's see what schools exist
    const schools = await prisma.$queryRaw`
      SELECT id, name, 
             CASE WHEN column_name = 'type' THEN 'has_type' ELSE 'no_type' END as type_status,
             CASE WHEN column_name = 'address' THEN 'has_address' ELSE 'no_address' END as address_status,
             CASE WHEN column_name = 'contact' THEN 'has_contact' ELSE 'no_contact' END as contact_status
      FROM schools 
      LEFT JOIN information_schema.columns 
      ON table_name = 'schools' AND column_name IN ('type', 'address', 'contact')
      LIMIT 5
    `;
    
    console.log('📊 Current schools sample:', schools);
    
    // Check if columns exist
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'schools' 
      ORDER BY column_name
    `;
    
    console.log('📋 Current columns in schools table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if we need to add missing columns
    const hasType = columns.some(col => col.column_name === 'type');
    const hasAddress = columns.some(col => col.column_name === 'address');
    const hasContact = columns.some(col => col.column_name === 'contact');
    
    console.log('\n🔧 Missing columns analysis:');
    console.log(`  - type: ${hasType ? '✅ exists' : '❌ missing'}`);
    console.log(`  - address: ${hasAddress ? '✅ exists' : '❌ missing'}`);
    console.log(`  - contact: ${hasContact ? '✅ exists' : '❌ missing'}`);
    
    if (!hasType || !hasAddress || !hasContact) {
      console.log('\n🚀 Adding missing columns with default values...');
      
      if (!hasType) {
        await prisma.$executeRaw`
          ALTER TABLE schools 
          ADD COLUMN IF NOT EXISTS type VARCHAR(255) DEFAULT 'Szkoła podstawowa'
        `;
        console.log('✅ Added type column');
      }
      
      if (!hasAddress) {
        await prisma.$executeRaw`
          ALTER TABLE schools 
          ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb
        `;
        console.log('✅ Added address column');
      }
      
      if (!hasContact) {
        await prisma.$executeRaw`
          ALTER TABLE schools 
          ADD COLUMN IF NOT EXISTS contact JSONB DEFAULT '{}'::jsonb
        `;
        console.log('✅ Added contact column');
      }
      
      // Update existing schools with proper default values
      console.log('\n📝 Updating existing schools with default values...');
      
      await prisma.$executeRaw`
        UPDATE schools 
        SET 
          type = COALESCE(type, 'Szkoła podstawowa'),
          address = COALESCE(address, '{}'::jsonb),
          contact = COALESCE(contact, '{}'::jsonb)
        WHERE type IS NULL OR address IS NULL OR contact IS NULL
      `;
      
      console.log('✅ Updated existing schools with default values');
    }
    
    // Verify the fix
    const schoolCount = await prisma.school.count();
    console.log(`\n🎉 Database schema fixed! Total schools: ${schoolCount}`);
    
    // Test a query to make sure it works
    const testSchool = await prisma.school.findFirst({
      select: { id: true, name: true, type: true }
    });
    
    console.log('🧪 Test query successful:', testSchool);
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixDatabaseSchema()
    .then(() => {
      console.log('\n✅ Database schema fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database schema fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabaseSchema };