CREATE TYPE content_type_enum AS ENUM ('MOVIES', 'TV_SERIES', 'WEB_SERIES');
CREATE TYPE vote_choice_enum AS ENUM ('YES', 'MAYBE', 'NO');
CREATE TYPE release_period_enum AS ENUM ('ANY_YEAR', 'LAST_5_YEARS', 'LAST_10_YEARS', 'CLASSIC');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_finalized BOOLEAN DEFAULT FALSE,
    winner_movie_id VARCHAR(100)
);

CREATE TABLE room_content_types (
    room_code VARCHAR(10) REFERENCES rooms(code) ON DELETE CASCADE,
    content_type content_type_enum NOT NULL,
    PRIMARY KEY (room_code, content_type)
);

CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) REFERENCES rooms(code) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    display_name VARCHAR(100) NOT NULL,
    is_host BOOLEAN DEFAULT FALSE,
    has_joined BOOLEAN DEFAULT TRUE,
    preferences_submitted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_room_member UNIQUE (room_code, user_id)
);

CREATE TABLE member_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_member_id UUID UNIQUE REFERENCES room_members(id) ON DELETE CASCADE,
    min_rating NUMERIC(3, 1) DEFAULT 0.0 CHECK (min_rating >= 0.0 AND min_rating <= 10.0),
    release_period release_period_enum DEFAULT 'ANY_YEAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preference_genres (
    preference_id UUID REFERENCES member_preferences(id) ON DELETE CASCADE,
    genre VARCHAR(50) NOT NULL,
    PRIMARY KEY (preference_id, genre)
);

CREATE TABLE preference_excluded_genres (
    preference_id UUID REFERENCES member_preferences(id) ON DELETE CASCADE,
    genre VARCHAR(50) NOT NULL,
    PRIMARY KEY (preference_id, genre)
);

CREATE TABLE preference_languages (
    preference_id UUID REFERENCES member_preferences(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    PRIMARY KEY (preference_id, language)
);

CREATE TABLE preference_watched_titles (
    preference_id UUID REFERENCES member_preferences(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (preference_id, title)
);

CREATE TABLE movies (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INT NOT NULL,
    type content_type_enum NOT NULL,
    language VARCHAR(50) NOT NULL,
    rating NUMERIC(3, 1) NOT NULL,
    runtime VARCHAR(50) NOT NULL,
    overview TEXT NOT NULL,
    poster_path VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movie_genres (
    movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
    genre VARCHAR(50) NOT NULL,
    PRIMARY KEY (movie_id, genre)
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) REFERENCES rooms(code) ON DELETE CASCADE,
    movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
    room_member_id UUID REFERENCES room_members(id) ON DELETE CASCADE,
    choice vote_choice_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_member_movie_vote UNIQUE (room_code, movie_id, room_member_id)
);

