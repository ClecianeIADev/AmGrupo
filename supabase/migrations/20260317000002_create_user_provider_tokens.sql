-- Migration: user_provider_tokens
-- Purpose: Persist Google OAuth provider_token server-side so Edge Functions
--          can call Gmail API without the frontend ever forwarding the token.
-- Date: 2026-03-17

-- ============================================================
-- TABLE: user_provider_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_provider_tokens (
    user_id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    provider                TEXT NOT NULL DEFAULT 'google',
    provider_token          TEXT NOT NULL,
    provider_refresh_token  TEXT,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE TRIGGER trg_user_provider_tokens_updated_at
    BEFORE UPDATE ON public.user_provider_tokens
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.user_provider_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own provider tokens"
    ON public.user_provider_tokens FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users insert own provider tokens"
    ON public.user_provider_tokens FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own provider tokens"
    ON public.user_provider_tokens FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RPC: get_user_provider_token
-- Used by Edge Functions (fetch_gmail_inbox, send_gmail_reply)
-- SECURITY DEFINER so Edge Functions calling via user JWT can read the row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_provider_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    token TEXT;
BEGIN
    SELECT provider_token INTO token
    FROM public.user_provider_tokens
    WHERE user_id = auth.uid();

    RETURN token;
END;
$$;
