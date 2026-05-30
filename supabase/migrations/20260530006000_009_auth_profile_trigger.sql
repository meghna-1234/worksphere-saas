/*
  # Auth profile bootstrap

  Creates an application profile whenever a user signs up. This keeps signup
  working whether email confirmation is enabled or disabled.
*/

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    coalesce(nullif(NEW.raw_user_meta_data->>'name', ''), split_part(NEW.email, '@', 1)),
    coalesce(nullif(NEW.raw_user_meta_data->>'role', ''), 'student')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_profile_after_auth_signup ON auth.users;
CREATE TRIGGER create_profile_after_auth_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();
