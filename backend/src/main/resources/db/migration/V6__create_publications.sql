-- ============================================================
-- Community Manager module: social accounts + publications
-- Normalized to 3NF (lookup tables for platform and content type
-- avoid transitive dependencies; N:M via junction table).
-- ============================================================

-- Lookup: social media platforms (Instagram, Facebook, TikTok)
CREATE TABLE platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Lookup: publication content types (Imagen, Reel, Video, Carrusel, Historia)
CREATE TABLE content_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Social media accounts managed by the Community Manager (RF-B-01)
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES platforms(id),
    account_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_accounts_platform ON social_accounts(platform_id);
CREATE INDEX idx_social_accounts_status ON social_accounts(status);
CREATE INDEX idx_social_accounts_name ON social_accounts(account_name);

-- Sensitive credentials kept in a separate 1:1 table (encrypted, never
-- returned in general listings). RF-B-01 / RF-C-01.
CREATE TABLE social_account_credentials (
    social_account_id UUID PRIMARY KEY REFERENCES social_accounts(id) ON DELETE CASCADE,
    access_username_encrypted TEXT NOT NULL,
    access_secret_encrypted TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Publications (RF-B-02, RF-B-04, RF-B-06, RF-B-07, RF-B-08)
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    additional_info TEXT,
    budget NUMERIC(12, 2),
    content_type_id UUID NOT NULL REFERENCES content_types(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    evidence_link VARCHAR(500),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_scheduled_at ON publications(scheduled_at);
CREATE INDEX idx_publications_published_at ON publications(published_at);
CREATE INDEX idx_publications_content_type ON publications(content_type_id);
CREATE INDEX idx_publications_title ON publications(title);

-- N:M relation between a publication and its target social accounts (RF-B-03)
CREATE TABLE publication_social_accounts (
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id),
    PRIMARY KEY (publication_id, social_account_id)
);

CREATE INDEX idx_pub_social_accounts_account ON publication_social_accounts(social_account_id);

-- Media files attached to a publication (RF-B-02). File storage is a later
-- phase; here we persist the reference/URL only.
CREATE TABLE publication_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publication_media_publication ON publication_media(publication_id);

-- ---------------- Seed reference catalogs ----------------
INSERT INTO platforms (code, name) VALUES
    ('INSTAGRAM', 'Instagram'),
    ('FACEBOOK', 'Facebook'),
    ('TIKTOK', 'TikTok');

INSERT INTO content_types (code, name) VALUES
    ('IMAGE', 'Imagen'),
    ('REEL', 'Reel'),
    ('VIDEO', 'Video'),
    ('CAROUSEL', 'Carrusel'),
    ('STORY', 'Historia');
