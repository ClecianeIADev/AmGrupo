import React, { useState, useEffect } from 'react';
import {
  Building, Plus, Mail, Info, FileSignature, Folder, MailCheck,
  Search, RefreshCw, Calendar, User, FileEdit, UploadCloud,
  FileText as FileTextIcon, X, Paperclip, ArrowLeft, Clock, Pencil, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export function NegotiationDetail({ opportunityId, onBack }: { opportunityId?: string, onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [opportunity, setOpportunity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [isSavingTag, setIsSavingTag] = useState(false);

  // Edit Opportunity Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [availableOrigins, setAvailableOrigins] = useState<any[]>([]);
  const [mockOwners] = useState(['Alex Moraes', 'Sarah Jenkins', 'David Rogers', 'Michael Chen']);

  // Comarcas state
  const [isComarcaModalOpen, setIsComarcaModalOpen] = useState(false);
  const [comarcaFormData, setComarcaFormData] = useState<any>({});
  const [isSavingComarca, setIsSavingComarca] = useState(false);
  const [editingComarcaId, setEditingComarcaId] = useState<string | null>(null);
  const [comarcaDocumentFile, setComarcaDocumentFile] = useState<File | null>(null);

  // Documents state
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentFormData, setDocumentFormData] = useState<any>({});
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');

  const stages = [
    { id: 'Lead', title: 'Lead' },
    { id: 'Contato Realizado', title: 'Contato Realizado' },
    { id: 'Proposta Enviada', title: 'Proposta Enviada' },
    { id: 'Negociação', title: 'Negociação' },
    { id: 'Fechado', title: 'Fechado' },
  ];

  const fetchOpp = async () => {
    setIsLoading(true);
    if (!opportunityId) {
      setIsLoading(false);
      return;
    }

    try {
      const [oppRes, activitiesRes] = await Promise.all([
        supabase
          .from('opportunities')
          .select(`
            *,
            client:clients(id, name, address, onde_esta),
            opportunity_origins(lead_origins(id, name)),
            opportunity_tags(tags(id, name)),
            opportunity_comarcas(comarcas(*)),
            opportunity_documents(*)
          `)
          .eq('id', opportunityId)
          .single(),
        supabase
          .from('activity_history')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .order('created_at', { ascending: false })
      ]);

      if (oppRes.data) {
        setOpportunity(oppRes.data);
        setEditedNotes(oppRes.data.notes || '');
      }
      if (activitiesRes.data) setActivities(activitiesRes.data);
      if (oppRes.error) throw oppRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpp();
  }, [opportunityId]);

  useEffect(() => {
    // Fetch lists
    const fetchLists = async () => {
      const [tagsRes, originsRes] = await Promise.all([
        supabase.from('tags').select('*').order('name'),
        supabase.from('lead_origins').select('*').order('name')
      ]);
      if (tagsRes.data) setAvailableTags(tagsRes.data);
      if (originsRes.data) setAvailableOrigins(originsRes.data);
    };
    fetchLists();
  }, []);

  useEffect(() => {
    // Hook up with Header button
    (window as any).openEditOpportunityModal = () => {
      if (!opportunity) return;

      // Initialize form data
      setEditFormData({
        value: opportunity.value || 0,
        expected_date: opportunity.expected_date || '',
        owner_name: opportunity.owner_name || '',
        primary_contact_name: opportunity.primary_contact_name || '',
        corporate_email: opportunity.corporate_email || '',
        notes: opportunity.notes || '',
        stage: opportunity.stage || 'Lead',
        selectedOriginIds: opportunity.opportunity_origins?.map((oo: any) => oo.lead_origins?.id).filter(Boolean) || [],
        selectedTagIds: opportunity.opportunity_tags?.map((ot: any) => ot.tags?.id).filter(Boolean) || [],

        // Temporarily store lists to manage dropdown
        newOriginId: '',
        newTagId: ''
      });
      setIsEditModalOpen(true);
    };

    return () => {
      delete (window as any).openEditOpportunityModal;
    };
  }, [opportunity]);

  const handleCurrencyChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setEditFormData({ ...editFormData, value: 0 });
      return;
    }
    const numericValue = parseInt(rawValue, 10) / 100;
    setEditFormData({ ...editFormData, value: numericValue });
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.description || !opportunityId) return;

    setIsSavingActivity(true);
    try {
      const { error } = await supabase.from('activity_history').insert({
        title: newActivity.title,
        description: newActivity.description,
        opportunity_id: opportunityId
      });
      if (error) throw error;

      setNewActivity({ title: '', description: '' });
      setIsActivityModalOpen(false);
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao salvar atividade: " + err.message);
    } finally {
      setIsSavingActivity(false);
    }
  };

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Não definida';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStrFormatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    return isToday ? `Hoje, ${timeStr}` : `${dateStrFormatted}, ${timeStr}`;
  };

  const getProbability = (stage: string | null | undefined) => {
    switch (stage) {
      case 'Lead': return 10;
      case 'Contato Realizado': return 25;
      case 'Proposta Enviada': return 50;
      case 'Negociação': return 75;
      case 'Fechado': return 100;
      default: return 10;
    }
  };

  const formatTimeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Sem edição anterior';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Convert to relative time
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Última edição há alguns segundos';
    if (diffMins < 60) return `Última edição há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Última edição há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Última edição ontem';
    if (diffDays < 30) return `Última edição há ${diffDays} dias`;

    return `Última edição em ${date.toLocaleDateString('pt-BR')}`;
  };

  const handleSaveNotes = async () => {
    if (editedNotes === opportunity?.notes || !opportunityId) {
      setIsEditingNotes(false);
      return;
    }

    setIsSavingNotes(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('opportunities')
        .update({ notes: editedNotes, updated_at: now })
        .eq('id', opportunityId);

      if (error) throw error;

      setOpportunity({ ...opportunity, notes: editedNotes, updated_at: now });
      setIsEditingNotes(false);
    } catch (err: any) {
      alert("Erro ao salvar observações: " + err.message);
      setEditedNotes(opportunity?.notes || ''); // revert on error
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveNotes();
    } else if (e.key === 'Escape') {
      setIsEditingNotes(false);
      setEditedNotes(opportunity?.notes || '');
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      setAvailableTags(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar tags: ", err.message);
    }
  };

  const openTagModal = () => {
    fetchAvailableTags();
    setIsTagModalOpen(true);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagId || !opportunityId) return;

    setIsSavingTag(true);
    try {
      // Check if tag is already added
      const existingTag = opportunity?.opportunity_tags?.find((ot: any) => ot.tags?.id === selectedTagId);
      if (existingTag) {
        alert("Esta tag já foi adicionada a esta oportunidade.");
        return;
      }

      const { error } = await supabase.from('opportunity_tags').insert({
        opportunity_id: opportunityId,
        tag_id: selectedTagId
      });

      if (error) throw error;

      setIsTagModalOpen(false);
      setSelectedTagId('');
      await fetchOpp(); // Refresh opportunity data
    } catch (err: any) {
      alert("Erro ao adicionar tag: " + err.message);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId) return;

    setIsSavingEdit(true);
    try {
      // 1. Update main record
      const { error: oppError } = await supabase.from('opportunities').update({
        value: editFormData.value,
        expected_date: editFormData.expected_date || null,
        owner_name: editFormData.owner_name || null,
        primary_contact_name: editFormData.primary_contact_name || null,
        corporate_email: editFormData.corporate_email || null,
        notes: editFormData.notes || null,
        stage: editFormData.stage,
        updated_at: new Date().toISOString()
      }).eq('id', opportunityId);

      if (oppError) throw oppError;

      // 2. Sync Origins
      const currentOrigins = opportunity.opportunity_origins?.map((o: any) => o.lead_origins?.id).filter(Boolean) || [];
      const newOrigins = editFormData.selectedOriginIds;

      const originsToAdd = newOrigins.filter((id: string) => !currentOrigins.includes(id));
      const originsToRemove = currentOrigins.filter((id: string) => !newOrigins.includes(id));

      if (originsToRemove.length > 0) {
        await supabase.from('opportunity_origins').delete()
          .eq('opportunity_id', opportunityId).in('origin_id', originsToRemove);
      }
      if (originsToAdd.length > 0) {
        await supabase.from('opportunity_origins').insert(
          originsToAdd.map((id: string) => ({ opportunity_id: opportunityId, origin_id: id }))
        );
      }

      // 3. Sync Tags
      const currentTags = opportunity.opportunity_tags?.map((t: any) => t.tags?.id).filter(Boolean) || [];
      const newTags = editFormData.selectedTagIds;

      const tagsToAdd = newTags.filter((id: string) => !currentTags.includes(id));
      const tagsToRemove = currentTags.filter((id: string) => !newTags.includes(id));

      if (tagsToRemove.length > 0) {
        await supabase.from('opportunity_tags').delete()
          .eq('opportunity_id', opportunityId).in('tag_id', tagsToRemove);
      }
      if (tagsToAdd.length > 0) {
        await supabase.from('opportunity_tags').insert(
          tagsToAdd.map((id: string) => ({ opportunity_id: opportunityId, tag_id: id }))
        );
      }

      // Update client stage if changed
      if (opportunity.stage !== editFormData.stage && opportunity.client_id) {
        await supabase.from('clients').update({
          onde_esta: `Comercial (${editFormData.stage})`
        }).eq('id', opportunity.client_id);
      }

      setIsEditModalOpen(false);
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao salvar alterações: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openAddComarcaModal = () => {
    setComarcaFormData({ name: '', address: '', shipping_option: 'Email' });
    setEditingComarcaId(null);
    setComarcaDocumentFile(null);
    setIsComarcaModalOpen(true);
  };

  const openEditComarcaModal = (comarca: any) => {
    setComarcaFormData({
      name: comarca.name || '',
      address: comarca.address || '',
      shipping_option: comarca.shipping_option || 'Email',
      document_url: comarca.document_url || null
    });
    setEditingComarcaId(comarca.id);
    setComarcaDocumentFile(null);
    setIsComarcaModalOpen(true);
  };

  const handleSaveComarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId) return;

    setIsSavingComarca(true);
    try {
      let documentUrl = null;

      // 1. Upload File if present
      if (comarcaDocumentFile) {
        const fileExt = comarcaDocumentFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${opportunityId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('comarca_documents')
          .upload(filePath, comarcaDocumentFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('comarca_documents')
          .getPublicUrl(filePath);
        documentUrl = publicUrlData.publicUrl;
      }

      if (editingComarcaId) {
        // Update existing
        const updateData: any = {
          name: comarcaFormData.name,
          address: comarcaFormData.address,
          shipping_option: comarcaFormData.shipping_option
        };
        if (documentUrl) updateData.document_url = documentUrl;

        const { error } = await supabase.from('comarcas')
          .update(updateData)
          .eq('id', editingComarcaId);
        if (error) throw error;
      } else {
        // Create new
        const { data: newComarca, error: createError } = await supabase.from('comarcas')
          .insert({
            name: comarcaFormData.name,
            address: comarcaFormData.address,
            shipping_option: comarcaFormData.shipping_option,
            document_url: documentUrl
          }).select().single();
        if (createError) throw createError;

        // Link
        const { error: linkError } = await supabase.from('opportunity_comarcas')
          .insert({ opportunity_id: opportunityId, comarca_id: newComarca.id });
        if (linkError) throw linkError;
      }

      setIsComarcaModalOpen(false);
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao salvar comarca: " + err.message);
    } finally {
      setIsSavingComarca(false);
    }
  };

  const handleDeleteComarca = async (comarcaId: string) => {
    if (!confirm('Deseja realmente remover esta comarca da oportunidade?')) return;
    try {
      const { error } = await supabase.from('opportunity_comarcas')
        .delete()
        .eq('opportunity_id', opportunityId)
        .eq('comarca_id', comarcaId);
      if (error) throw error;
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao remover comarca: " + err.message);
    }
  };

  const handleQuickDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, comarcaId: string) => {
    const file = e.target.files?.[0];
    if (!file || !opportunityId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${opportunityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comarca_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('comarca_documents')
        .getPublicUrl(filePath);

      const { error } = await supabase.from('comarcas')
        .update({ document_url: publicUrlData.publicUrl })
        .eq('id', comarcaId);

      if (error) throw error;

      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao enviar documento: " + err.message);
    }
  };

  const openAddDocumentModal = () => {
    setDocumentFormData({ name: '', description: '', document_date: new Date().toISOString().split('T')[0], responsible_name: '', status: 'Pendente' });
    setEditingDocumentId(null);
    setDocumentFile(null);
    setIsDocumentModalOpen(true);
  };

  const openEditDocumentModal = (doc: any) => {
    setDocumentFormData({
      name: doc.name || '',
      description: doc.description || '',
      document_date: doc.document_date || '',
      responsible_name: doc.responsible_name || '',
      status: doc.status || 'Pendente',
      file_url: doc.file_url || null
    });
    setEditingDocumentId(doc.id);
    setDocumentFile(null);
    setIsDocumentModalOpen(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId) return;

    setIsSavingDocument(true);
    try {
      let fileUrl = documentFormData.file_url;

      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${opportunityId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('opportunity_documents')
          .upload(filePath, documentFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('opportunity_documents')
          .getPublicUrl(filePath);
        fileUrl = publicUrlData.publicUrl;
      }

      const updateData: any = {
        opportunity_id: opportunityId,
        name: documentFormData.name,
        description: documentFormData.description,
        document_date: documentFormData.document_date || null,
        responsible_name: documentFormData.responsible_name,
        status: documentFormData.status
      };
      if (fileUrl) updateData.file_url = fileUrl;

      if (editingDocumentId) {
        const { error } = await supabase.from('opportunity_documents')
          .update(updateData)
          .eq('id', editingDocumentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('opportunity_documents')
          .insert(updateData);
        if (error) throw error;
      }

      setIsDocumentModalOpen(false);
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao salvar documento: " + err.message);
    } finally {
      setIsSavingDocument(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    try {
      const { error } = await supabase.from('opportunity_documents')
        .delete()
        .eq('id', docId);
      if (error) throw error;
      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao excluir documento: " + err.message);
    }
  };

  const handleQuickDocumentUploadForDoc = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (!file || !opportunityId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${opportunityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('opportunity_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('opportunity_documents')
        .getPublicUrl(filePath);

      const { error } = await supabase.from('opportunity_documents')
        .update({ file_url: publicUrlData.publicUrl })
        .eq('id', docId);

      if (error) throw error;

      await fetchOpp();
    } catch (err: any) {
      alert("Erro ao enviar documento: " + err.message);
    }
  };

  const removeListItem = (type: 'origin' | 'tag', idToRemove: string) => {
    if (type === 'origin') {
      setEditFormData({ ...editFormData, selectedOriginIds: editFormData.selectedOriginIds.filter((id: string) => id !== idToRemove) });
    } else {
      setEditFormData({ ...editFormData, selectedTagIds: editFormData.selectedTagIds.filter((id: string) => id !== idToRemove) });
    }
  };

  const addListItem = (type: 'origin' | 'tag') => {
    if (type === 'origin' && editFormData.newOriginId) {
      if (!editFormData.selectedOriginIds.includes(editFormData.newOriginId)) {
        setEditFormData({
          ...editFormData,
          selectedOriginIds: [...editFormData.selectedOriginIds, editFormData.newOriginId],
          newOriginId: ''
        });
      }
    } else if (type === 'tag' && editFormData.newTagId) {
      if (!editFormData.selectedTagIds.includes(editFormData.newTagId)) {
        setEditFormData({
          ...editFormData,
          selectedTagIds: [...editFormData.selectedTagIds, editFormData.newTagId],
          newTagId: ''
        });
      }
    }
  };

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </main>
    );
  }

  if (!opportunity) {
    return (
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Oportunidade não encontrada.</p>
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft size={16} /> Voltar para o Kanban
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Back Button */}
        {onBack && (
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={16} /> Voltar para o Kanban
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="flex flex-col gap-6">

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                    <Building size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{opportunity.client?.name || 'Cliente Desconhecido'}</h3>
                    <p className="text-sm text-slate-500">{opportunity.client?.address || 'Endereço não cadastrado'}</p>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  {opportunity.stage || 'Lead'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Valor Total</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(opportunity.value)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Previsão</p>
                  <p className="text-base font-semibold text-slate-700">{formatDate(opportunity.expected_date)}</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Probabilidade de Fechamento</span>
                  <span className="text-xs font-bold text-primary">{getProbability(opportunity?.stage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${getProbability(opportunity?.stage)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Activity History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Histórico de Atividades</h3>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                  title="Nova Atividade"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="relative pl-2 space-y-0 flex-1 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <Clock size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma atividade registrada.</p>
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={activity.id} className={`timeline-item relative pl-8 ${index === activities.length - 1 ? 'pb-0' : 'pb-8'} group`}>
                      <div className="absolute left-0 top-0 size-2 rounded-full bg-primary ring-4 ring-white"></div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">{activity.title}</span>
                          <span className="text-[10px] text-slate-400">{formatActivityTime(activity.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Tabs & Content) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="border-b border-slate-200">
              <nav aria-label="Tabs" className="flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('dados-gerais')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'dados-gerais' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <Info size={18} />
                  Dados Gerais
                </button>
                <button
                  onClick={() => setActiveTab('propostas')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'propostas' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <FileSignature size={18} />
                  Propostas
                  <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">2</span>
                </button>
                <button
                  onClick={() => setActiveTab('cartas')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'cartas' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <MailCheck size={18} />
                  Cartas de Apresentação
                </button>
                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'documentos' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <Folder size={18} />
                  Documentos
                  <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">5</span>
                </button>
              </nav>
            </div>

            {activeTab === 'dados-gerais' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Responsável</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <img src="https://i.pravatar.cc/150?u=alex" className="size-6 rounded-full object-cover border border-slate-300" />
                        </div>
                        <select
                          value={opportunity.owner_name || ''}
                          readOnly
                          className="block w-full pl-12 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white appearance-none"
                        >
                          <option value={opportunity.owner_name || ''}>{opportunity.owner_name || 'Não atribuído'}</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Origem do Lead</label>
                      <div className="flex flex-wrap gap-2 pt-1 border border-transparent">
                        {opportunity.opportunity_origins && opportunity.opportunity_origins.length > 0 ? (
                          opportunity.opportunity_origins.map((oo: any) => (
                            <span key={oo.lead_origins?.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                              {oo.lead_origins?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">Nenhuma origem selecionada.</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Nome do Contato Principal</label>
                      <input className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2.5" type="text" readOnly value={opportunity.primary_contact_name || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Email Corporativo</label>
                      <input className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2.5" type="email" readOnly value={opportunity.corporate_email || ''} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-slate-700">Observações da Negociação</label>
                      <span className="text-xs text-slate-400">
                        {isSavingNotes ? 'Salvando...' : formatTimeAgo(opportunity.updated_at || opportunity.created_at)}
                      </span>
                    </div>
                    <textarea
                      className={`block w-full rounded-lg shadow-sm sm:text-sm px-3 py-3 transition-colors ${isEditingNotes
                        ? 'border-primary ring-1 ring-primary bg-white cursor-text'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer'
                        }`}
                      rows={6}
                      readOnly={!isEditingNotes}
                      value={isEditingNotes ? editedNotes : (opportunity.notes || '')}
                      onClick={() => !isEditingNotes && setIsEditingNotes(true)}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      onKeyDown={handleNotesKeyDown}
                      onBlur={handleSaveNotes}
                      placeholder={isEditingNotes ? "Pressione Enter para salvar, ou Shift+Enter para nova linha" : "Clique para adicionar observações..."}
                    />
                    {isEditingNotes && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                        <span>Pressione <strong className="text-slate-600">Enter</strong> para salvar e <strong className="text-slate-600">Esc</strong> para cancelar</span>
                        <span><strong className="text-slate-600">Shift+Enter</strong> para pular linha</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Tags</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {opportunity.opportunity_tags && opportunity.opportunity_tags.length > 0 ? (
                        opportunity.opportunity_tags.map((ot: any) => (
                          <span key={ot.tags?.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {ot.tags?.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 inline-flex items-center pt-1">Nenhuma tag.</span>
                      )}
                      <button type="button" onClick={openTagModal} className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                        <Plus size={14} /> Adicionar Tag
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'cartas' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Gerenciar Comarcas</h2>
                      <p className="text-sm text-slate-500">Acompanhe o envio de cartas de apresentação por região.</p>
                    </div>
                    <button onClick={openAddComarcaModal} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 transition-all">
                      <Plus size={18} />
                      Adicionar Comarca
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100">
                    {opportunity.opportunity_comarcas && opportunity.opportunity_comarcas.length > 0 ? (
                      opportunity.opportunity_comarcas.map((oc: any) => {
                        const comarca = oc.comarcas;
                        if (!comarca) return null;
                        return (
                          <div key={comarca.id} className="flex items-center justify-between py-4 group hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-900">{comarca.name}</h4>
                                <span className="text-xs text-slate-500">{comarca.address || 'Sem endereço'}</span>
                              </div>
                            </div>
                            <div className={`flex items-center justify-end sm:pl-4 sm:border-l sm:border-slate-200 min-w-[200px] ${!comarca.document_url ? 'w-[250px]' : 'gap-2'}`}>
                              {comarca.document_url ? (
                                <>
                                  <a href={comarca.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors" title="Ver Arquivo">
                                    <FileTextIcon size={16} /> Visualizar
                                  </a>
                                  <button onClick={() => openEditComarcaModal(comarca)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                    <Pencil size={18} />
                                  </button>
                                  <button onClick={() => handleDeleteComarca(comarca.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex-1">
                                    <label className="block border border-dashed border-slate-300 rounded-lg p-3 w-full text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer group hover:border-primary/50 hover:bg-blue-50/50">
                                      <input type="file" className="hidden" onChange={(e) => handleQuickDocumentUpload(e, comarca.id)} />
                                      <UploadCloud size={20} className="mx-auto text-slate-400 mb-1 group-hover:text-primary transition-colors" />
                                      <span className="text-xs text-slate-500 font-medium">Arraste ou clique para anexar</span>
                                    </label>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button onClick={() => openEditComarcaModal(comarca)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                      <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteComarca(comarca.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-sm">Nenhuma comarca vinculada a esta proposta.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="w-full md:w-96 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
                      placeholder="Buscar documentos pelo nome..."
                      type="text"
                      value={documentSearchTerm}
                      onChange={(e) => setDocumentSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={openAddDocumentModal} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 transition-all">
                      <Plus size={18} />
                      Adicionar Documento
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {opportunity.opportunity_documents && opportunity.opportunity_documents.length > 0 ? (
                    opportunity.opportunity_documents
                      .filter((doc: any) => doc.name.toLowerCase().includes(documentSearchTerm.toLowerCase()))
                      .map((doc: any) => (
                        <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow group">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-slate-800">{doc.name}</h4>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${doc.status === 'Aprovado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                  {doc.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mb-2">{doc.description}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                {doc.document_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} /> {formatDate(doc.document_date)}
                                  </span>
                                )}
                                {doc.responsible_name && (
                                  <span className="flex items-center gap-1">
                                    <User size={14} /> Por: {doc.responsible_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center justify-end sm:pl-4 sm:border-l sm:border-slate-200 min-w-[200px] ${!doc.file_url ? 'w-[250px]' : 'gap-2'}`}>
                            {doc.file_url ? (
                              <>
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors">
                                  <FileTextIcon size={16} /> Visualizar
                                </a>
                                <button onClick={() => openEditDocumentModal(doc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                  <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                  <Trash2 size={18} />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 w-full">
                                <div className="flex-1">
                                  <label className="block border border-dashed border-slate-300 rounded-lg p-3 w-full text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer group hover:border-primary/50 hover:bg-blue-50/50">
                                    <input type="file" className="hidden" onChange={(e) => handleQuickDocumentUploadForDoc(e, doc.id)} />
                                    <UploadCloud size={20} className="mx-auto text-slate-400 mb-1 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-slate-500 font-medium">Arraste ou clique para anexar</span>
                                  </label>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button onClick={() => openEditDocumentModal(doc)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                    <Pencil size={18} />
                                  </button>
                                  <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">Nenhum documento encontrado.</div>
                  )}
                </div>
              </div>
            )}  </div>
        </div>
      </div>

      {/* Activity Modal */}
      {
        isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsActivityModalOpen(false)}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all z-10 relative flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Adicionar Nova Atividade</h2>
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Título da Atividade</label>
                    <input
                      type="text"
                      required
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      placeholder="Ex: Reunião de Alinhamento, Ligação Fria..."
                      className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Descrição Adicional</label>
                    <textarea
                      required
                      rows={5}
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      placeholder="Descreva os detalhes da atividade..."
                      className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingActivity || !newActivity.title || !newActivity.description}
                    className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    {isSavingActivity ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Atividade'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Tag Modal */}
      {
        isTagModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsTagModalOpen(false)}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10 relative flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Adicionar Tag</h2>
                <button
                  onClick={() => setIsTagModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTag} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Selecione uma tag</label>
                    <select
                      required
                      value={selectedTagId}
                      onChange={(e) => setSelectedTagId(e.target.value)}
                      className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2.5 bg-slate-50"
                    >
                      <option value="" disabled>Selecione...</option>
                      {availableTags.map((tag) => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsTagModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTag || !selectedTagId}
                    className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    {isSavingTag ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        Adicionando...
                      </>
                    ) : (
                      'Adicionar Tag'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Edit Opportunity Modal */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all z-10 relative flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Editar Detalhes da Proposta</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">

                  {/* Dados Gerais Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nome do Contato</label>
                      <input
                        type="text"
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={editFormData.primary_contact_name}
                        onChange={(e) => setEditFormData({ ...editFormData, primary_contact_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Corporativo</label>
                      <input
                        type="email"
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={editFormData.corporate_email}
                        onChange={(e) => setEditFormData({ ...editFormData, corporate_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Valor Total</label>
                      <input
                        type="text"
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={formatCurrency(editFormData.value || 0)}
                        onChange={handleCurrencyChangeEdit}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Previsão</label>
                      <input
                        type="date"
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={editFormData.expected_date}
                        onChange={(e) => setEditFormData({ ...editFormData, expected_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Responsável</label>
                      <select
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={editFormData.owner_name}
                        onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        {mockOwners.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fase</label>
                      <select
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={editFormData.stage}
                        onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                      >
                        {stages.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Observações da Negociação</label>
                    <textarea
                      rows={4}
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50 resize-none"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-6">
                    {/* Edit Origins */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Origens do Lead</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {editFormData.selectedOriginIds.map((id: string) => {
                          const origin = availableOrigins.find(o => o.id === id);
                          return origin ? (
                            <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {origin.name}
                              <button type="button" onClick={() => removeListItem('origin', id)} className="text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-full p-0.5"><X size={12} /></button>
                            </span>
                          ) : null;
                        })}
                        {editFormData.selectedOriginIds.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma origem selecionada.</span>}
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-2 py-1.5 bg-slate-50"
                          value={editFormData.newOriginId}
                          onChange={(e) => setEditFormData({ ...editFormData, newOriginId: e.target.value })}
                        >
                          <option value="">Adicionar origem...</option>
                          {availableOrigins.filter(o => !editFormData.selectedOriginIds.includes(o.id)).map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => addListItem('origin')} disabled={!editFormData.newOriginId} className="px-3 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50">Add</button>
                      </div>
                    </div>

                    {/* Edit Tags */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tags da Proposta</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {editFormData.selectedTagIds.map((id: string) => {
                          const tag = availableTags.find(t => t.id === id);
                          return tag ? (
                            <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {tag.name}
                              <button type="button" onClick={() => removeListItem('tag', id)} className="text-transparent hover:text-red-500 hover:bg-blue-100 rounded-full p-0.5 transition-colors"><X size={12} className="text-blue-500 group-hover:text-red-500" /></button>
                            </span>
                          ) : null;
                        })}
                        {editFormData.selectedTagIds.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma tag vinculada.</span>}
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-2 py-1.5 bg-slate-50"
                          value={editFormData.newTagId}
                          onChange={(e) => setEditFormData({ ...editFormData, newTagId: e.target.value })}
                        >
                          <option value="">Adicionar tag...</option>
                          {availableTags.filter(t => !editFormData.selectedTagIds.includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => addListItem('tag')} disabled={!editFormData.newTagId} className="px-3 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50">Add</button>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    {isSavingEdit ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Comarca Modal */}
      {
        isComarcaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsComarcaModalOpen(false)}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all z-10 relative flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">{editingComarcaId ? 'Editar Comarca' : 'Nova Comarca'}</h2>
                <button onClick={() => setIsComarcaModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveComarca} className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nome da Comarca</label>
                    <input
                      type="text"
                      required
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                      value={comarcaFormData.name || ''}
                      onChange={(e) => setComarcaFormData({ ...comarcaFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Endereço (Opcional)</label>
                    <input
                      type="text"
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                      placeholder="Ex: São Paulo - SP"
                      value={comarcaFormData.address || ''}
                      onChange={(e) => setComarcaFormData({ ...comarcaFormData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Opção de Envio</label>
                    <select
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                      value={comarcaFormData.shipping_option || 'Email'}
                      onChange={(e) => setComarcaFormData({ ...comarcaFormData, shipping_option: e.target.value })}
                    >
                      <option value="Email">Email</option>
                      <option value="Correios (AR)">Correios (AR)</option>
                      <option value="Entrega Presencial">Entrega Presencial</option>
                      <option value="Portal Eletrônico">Portal Eletrônico</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Documento Anexo (Opcional)</label>
                    {comarcaFormData.document_url && !comarcaDocumentFile && (
                      <div className="mb-2 flex items-center gap-2 text-sm bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <a href={comarcaFormData.document_url} target="_blank" rel="noreferrer" className="text-primary hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors">
                          <FileTextIcon size={14} /> Ver documento atual
                        </a>
                        <span className="text-slate-400 text-xs italic">(Faça upload abaixo para substituir)</span>
                      </div>
                    )}
                    {!comarcaDocumentFile ? (
                      <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer group w-full">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setComarcaDocumentFile(e.target.files?.[0] || null)}
                        />
                        <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                          <UploadCloud size={24} className="text-primary" />
                        </div>
                        <span className="text-sm text-slate-700 font-semibold mb-1">Arraste ou clique para anexar</span>
                        <span className="text-xs text-slate-400">PDF, DOC, DOCX, JPG ou PNG</span>
                      </label>
                    ) : (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FileTextIcon size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-800 truncate max-w-[200px]">{comarcaDocumentFile.name}</p>
                            <p className="text-xs text-green-600">{(comarcaDocumentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setComarcaDocumentFile(null)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Remover anexo"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setIsComarcaModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSavingComarca || !comarcaFormData.name} className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                    {isSavingComarca ? 'Salvando...' : 'Salvar Comarca'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Document Modal */}
      {
        isDocumentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDocumentModalOpen(false)}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all z-10 relative flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">{editingDocumentId ? 'Editar Documento' : 'Novo Documento'}</h2>
                <button onClick={() => setIsDocumentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveDocument} className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nome do Documento</label>
                    <input
                      type="text"
                      required
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                      value={documentFormData.name || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Descrição (Opcional)</label>
                    <textarea
                      rows={2}
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50 resize-none"
                      value={documentFormData.description || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
                      <select
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={documentFormData.status || 'Pendente'}
                        onChange={(e) => setDocumentFormData({ ...documentFormData, status: e.target.value })}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Data Base</label>
                      <input
                        type="date"
                        className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                        value={documentFormData.document_date || ''}
                        onChange={(e) => setDocumentFormData({ ...documentFormData, document_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Responsável (Opcional)</label>
                    <input
                      type="text"
                      className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-3 py-2 bg-slate-50"
                      value={documentFormData.responsible_name || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, responsible_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Arquivo Anexo</label>
                    {documentFormData.file_url && !documentFile && (
                      <div className="mb-2 flex items-center gap-2 text-sm bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <a href={documentFormData.file_url} target="_blank" rel="noreferrer" className="text-primary hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors">
                          <FileTextIcon size={14} /> Ver arquivo atual
                        </a>
                        <span className="text-slate-400 text-xs italic">(Faça upload abaixo para substituir)</span>
                      </div>
                    )}
                    {!documentFile ? (
                      <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer group w-full">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        />
                        <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                          <UploadCloud size={24} className="text-primary" />
                        </div>
                        <span className="text-sm text-slate-700 font-semibold mb-1">Arraste ou clique para anexar</span>
                        <span className="text-xs text-slate-400">PDF, DOC, DOCX, JPG ou PNG</span>
                      </label>
                    ) : (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FileTextIcon size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-800 truncate max-w-[200px]">{documentFile.name}</p>
                            <p className="text-xs text-green-600">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocumentFile(null)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Remover anexo"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setIsDocumentModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSavingDocument || !documentFormData.name} className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                    {isSavingDocument ? 'Salvando...' : 'Salvar Documento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </main >
  );
}
