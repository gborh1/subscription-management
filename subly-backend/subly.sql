\echo 'Delete and recreate subly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE subly;
CREATE DATABASE subly;
\connect subly

\i subly-schema.sql
\i subly-seed.sql

\echo 'Delete and recreate subly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE subly_test;
CREATE DATABASE subly_test;
\connect subly_test

\i subly-schema.sql