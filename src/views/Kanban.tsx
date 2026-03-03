import React, { useState, useEffect } from 'react';
import { MoreHorizontal, GripVertical, CheckCircle2, X, Building2, User, Calendar, DollarSign, Plus, Mail, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Kanban({ onNavigate, onSelectOpportunity }: { onNavigate: (view: string) => void, onSelectOpportunity?: (id: string) => void }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Real data state
  const [clients, setClients] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [leadOrigins, setLeadOrigins] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Interactions
  const [selectedOriginIds, setSelectedOriginIds] = useState<string[]>([]);
  const [isAddingOrigin, setIsAddingOrigin] = useState(false);
  const [newOriginName, setNewOriginName] = useState('');

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Drag and Drop
  const [draggedOpp, setDraggedOpp] = useState<any>(null);

  // Mock data for unimplemented parts
  const [mockOwners] = useState(['Alex Moraes', 'Sarah Jenkins', 'David Rogers', 'Michael Chen']);

  const fetchData = async () => {
    try {
      const [clientsRes, originsRes, tagsRes, oppsRes] = await Promise.all([
        supabase.from('clients').select('id, name').order('name'),
        supabase.from('lead_origins').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase.from('opportunities').select(`
          *,
          client:clients(name)
        `).order('created_at', { ascending: false })
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (originsRes.data) setLeadOrigins(originsRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
      if (oppsRes.data) setOpportunities(oppsRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados do Kanban:", err);
    }
  };

  useEffect(() => {
    fetchData();

    (window as any).openNewOpportunityModal = () => {
      setIsPanelOpen(true);
      setFormData({});
      setSelectedOriginIds([]);
      setSelectedTagIds([]);
    };
    return () => {
      delete (window as any).openNewOpportunityModal;
    };
  }, []);

  const closePanel = () => {
    setIsPanelOpen(false);
    setFormData({});
    setIsAddingOrigin(false);
    setIsAddingTag(false);
    setNewOriginName('');
    setNewTagName('');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setFormData({ ...formData, value: 0 });
      return;
    }
    const numericValue = parseInt(rawValue, 10) / 100;
    setFormData({ ...formData, value: numericValue });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const handleAddOrigin = async () => {
    if (newOriginName.trim()) {
      const { data, error } = await supabase.from('lead_origins').insert({ name: newOriginName.trim() }).select().single();
      if (data) {
        setLeadOrigins([...leadOrigins, data]);
        setSelectedOriginIds([...selectedOriginIds, data.id]);
        setNewOriginName('');
        setIsAddingOrigin(false);
      } else if (error) {
        alert("Erro ao criar origem: " + error.message);
      }
    }
  };

  const handleAddTag = async () => {
    if (newTagName.trim()) {
      const { data, error } = await supabase.from('tags').insert({ name: newTagName.trim() }).select().single();
      if (data) {
        setTags([...tags, data]);
        setSelectedTagIds([...selectedTagIds, data.id]);
        setNewTagName('');
        setIsAddingTag(false);
      } else if (error) {
        alert("Erro ao criar tag: " + error.message);
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

  const saveNewOpportunity = async () => {
    if (!formData.client_id) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    setIsSaving(true);
    try {
      const { data: opp, error: oppError } = await supabase.from('opportunities').insert({
        client_id: formData.client_id,
        value: formData.value || 0,
        expected_date: formData.expectedDate || null,
        owner_name: formData.owner || null,
        primary_contact_name: formData.primaryContactName || null,
        corporate_email: formData.corporateEmail || null,
        notes: formData.notes || null,
        stage: formData.stage || 'Lead'
      }).select().single();

      if (oppError) throw oppError;

      if (selectedOriginIds.length > 0) {
        const originsToInsert = selectedOriginIds.map(id => ({ opportunity_id: opp.id, origin_id: id }));
        await supabase.from('opportunity_origins').insert(originsToInsert);
      }

      if (selectedTagIds.length > 0) {
        const tagsToInsert = selectedTagIds.map(id => ({ opportunity_id: opp.id, tag_id: id }));
        await supabase.from('opportunity_tags').insert(tagsToInsert);
      }

      // Update the client's onde_esta status
      const newOndeEsta = `Comercial (${formData.stage || 'Lead'})`;
      await supabase.from('clients').update({ onde_esta: newOndeEsta }).eq('id', formData.client_id);

      await fetchData();
      closePanel();
    } catch (err: any) {
      alert("Erro ao salvar oportunidade: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, opp: any) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', opp.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStageId: string) => {
    e.preventDefault();
    if (!draggedOpp || draggedOpp.stage === newStageId) {
      setDraggedOpp(null);
      return;
    }

    const oppId = draggedOpp.id;
    const clientId = draggedOpp.client_id;

    // Optimistic UI update
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStageId } : o));
    setDraggedOpp(null);

    try {
      const { error: oppError } = await supabase.from('opportunities').update({ stage: newStageId }).eq('id', oppId);
      if (oppError) throw oppError;

      if (clientId) {
        const newOndeEsta = `Comercial (${newStageId})`;
        const { error: clientError } = await supabase.from('clients').update({ onde_esta: newOndeEsta }).eq('id', clientId);
        if (clientError) throw clientError;
      }
    } catch (err: any) {
      alert("Erro ao mover oportunidade: " + err.message);
      fetchData(); // Rollback on error
    }
  };

  const stages = [
    { id: 'Lead', title: 'Lead', color: 'blue' },
    { id: 'Contato Realizado', title: 'Contato Realizado', color: 'amber' },
    { id: 'Proposta Enviada', title: 'Proposta Enviada', color: 'violet' },
    { id: 'Negociação', title: 'Negociação', color: 'pink' },
    { id: 'Fechado', title: 'Fechado', color: 'emerald' },
  ];

  return (
    <main className="flex-1 overflow-hidden flex flex-col p-6 bg-slate-50/50">
      <div className="kanban-container flex-1 overflow-x-auto overflow-y-hidden flex gap-5 pb-2 min-w-0">

        {stages.map(stage => {
          const stageOpps = opportunities.filter(o => o.stage === stage.id);
          const totalValue = stageOpps.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

          const colorClasses: Record<string, string> = {
            blue: "border-blue-500",
            amber: "border-amber-500",
            violet: "border-violet-500",
            pink: "border-pink-500",
            emerald: "border-emerald-500"
          };

          const bgClasses: Record<string, string> = {
            blue: "bg-blue-50 text-blue-600",
            amber: "bg-amber-50 text-amber-600",
            violet: "bg-violet-50 text-violet-600",
            pink: "bg-pink-50 text-pink-600",
            emerald: "bg-emerald-50 text-emerald-600"
          };

          return (
            <div key={stage.id} className="flex flex-col w-80 flex-shrink-0 max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">{stage.title}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stageOpps.length}</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">{formatCurrency(totalValue)}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div
                className={`kanban-column flex-1 overflow-y-auto bg-slate-100 rounded-xl p-2 flex flex-col gap-3 border-t-4 ${colorClasses[stage.color]}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {stageOpps.map(opp => (
                  <div
                    key={opp.id}
                    onClick={() => {
                      if (onSelectOpportunity) onSelectOpportunity(opp.id);
                      onNavigate('detail');
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp)}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${stage.id === 'Fechado' ? 'opacity-80 hover:opacity-100' : ''} ${draggedOpp?.id === opp.id ? 'opacity-50 border-primary border-dashed border-2' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-slate-800 text-sm ${stage.id === 'Fechado' ? 'line-through decoration-slate-400' : ''}`}>
                        {opp.client?.name || 'Cliente Desconhecido'}
                      </h4>
                      {stage.id === 'Fechado' ? (
                        <CheckCircle2 size={18} className="text-slate-300 group-hover:text-slate-400" />
                      ) : (
                        <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                      )}
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-0.5">{stage.id === 'Fechado' ? 'Closed Value' : 'Potential Value'}</p>
                      <span className={`font-bold ${stage.id === 'Fechado' ? 'text-emerald-600' : 'text-slate-900'}`}>{formatCurrency(Number(opp.value))}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-white shrink-0">
                          {opp.owner_name ? opp.owner_name.substring(0, 2) : 'Un'}
                        </div>
                        <span className="text-xs text-slate-500 truncate">{opp.owner_name || 'Unassigned'}</span>
                      </div>
                      <span className={`${bgClasses[stage.color]} text-[10px] font-bold px-2 py-1 rounded shrink-0`}>
                        {stage.id === 'Fechado' ? 'Won' : 'New'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>

      {/* Slide-over Panel (Backdrop) */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={closePanel}></div>
      )}

      {/* Slide-over Panel (Content) */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {isPanelOpen && (
          <>
            {/* Panel Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-lg font-bold text-slate-900 truncate pr-4">
                  Nova Oportunidade
                </h2>
                <button
                  onClick={closePanel}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Cliente */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Cliente</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="text-slate-400" size={16} />
                    </div>
                    <select
                      value={formData.client_id || ''}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg pl-10 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Valor Total & Previsão */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Valor Total</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="text-slate-400" size={16} />
                      </div>
                      <input
                        type="text"
                        value={formatCurrency(formData.value || 0)}
                        onChange={handleCurrencyChange}
                        className="w-full text-sm font-semibold text-slate-900 border border-slate-200 rounded-md pl-10 pr-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Previsão Fechamento</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="text-slate-400" size={16} />
                      </div>
                      <input
                        type="date"
                        value={formData.expectedDate || ''}
                        onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                        className="w-full text-sm font-semibold text-slate-700 border border-slate-200 rounded-md pl-10 pr-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsável & Fase/Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Responsável</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-slate-400" size={16} />
                      </div>
                      <select
                        value={formData.owner || ''}
                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        className="w-full text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg pl-10 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                      >
                        <option value="">Selecione...</option>
                        {mockOwners.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Fase / Status</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="text-slate-400" size={16} />
                      </div>
                      <select
                        value={formData.stage || 'Lead'}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="w-full text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg pl-10 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                      >
                        {stages.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Origem do Lead */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Origem do Lead</label>
                    {!isAddingOrigin && (
                      <button
                        onClick={() => setIsAddingOrigin(true)}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-blue-700 transition-colors bg-primary/5 px-2 py-1 rounded">
                        <Plus size={12} /> NOVO
                      </button>
                    )}
                  </div>

                  {isAddingOrigin && (
                    <div className="flex gap-2 p-2 bg-slate-50 border border-dash border-slate-200 rounded-lg mb-2">
                      <input
                        type="text"
                        value={newOriginName}
                        onChange={(e) => setNewOriginName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOrigin()}
                        placeholder="Nova Origem"
                        className="flex-1 text-sm px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-primary"
                      />
                      <button onClick={handleAddOrigin} className="bg-primary text-white text-xs px-3 rounded font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary/50">ADC</button>
                      <button onClick={() => setIsAddingOrigin(false)} className="text-slate-400 hover:text-slate-600 px-2"><X size={16} /></button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {leadOrigins.map((origin) => {
                      const isSelected = selectedOriginIds.includes(origin.id);
                      return (
                        <div
                          key={origin.id}
                          onClick={() => toggleSelection(origin.id, selectedOriginIds, setSelectedOriginIds)}
                          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors border ${isSelected ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          {origin.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contato e Email */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Detalhes de Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                        <User className="text-slate-400" size={16} />
                      </div>
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nome do Contato Principal</p>
                        <input
                          type="text"
                          value={formData.primaryContactName || ''}
                          onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                          placeholder="Ex: João Silva"
                          className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                        <Mail className="text-slate-400" size={16} />
                      </div>
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Corporativo</p>
                        <input
                          type="email"
                          value={formData.corporateEmail || ''}
                          onChange={(e) => setFormData({ ...formData, corporateEmail: e.target.value })}
                          placeholder="joao@empresa.com"
                          className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="pt-2">
                  <div className="flex items-start gap-4">
                    <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                      <FileText className="text-slate-400" size={16} />
                    </div>
                    <div className="w-full">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Observações da Negociação</p>
                      <textarea
                        rows={3}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Detalhes importantes sobre a oportunidade..."
                        className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Tags</label>
                    {!isAddingTag && (
                      <button
                        onClick={() => setIsAddingTag(true)}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-blue-700 transition-colors bg-primary/5 px-2 py-1 rounded">
                        <Plus size={12} /> NOVA
                      </button>
                    )}
                  </div>

                  {isAddingTag && (
                    <div className="flex gap-2 p-2 bg-slate-50 border border-dash border-slate-200 rounded-lg mb-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Nova Tag"
                        className="flex-1 text-sm px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-primary"
                      />
                      <button onClick={handleAddTag} className="bg-primary text-white text-xs px-3 rounded font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary/50">ADC</button>
                      <button onClick={() => setIsAddingTag(false)} className="text-slate-400 hover:text-slate-600 px-2"><X size={16} /></button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <div
                          key={tag.id}
                          onClick={() => toggleSelection(tag.id, selectedTagIds, setSelectedTagIds)}
                          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide uppercase select-none transition-colors border ${isSelected ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700'
                            }`}
                        >
                          {tag.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Panel Footer */}
            <div className="w-full p-6 bg-white border-t border-slate-100 shrink-0">
              <button
                onClick={saveNewOpportunity}
                disabled={isSaving}
                className="w-full py-3.5 bg-primary hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Oportunidade'
                )}
              </button>
            </div>
          </>
        )}
      </div>

    </main>
  );
}
