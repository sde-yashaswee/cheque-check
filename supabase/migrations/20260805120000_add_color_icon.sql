-- Migration: Add color and icon to businesses, parties, and banks
ALTER TABLE businesses ADD COLUMN color TEXT DEFAULT '#007AFF';
ALTER TABLE businesses ADD COLUMN icon TEXT;

ALTER TABLE parties ADD COLUMN color TEXT DEFAULT '#34C759';
ALTER TABLE parties ADD COLUMN icon TEXT;

ALTER TABLE banks ADD COLUMN color TEXT DEFAULT '#5856D6';
ALTER TABLE banks ADD COLUMN icon TEXT;
