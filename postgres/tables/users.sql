-- starting transaction which upon failure doesn't create table below
BEGIN TRANSACTION;
CREATE TABLE users (
    id serial PRIMARY KEY,
    name VARCHAR(100),
    email text UNIQUE NOT NULL,
    entries BIGINT DEFAULT 0,
    joined TIMESTAMP NOT NULL,
    verification_token VARCHAR(240),
    email_verified BOOLEAN,
    profile_img BYTEA
);

COMMIT;