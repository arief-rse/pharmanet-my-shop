# Create Admin User Guide

## 📧 Creating Admin User: myadmin@yopmail.com

### Method 1: Using the Application (Recommended)

#### Step 1: Sign Up the User
1. Go to your application at `http://localhost:8080/auth`
2. Click "Sign Up"
3. Fill in the form:
   - **Email**: `myadmin@yopmail.com`
   - **Password**: Choose a secure password
   - **Full Name**: `My Admin`
   - **Role**: Select "Consumer" (we'll change this to admin later)
4. Complete the signup process

#### Step 2: Update Role to Admin
After the user is created, you need to update their role to admin. You can do this in two ways:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase dashboard
2. Navigate to Table Editor → `profiles` table
3. Find the user with email `myadmin@yopmail.com`
4. Edit the row and change:
   - `role` → `admin`
   - `is_approved` → `true`
5. Save the changes

**Option B: Using SQL in Supabase Dashboard**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run this query:
```sql
UPDATE profiles 
SET role = 'admin', is_approved = true 
WHERE email = 'myadmin@yopmail.com';
```

### Method 2: Using Supabase CLI (Alternative)

If you have Supabase CLI access, you can run:

```bash
# Connect to your Supabase project
supabase db push

# Run the SQL command
supabase db sql --execute "
UPDATE profiles 
SET role = 'admin', is_approved = true 
WHERE email = 'myadmin@yopmail.com';
"
```

### Method 3: Direct SQL Insert (Advanced)

If the user doesn't exist yet, you can create them directly via SQL:

```sql
-- First, you need to create the auth user (this requires admin access)
-- This is typically done through Supabase Auth Admin API

-- Then update the profile
INSERT INTO profiles (id, email, full_name, role, is_approved)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'myadmin@yopmail.com'),
  'myadmin@yopmail.com',
  'My Admin',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_approved = true;
```

## ✅ Verification

After creating the admin user, verify it works:

1. **Sign in** with `myadmin@yopmail.com`
2. **Navigate to** `/admin` 
3. **Check access** - you should see the full admin dashboard
4. **Test features**:
   - Product management
   - User management
   - Vendor applications
   - Order management

## 🔐 Admin Capabilities

Once the admin user is created, they will have access to:

- **Product Management**: Add, edit, delete, verify products
- **User Management**: View all users, change roles
- **Vendor Applications**: Approve/reject vendor applications
- **Order Management**: View and manage all orders
- **System Analytics**: Dashboard with key metrics

## 🚨 Security Notes

- Use a strong password for admin accounts
- Consider enabling 2FA if available
- Regularly audit admin access
- Keep admin credentials secure

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify the user exists in the `profiles` table
3. Ensure the `role` field is set to `'admin'`
4. Check that `is_approved` is `true` 