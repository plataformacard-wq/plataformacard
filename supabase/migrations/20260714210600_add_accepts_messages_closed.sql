-- Migration: Add accepts_messages_when_closed to profiles
-- Description: Allows sellers to disable whatsapp messages when they are closed/unavailable.

ALTER TABLE profiles
ADD COLUMN accepts_messages_when_closed BOOLEAN DEFAULT TRUE;
