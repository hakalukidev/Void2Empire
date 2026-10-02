-- Sign in with Google. google_sub is Google's stable account id (the ID
-- token's `sub`); email can change on Google's side, sub never does.
--
-- Accounts created through Google have no password: password_hash is left
-- empty, which bcrypt can never match, so password login stays closed for them.

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;
