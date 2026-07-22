CREATE TABLE publication_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id),
    reactions BIGINT NOT NULL DEFAULT 0 CHECK (reactions >= 0),
    reach BIGINT NOT NULL DEFAULT 0 CHECK (reach >= 0),
    saves BIGINT NOT NULL DEFAULT 0 CHECK (saves >= 0),
    shares BIGINT NOT NULL DEFAULT 0 CHECK (shares >= 0),
    comments BIGINT NOT NULL DEFAULT 0 CHECK (comments >= 0),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_publication_metric_account UNIQUE (publication_id, social_account_id)
);

CREATE INDEX idx_metrics_publication ON publication_metrics(publication_id);
CREATE INDEX idx_metrics_account ON publication_metrics(social_account_id);
CREATE INDEX idx_metrics_updated_at ON publication_metrics(updated_at);
