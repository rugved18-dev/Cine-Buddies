-- Migration V2: Convert custom PostgreSQL ENUM types to standard VARCHAR
-- Resolves JPA/Hibernate type mismatch with PostgreSQL PgBouncer pooler

-- 1. room_content_types
ALTER TABLE room_content_types 
    ALTER COLUMN content_type TYPE VARCHAR(50) USING content_type::text;

-- 2. movies
ALTER TABLE movies 
    ALTER COLUMN type TYPE VARCHAR(50) USING type::text;

-- 3. member_preferences
ALTER TABLE member_preferences 
    ALTER COLUMN release_period DROP DEFAULT;

ALTER TABLE member_preferences 
    ALTER COLUMN release_period TYPE VARCHAR(50) USING release_period::text;

ALTER TABLE member_preferences 
    ALTER COLUMN release_period SET DEFAULT 'ANY_YEAR';

-- 4. votes
ALTER TABLE votes 
    ALTER COLUMN choice TYPE VARCHAR(50) USING choice::text;

