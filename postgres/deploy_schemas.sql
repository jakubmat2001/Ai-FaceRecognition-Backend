-- This file sits at our root and deploys our database tables

\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'