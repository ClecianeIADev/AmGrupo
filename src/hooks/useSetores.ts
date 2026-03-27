// useSetores hook — CRUD + count + manager info (003-rh-module Parte 3)

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Setor, SectorWithCount, Profissional, CreateSetorDTO } from '../types/rh'

interface UseSetoresReturn {
  setores: SectorWithCount[]
  loading: boolean
  error: string | null
  profissionais: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>[]
  createSetor: (data: CreateSetorDTO) => Promise<void>
  updateSetor: (id: string, data: Partial<CreateSetorDTO>) => Promise<void>
  deleteSetor: (id: string) => Promise<void>
}

export function useSetores(): UseSetoresReturn {
  const [setores, setSetores] = useState<SectorWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profissionais, setProfissionais] = useState<
    Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>[]
  >([])

  // ── Fetch all setores enriched with count + manager ────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado.')

      // Fetch setores
      const { data: rawSetores, error: setoresErr } = await supabase
        .from('setores')
        .select('id, user_id, name, manager_id, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (setoresErr) throw setoresErr

      // Fetch profissionais (for count + manager info + drawer autocomplete)
      const { data: rawProfs, error: profsErr } = await supabase
        .from('profissionais')
        .select('id, setor_id, nome_completo, foto_url')
        .eq('user_id', user.id)

      if (profsErr) throw profsErr

      const profs = (rawProfs ?? []) as Array<{
        id: string
        setor_id: string | null
        nome_completo: string
        foto_url: string | null
      }>

      // Build lookup maps
      const countMap = new Map<string, number>()
      const managerMap = new Map<string, Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>>()

      for (const p of profs) {
        if (p.setor_id) countMap.set(p.setor_id, (countMap.get(p.setor_id) ?? 0) + 1)
        managerMap.set(p.id, { id: p.id, nome_completo: p.nome_completo, foto_url: p.foto_url })
      }

      const enriched: SectorWithCount[] = (rawSetores ?? []).map((s: Setor) => ({
        ...s,
        profissionais_count: countMap.get(s.id) ?? 0,
        manager: s.manager_id ? managerMap.get(s.manager_id) : undefined,
      }))

      setSetores(enriched)
      setProfissionais(profs.map(p => ({ id: p.id, nome_completo: p.nome_completo, foto_url: p.foto_url })))
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro ao carregar setores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const channel = supabase
      .channel('setores_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'setores' }, () => {
        fetchAll(true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profissionais' }, () => {
        fetchAll(true)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  // ── Create ─────────────────────────────────────────────────────────────────
  const createSetor = useCallback(async (data: CreateSetorDTO) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado.')

      const { error: err } = await supabase
        .from('setores')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          manager_id: data.manager_id ?? null,
          status: data.status ?? true,
        })

      if (err) throw err
      await fetchAll(true)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro ao criar setor.')
    }
  }, [fetchAll])

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateSetor = useCallback(async (id: string, data: Partial<CreateSetorDTO>) => {
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      if (data.name !== undefined) payload.name = data.name.trim()
      if (data.manager_id !== undefined) payload.manager_id = data.manager_id
      if (data.status !== undefined) payload.status = data.status

      const { error: err } = await supabase
        .from('setores')
        .update(payload)
        .eq('id', id)

      if (err) throw err
      setSetores(prev => prev.map(s => {
        if (s.id !== id) return s
        const updated = { ...s, ...payload }
        const manager = data.manager_id !== undefined
          ? profissionais.find(p => p.id === data.manager_id)
          : s.manager
        return { ...updated, manager }
      }))
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro ao atualizar setor.')
    }
  }, [profissionais])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteSetor = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: err } = await supabase
        .from('setores')
        .delete()
        .eq('id', id)

      if (err) throw err
      setSetores(prev => prev.filter(s => s.id !== id))
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erro ao excluir setor.')
    }
  }, [])

  return { setores, loading, error, profissionais, createSetor, updateSetor, deleteSetor }
}
