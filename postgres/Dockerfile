FROM postgres:16.0

# adding our tables using dockerfile 
ADD /tables/ /docker-entrypoint-initdb.d/tables/
ADD deploy_schemas.sql /docker-entrypoint-initdb.d/