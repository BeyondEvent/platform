-- Runs on first container start when the data volume is empty.
-- Schema migrations are managed by Drizzle Kit — do not add tables here.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
