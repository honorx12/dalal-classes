-- Function to get all users with their emails for admin dashboard
-- Uses SECURITY DEFINER to access auth.users table
CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    au.email,
    p.is_admin,
    p.created_at
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get enrollments with user emails for admin dashboard
CREATE OR REPLACE FUNCTION public.get_enrollments_with_user_emails(limit_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  course_id UUID,
  progress INTEGER,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_full_name TEXT,
  user_email TEXT,
  course_title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.user_id,
    e.course_id,
    e.progress,
    e.enrolled_at,
    e.completed_at,
    p.full_name as user_full_name,
    au.email as user_email,
    c.title as course_title
  FROM enrollments e
  JOIN profiles p ON p.id = e.user_id
  JOIN auth.users au ON au.id = p.id
  JOIN courses c ON c.id = e.course_id
  ORDER BY e.enrolled_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_with_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_enrollments_with_user_emails(INT) TO authenticated;