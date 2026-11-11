CREATE TABLE rooms (
  code TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  members TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX rooms_updated_at_idx ON rooms(updated_at);
