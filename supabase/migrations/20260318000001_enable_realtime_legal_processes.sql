-- Migration: enable_realtime_legal_processes
-- Feature: 001-legal-summaries
-- Purpose: Add legal_processes to the Supabase Realtime publication.
--          Without this, postgres_changes subscriptions silently receive no events.
-- Date: 2026-03-18

ALTER PUBLICATION supabase_realtime ADD TABLE public.legal_processes;
