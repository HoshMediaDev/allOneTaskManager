/*
  # Add auth context function
  
  1. Changes
    - Add function to set auth context variables
    - Grant execute permissions
    
  2. Security
    - Function is accessible to authenticated users only
*/

-- Create function to set auth context
CREATE OR REPLACE FUNCTION public.set_auth_context(location_id text, user_email text)
RETURNS void AS $$
BEGIN
  -- Set configuration variables
  PERFORM set_config('app.location_id', location_id, true);
  PERFORM set_config('app.user_email', user_email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_auth_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_auth_context TO anon;

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';