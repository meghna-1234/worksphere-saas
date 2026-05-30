/*
  # Feed likes and comments counters

  Keep posts.likes_count and posts.comments_count synchronized whenever
  authenticated users like or comment on public feed posts.
*/

CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET likes_count = (
      SELECT count(*)::integer FROM likes WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE posts
  SET likes_count = (
    SELECT count(*)::integer FROM likes WHERE post_id = OLD.post_id
  )
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET comments_count = (
      SELECT count(*)::integer FROM comments WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE posts
  SET comments_count = (
    SELECT count(*)::integer FROM comments WHERE post_id = OLD.post_id
  )
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_post_like_count ON likes;
CREATE TRIGGER sync_post_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

DROP TRIGGER IF EXISTS sync_post_comment_count ON comments;
CREATE TRIGGER sync_post_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS comments_content_not_empty;

ALTER TABLE comments
  ADD CONSTRAINT comments_content_not_empty
  CHECK (length(btrim(content)) > 0) NOT VALID;
