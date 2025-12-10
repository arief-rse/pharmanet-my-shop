#!/usr/bin/env node

/**
 * Script to create an admin user for PharmaNet
 * Usage: node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAdd these to your .env file');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = 'myadmin@yopmail.com';
  const adminPassword = 'AdminPass123!'; // Change this to a secure password
  const adminName = 'My Admin';

  try {
    console.log('🚀 Creating admin user...');
    
    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: adminName,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already exists, updating role...');
        
        // Get existing user
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === adminEmail);
        if (!existingUser) throw new Error('User not found');
        
        // Update the profile to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            is_approved: true,
            full_name: adminName
          })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;
        
        console.log('✅ Successfully updated existing user to admin role');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`👤 Name: ${adminName}`);
        console.log(`🔑 Role: admin`);
        return;
      } else {
        throw authError;
      }
    }

    console.log('✅ Auth user created successfully');

    // Step 2: Update the profile to admin role (should be automatic via trigger, but let's ensure)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        is_approved: true 
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.warn('⚠️  Profile update warning:', profileError.message);
      // This might fail if the trigger already set the role correctly
    }

    console.log('🎉 Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔒 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminName}`);
    console.log(`🔑 Role: admin`);
    console.log(`🆔 User ID: ${authData.user.id}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Sign in with the credentials above');
    console.log('2. Navigate to /admin to access the admin panel');
    console.log('3. Change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('service_role')) {
      console.error('\n💡 Tip: You need the SUPABASE_SERVICE_ROLE_KEY');
      console.error('   Find it in your Supabase dashboard → Settings → API');
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser(); 