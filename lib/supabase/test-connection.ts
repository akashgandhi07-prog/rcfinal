// Test connection to Supabase
// Run this to verify your Supabase connection is working

import { supabase } from './client'

export async function testSupabaseConnection() {
  try {
    // Test 1: Check if we can reach Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err)
    return { success: false, error: String(err) }
  }
}

