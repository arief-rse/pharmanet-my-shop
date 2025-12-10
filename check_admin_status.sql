-- CHECK ADMIN USER STATUS
-- Run this to verify admin accounts

-- Check all users and their roles
SELECT
  u.id,
  u.email,
  u.created_at as auth_created,
  p.full_name,
  p.role,
  p.is_approved,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.created_at DESC;

-- Check specifically for admin users
SELECT
  u.email,
  p.role,
  p.is_approved,
  CASE
    WHEN p.role = 'admin' THEN '✅ Admin User'
    ELSE '❌ Not Admin'
  END as admin_status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- Check vendor applications pending approval
SELECT
  id,
  user_id,
  business_name,
  status,
  created_at
FROM public.vendor_applications
WHERE status = 'pending'
ORDER BY created_at DESC;