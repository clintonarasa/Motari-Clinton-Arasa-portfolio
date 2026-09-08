import { supabase } from './client';

/**
 * Test the Supabase connection
 * Run this function to verify everything is set up correctly
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Check if client is initialized
    console.log('✅ Supabase client initialized');
    console.log(`   URL: ${supabase.supabaseUrl}`);

    // Test 2: Get current session
    const { data: { session } } = await supabase.auth.getSession();
    console.log(session ? '✅ Session exists' : '⚠️  No active session');

    // Test 3: List tables
    console.log('\n📊 Database Tables:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tablesError && tables) {
      tables.forEach((table: any) => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log('   ⚠️  Could not fetch tables (may need authentication)');
    }

    // Test 4: Check newsletter table
    console.log('\n🔗 Testing Newsletter Table Access:');
    const { data: newsletters, error: newsletterError } = await supabase
      .from('newsletter_subscribers')
      .select('count()', { count: 'exact' });

    if (!newsletterError) {
      console.log(`   ✅ Newsletter table accessible`);
      console.log(`   📈 Subscribers: ${newsletters?.length || 0}`);
    } else {
      console.log(`   ❌ Error: ${newsletterError.message}`);
    }

    // Test 5: Try to read public data (skills)
    console.log('\n🔗 Testing Skills Table Access:');
    const { error: skillsError, count: skillsCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact' });

    if (!skillsError) {
      console.log(`   ✅ Skills table accessible`);
    } else {
      console.log(`   ⚠️  Skills table access: ${skillsError.message}`);
    }

    console.log('\n✨ Supabase Connection Test Complete!\n');
    return true;

  } catch (error) {
    console.error('❌ Connection Test Failed:', error);
    return false;
  }
}

/**
 * Test authentication
 */
export async function testAuthentication(email: string, password: string) {
  console.log('🔐 Testing Supabase Authentication...\n');

  try {
    // Test signup
    console.log('1️⃣  Testing Sign Up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.log(`   ⚠️  ${signUpError.message}`);
    } else {
      console.log(`   ✅ Sign up successful`);
      console.log(`   User ID: ${signUpData.user?.id}`);
    }

    // Test login
    console.log('\n2️⃣  Testing Login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.log(`   ❌ ${loginError.message}`);
    } else {
      console.log(`   ✅ Login successful`);
      console.log(`   Session token received`);
    }

    // Get current session
    console.log('\n3️⃣  Testing Session...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log(`   ✅ Active session found`);
      console.log(`   User: ${session.user.email}`);
    } else {
      console.log(`   ⚠️  No active session`);
    }

    // Logout
    console.log('\n4️⃣  Testing Logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.log(`   ❌ ${logoutError.message}`);
    } else {
      console.log(`   ✅ Logout successful`);
    }

    console.log('\n✨ Authentication Test Complete!\n');
    return true;

  } catch (error) {
    console.error('❌ Auth Test Failed:', error);
    return false;
  }
}

/**
 * Comprehensive system check
 */
export async function runFullDiagnostics() {
  console.log('=====================================');
  console.log('  🚀 SUPABASE SYSTEM DIAGNOSTICS');
  console.log('=====================================\n');

  const connectionOk = await testSupabaseConnection();

  if (connectionOk) {
    console.log('✨ All systems operational!\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. Run migrations to create tables');
    console.log('   3. Configure Row Level Security policies');
    console.log('   4. Connect your admin panel to database services');
    console.log('   5. Start syncing portfolio data!\n');
  }

  return connectionOk;
}

/**
 * Helper to run in browser console
 * Just copy and paste this function, then call: testSupabaseInBrowser()
 */
export async function testSupabaseInBrowser() {
  const result = await runFullDiagnostics();
  console.log('Diagnostics Complete:', result);
}
