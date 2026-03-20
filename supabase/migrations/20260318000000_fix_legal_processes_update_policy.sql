-- Migration: fix_legal_processes_update_policy
-- Feature: 001-legal-summaries
-- Purpose: Fix broken UPDATE RLS policy on legal_processes
-- Date: 2026-03-18
--
-- Problem: The previous WITH CHECK clause used "WHERE id = id" which always evaluates
-- to TRUE (compares the column to itself), causing PostgreSQL to return all rows.
-- With more than one process in the table, this throws:
--   ERROR: more than one row returned by a subquery used as an expression
-- Additionally the intent (prevent status changes) was wrong — status transitions
-- are handled exclusively by the Edge Function (service role, bypasses RLS).
-- Regular users only need to update their own rows (e.g., to reset status for retry).

DROP POLICY IF EXISTS "Users update own processes" ON public.legal_processes;

CREATE POLICY "Users update own processes"
    ON public.legal_processes FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
