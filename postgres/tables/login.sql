-- starting transaction which upon failure doesn't create table below
BEGIN TRANSACTION;
CREATE TABLE login (
    id serial PRIMARY KEY,
    hash VARCHAR(100) NOT NULL,
    email text UNIQUE NOT NULL
);

COMMIT;