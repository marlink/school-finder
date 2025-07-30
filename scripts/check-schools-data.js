import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Environment Check:')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)
console.log('Key length:', supabaseKey?.length)
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchoolsData() {
  console.log('🏫 Checking schools table...')
  
  try {
    // Try to count schools
    const { count, error: countError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Count Error:', countError)
      return
    }
    
    console.log(`✅ Schools table exists with ${count} records`)
    
    // Get a few sample records
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, city, type')
      .limit(5)
    
    if (error) {
      console.log('❌ Sample Data Error:', error)
      return
    }
    
    console.log('\n📋 Sample schools:')
    data.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (${school.type}) - ${school.city}`)
    })
    
  } catch (error) {
    console.log('❌ Unexpected Error:', error)
  }
}

async function checkOtherTables() {
  console.log('\n🔍 Checking other tables...')
  
  const tables = ['profiles', 'favorites', 'school_images', 'search_tracking']
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: ${count} records`)
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`)
    }
  }
}

// Run the checks
checkSchoolsData()
  .then(() => checkOtherTables())
  .then(() => {
    console.log('\n✅ Database check complete!')
  })
  .catch(error => {
    console.error('❌ Script failed:', error)
  })