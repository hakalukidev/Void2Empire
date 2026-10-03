-- Profile picture. Filled from the Google ID token's `picture` claim on each
-- Google sign-in; NULL for accounts that have none.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
