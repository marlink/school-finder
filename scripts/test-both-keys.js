import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Environment Check:')
console.log('URL:', supabaseUrl)
console.log('Anon Key exists:', !!supabaseAnonKey)
console.log('Service Key exists:', !!supabaseServiceKey)
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Try with anon key first (public access)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Try with service role key (admin access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testWithAnonKey() {
  console.log('🔓 Testing with ANON key (public access)...')
  
  try {
    const { count, error: countError } = await supabaseAnon
      .from('schools')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Anon Count Error:', countError.message)
      return false
    }
    
    console.log(`✅ Schools table accessible with anon key: ${count} records`)
    
    // Get sample data
    const { data, error } = await supabaseAnon
      .from('schools')
      .select('id, name, city, type, student_count')
      .limit(3)
    
    if (error) {
      console.log('❌ Anon Sample Error:', error.message)
      return false
    }
    
    console.log('\n📋 Sample schools (anon access):')
    data.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (${school.type}) - ${school.city} - ${school.student_count} students`)
    })
    
    return true
  } catch (error) {
    console.log('❌ Anon Unexpected Error:', error.message)
    return false
  }
}

async function testWithServiceKey() {
  console.log('\n🔑 Testing with SERVICE ROLE key (admin access)...')
  
  try {
    const { count, error: countError } = await supabaseAdmin
      .from('schools')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Service Count Error:', countError.message)
      return false
    }
    
    console.log(`✅ Schools table accessible with service key: ${count} records`)
    
    // Get sample data with more fields
    const { data, error } = await supabaseAdmin
      .from('schools')
      .select('id, name, city, type, student_count, teacher_count, established_year')
      .limit(3)
    
    if (error) {
      console.log('❌ Service Sample Error:', error.message)
      return false
    }
    
    console.log('\n📋 Sample schools (admin access):')
    data.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (${school.type}) - ${school.city}`)
      console.log(`   Students: ${school.student_count}, Teachers: ${school.teacher_count}, Est: ${school.established_year}`)
    })
    
    return true
  } catch (error) {
    console.log('❌ Service Unexpected Error:', error.message)
    return false
  }
}

async function checkOtherTables() {
  console.log('\n🔍 Checking other tables with service key...')
  
  const tables = ['profiles', 'favorites', 'school_images', 'search_tracking']
  
  for (const table of tables) {
    try {
      const { count, error } = await supabaseAdmin
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

// Run all tests
async function runTests() {
  const anonWorks = await testWithAnonKey()
  const serviceWorks = await testWithServiceKey()
  
  if (anonWorks || serviceWorks) {
    await checkOtherTables()
    console.log('\n🎉 Database is working! Ready to proceed with the application.')
  } else {
    console.log('\n❌ Neither key worked. Check your Supabase setup.')
  }
}

runTests().catch(error => {
  console.error('❌ Script failed:', error)
})