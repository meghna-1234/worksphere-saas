/*
  # Feed author visibility

  Public feed posts need to show the author's display name to every
  authenticated user. The original profile SELECT policy only exposed the
  viewer's own profile, so other users' posts could not reliably render names.
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_content_not_empty;

ALTER TABLE posts
  ADD CONSTRAINT posts_content_not_empty
  CHECK (length(btrim(content)) > 0) NOT VALID;
