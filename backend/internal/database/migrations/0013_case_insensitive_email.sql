-- One account per email address, whatever its case. New addresses are stored
-- lowercased (auth.normalizeEmail); this lowercases any older ones and makes
-- the database refuse "Ali@x.com" beside "ali@x.com", so a lookup by email can
-- never match two accounts.
--
-- If two existing accounts differ only in case, the UPDATE fails on the unique
-- email constraint and the migration stops; merge or delete one by hand first.

UPDATE users SET email = lower(trim(email)), updated_at = now()
WHERE email <> lower(trim(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));
