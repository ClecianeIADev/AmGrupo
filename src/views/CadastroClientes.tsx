import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, Eye, Pencil, X, Mail, Phone, MapPin, Building2, User, ClipboardList, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type SegmentRow = Database['public']['Tables']['segments']['Row'];
type ClientSegmentRow = Database['public']['Tables']['client_segments']['Row'];

interface ClientWithSegments extends ClientRow {
    segments: SegmentRow[];
    initials: string;
    color: string;
    // Keeping this mock pipeline array as requested for the UI ("onde está hoje")
    pipeline: { area: string; stage: string }[];
}

export function CadastroClientes() {
    const [clients, setClients] = useState<ClientWithSegments[]>([]);
    const [allSegments, setAllSegments] = useState<SegmentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedClient, setSelectedClient] = useState<ClientWithSegments | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [segmentFilter, setSegmentFilter] = useState('');

    // Form state for creating/editing
    const [formData, setFormData] = useState<Partial<ClientWithSegments>>({});
    const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
    const [newSegmentName, setNewSegmentName] = useState('');
    const [isAddingSegment, setIsAddingSegment] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        const { data, error } = await supabase.from('segments').select('*').order('name');
        if (!error && data) {
            setAllSegments(data);
        }
    };

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            // Get clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (clientsError) throw clientsError;

            // Get segments and relations
            const { data: relationsData, error: relationsError } = await supabase
                .from('client_segments')
                .select('*');

            if (relationsError) throw relationsError;

            const { data: segmentsData, error: segmentsError } = await supabase
                .from('segments')
                .select('*');

            if (segmentsError) throw segmentsError;

            // Fetch closed opportunities
            const { data: oppsData, error: oppsError } = await supabase
                .from('opportunities')
                .select('client_id')
                .eq('stage', 'Fechado');

            if (oppsError) throw oppsError;

            const mappedClients: ClientWithSegments[] = (clientsData || []).map(client => {
                const clientSegmentIds = relationsData
                    ?.filter(r => r.client_id === client.id)
                    .map(r => r.segment_id) || [];

                const clientSegments = segmentsData?.filter(s => clientSegmentIds.includes(s.id)) || [];

                const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600', 'bg-indigo-100 text-indigo-600'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                const getInitials = (name: string) => {
                    const parts = name.split(' ');
                    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                    return name.substring(0, 2).toUpperCase();
                };

                let pipeline: { area: string; stage: string }[] = [];
                if (client.onde_esta) {
                    const match = client.onde_esta.match(/^(.*?)\s*\((.*?)\)$/);
                    if (match) {
                        pipeline.push({ area: match[1], stage: match[2] });
                    } else {
                        pipeline.push({ area: 'Comercial', stage: client.onde_esta });
                    }
                }

                const closedContractsCount = oppsData?.filter(o => o.client_id === client.id).length || 0;

                return {
                    ...client,
                    contracts: closedContractsCount,
                    segments: clientSegments,
                    initials: getInitials(client.name),
                    color: randomColor,
                    pipeline: pipeline
                };
            });

            setClients(mappedClients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewSegment = async () => {
        if (!newSegmentName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('segments')
                .insert({ name: newSegmentName.trim() })
                .select()
                .single();

            if (error) {
                // If violation, gracefully fetch it and select it
                const { data: existing } = await supabase.from('segments').select('*').eq('name', newSegmentName.trim()).single();
                if (existing) {
                    if (!selectedSegmentIds.includes(existing.id)) setSelectedSegmentIds([...selectedSegmentIds, existing.id]);
                } else {
                    alert('Erro ao criar segmento. Verifique se você tem permissão ou tente novamente mais tarde.');
                    console.error('Insert error:', error);
                }
            } else if (data) {
                setAllSegments([...allSegments, data]);
                setSelectedSegmentIds([...selectedSegmentIds, data.id]);
            }
            setNewSegmentName('');
            setIsAddingSegment(false);
        } catch (err: any) {
            alert('Erro de conexão ao salvar segmento: ' + err.message);
        }
    };

    const toggleSegmentSelection = (segmentId: string) => {
        if (selectedSegmentIds.includes(segmentId)) {
            setSelectedSegmentIds(selectedSegmentIds.filter(id => id !== segmentId));
        } else {
            setSelectedSegmentIds([...selectedSegmentIds, segmentId]);
        }
    };

    const handleDeleteSegment = async (e: React.MouseEvent, segmentId: string) => {
        e.stopPropagation(); // prevent clicking the segment
        if (!confirm('Tem certeza que deseja excluir este segmento? Ele será removido de todos os clientes.')) return;

        const { error } = await supabase.from('segments').delete().eq('id', segmentId);
        if (error) {
            alert('Erro ao excluir segmento: ' + error.message);
        } else {
            setAllSegments(allSegments.filter(s => s.id !== segmentId));
            setSelectedSegmentIds(selectedSegmentIds.filter(id => id !== segmentId));
        }
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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 9) {
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        }
        setFormData({ ...formData, phone: value });
    };

    const handleSaveClient = async () => {
        if (!formData.name) {
            alert('Por favor, informe o nome do cliente.');
            return;
        }

        const clientPayload = {
            name: formData.name,
            status: formData.status || 'Active',
            value: formData.value || 0,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null
        };

        try {
            let savedClientId = selectedClient?.id;

            if (isCreating) {
                const { data, error } = await supabase
                    .from('clients')
                    .insert(clientPayload)
                    .select()
                    .single();

                if (error) throw error;
                savedClientId = data.id;
            } else if (savedClientId) {
                const { error } = await supabase
                    .from('clients')
                    .update(clientPayload)
                    .eq('id', savedClientId);

                if (error) throw error;
            }

            if (savedClientId) {
                // Update segments
                // First delete existing relation
                await supabase.from('client_segments').delete().eq('client_id', savedClientId);

                // Then insert new ones
                if (selectedSegmentIds.length > 0) {
                    const segmentPayload = selectedSegmentIds.map(sid => ({
                        client_id: savedClientId,
                        segment_id: sid
                    }));
                    await supabase.from('client_segments').insert(segmentPayload);
                }
            }

            closePanel();
            fetchClients(); // run in background to make UI feel instant
        } catch (error: any) {
            console.error('Error saving client:', error);
            alert('Erro ao salvar cliente: ' + error.message);
        }
    };

    const handleDeleteClient = async () => {
        if (!selectedClient) return;
        if (!confirm(`Tem certeza que deseja excluir o cliente "${selectedClient.name}" permanentemente? Essa ação não pode ser desfeita.`)) return;

        try {
            // Because we set ON DELETE CASCADE in the database for client_segments, 
            // deleting the client will automatically delete their segment relations.
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', selectedClient.id);

            if (error) throw error;

            closePanel();
            fetchClients(); // run in background to update UI
        } catch (error: any) {
            console.error('Error deleting client:', error);
            alert('Erro ao excluir cliente: ' + error.message);
        }
    };

    const openCreatePanel = () => {
        setIsCreating(true);
        setSelectedClient(null);
        setIsEditing(false);
        setFormData({
            status: 'Active',
            value: 0,
            contracts: 0
        });
        setSelectedSegmentIds([]);
    };

    const openEditPanel = (client: ClientWithSegments) => {
        setSelectedClient(client);
        setIsCreating(false);
        setIsEditing(true);
        setFormData({
            name: client.name,
            status: client.status,
            value: client.value,
            contracts: client.contracts,
            email: client.email,
            phone: client.phone,
            address: client.address
        });
        setSelectedSegmentIds(client.segments.map(s => s.id));
    };

    const openViewPanel = (client: ClientWithSegments) => {
        setSelectedClient(client);
        setIsCreating(false);
        setIsEditing(false);
    };

    const closePanel = () => {
        setSelectedClient(null);
        setIsEditing(false);
        setIsCreating(false);
        setFormData({});
        setSelectedSegmentIds([]);
        setIsAddingSegment(false);
        setNewSegmentName('');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
        const matchesSegment = segmentFilter === '' || c.segments.some(s => s.id === segmentFilter);
        return matchesSearch && matchesStatus && matchesSegment;
    });

    const isPanelOpen = selectedClient !== null || isCreating;

    return (
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50 relative">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* Top Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                        <div className="relative w-full md:max-w-xs group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 sm:text-sm transition-all"
                                placeholder="Buscar cliente..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 sm:text-sm transition-all cursor-pointer"
                                >
                                    <option value="Todos">Status: Todos</option>
                                    <option value="Active">Ativos</option>
                                    <option value="Inactive">Inativos</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            <div className="relative w-full md:w-40">
                                <select
                                    value={segmentFilter}
                                    onChange={(e) => setSegmentFilter(e.target.value)}
                                    className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 sm:text-sm transition-all cursor-pointer"
                                >
                                    <option value="">Segmento...</option>
                                    {allSegments.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openCreatePanel}
                        className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/30 flex items-center justify-center gap-2 transition-all shrink-0">
                        <Plus size={18} />
                        Novo Cliente
                    </button>
                </div>

                {/* Client List */}
                <div className="flex flex-col gap-3">
                    {isLoading ? (
                        <div className="text-center py-10 text-slate-500">Carregando clientes...</div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">Nenhum cliente encontrado.</div>
                    ) : (
                        filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => openViewPanel(client)}
                                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`size-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${client.color}`}>
                                        {client.initials}
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold text-base group-hover:text-primary transition-colors">{client.name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{client.email || 'Sem email'}</p>
                                        <p className="text-xs text-slate-500">{client.phone || 'Sem telefone'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-center flex-1">
                                    {client.segments.map((segment) => (
                                        <span key={segment.id} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                                            {segment.name}
                                        </span>
                                    ))}
                                    {client.segments.length === 0 && (
                                        <span className="text-xs text-slate-400 italic">Nenhum segmento</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-8 w-full lg:w-auto shrink-0">
                                    <div className="text-right">
                                        <p className="text-slate-900 font-bold">{formatCurrency(client.value)}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${client.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            <span className={`size-1.5 rounded-full ${client.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {client.status === 'Active' ? 'Ativo' : 'Desativado'}
                                        </span>

                                        <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); openViewPanel(client); }}>
                                            <Eye size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
                                    {isCreating ? 'Novo Cliente' : selectedClient?.name}
                                </h2>
                                <div className="flex items-center gap-2 shrink-0">
                                    {isEditing && (
                                        <button
                                            onClick={handleDeleteClient}
                                            className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 mr-1"
                                            title="Excluir Cliente"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {(!isCreating && !isEditing) && (
                                        <button
                                            onClick={() => selectedClient && openEditPanel(selectedClient)}
                                            className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-50"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={closePanel}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 p-8 space-y-8 overflow-y-auto">

                            {/* Header Box */}
                            <div className="flex items-start gap-5">
                                <div className="size-20 bg-primary text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-md shadow-primary/20 shrink-0">
                                    {isCreating ? <Building2 size={36} /> : selectedClient?.initials}
                                </div>
                                <div className="flex flex-col pt-1 w-full">
                                    {(isEditing || isCreating) ? (
                                        <div className="w-full space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Nome do Cliente</label>
                                                <input
                                                    type="text"
                                                    value={formData.name || ''}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Digite o nome..."
                                                    className="w-full text-lg font-bold text-slate-900 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Status</label>
                                                <select
                                                    value={formData.status || 'Active'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                    className="w-full text-sm font-bold text-slate-900 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                >
                                                    <option value="Active">Ativo</option>
                                                    <option value="Inactive">Desativado</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${selectedClient?.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    <span className={`size-1 rounded-full ${selectedClient?.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {selectedClient?.status === 'Active' ? 'Ativo' : 'Desativado'}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedClient?.name}</h2>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor Mensal (R$)</p>
                                    {(isEditing || isCreating) ? (
                                        <input
                                            type="text"
                                            value={formatCurrency(formData.value || 0)}
                                            onChange={handleCurrencyChange}
                                            className="w-full text-lg font-bold text-slate-900 border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedClient?.value || 0)}</p>
                                    )}
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contratos Ativos</p>
                                    <p className="text-xl font-bold text-slate-900">{isCreating ? 0 : (selectedClient?.contracts || 0)}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Baseado nas Oportunidades Ganhas</p>
                                </div>
                            </div>

                            {/* Where it is today - ONLY in View Mode as per instruction not to save yet to DB but show mock */}
                            {(!isEditing && !isCreating) && selectedClient?.pipeline && selectedClient.pipeline.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs tracking-wider uppercase">
                                        <MapPin className="text-primary" size={16} />
                                        Onde Está Hoje
                                    </div>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                        {selectedClient.pipeline.map((pl: any, idx: number) => (
                                            <div key={idx} className={`flex items-center justify-between p-4 ${idx !== selectedClient.pipeline.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                                    {pl.area === 'Comercial' ? <Building2 className="text-slate-400" size={16} /> : <ClipboardList className="text-slate-400" size={16} />}
                                                    {pl.area}
                                                </div>
                                                <span className={`text-sm font-semibold ${pl.stage === 'Negociação' ? 'text-primary' : 'text-amber-600'}`}>{pl.stage}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Where it is today Mock Form for Creation/Edition */}
                            {(isEditing || isCreating) && (
                                <div className="space-y-3 opacity-60">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs tracking-wider uppercase">
                                        <MapPin className="text-primary" size={16} />
                                        Onde Está Hoje (Em Construção)
                                    </div>
                                    <div className="text-xs text-slate-500 italic">Este recurso de funil de vendas será integrado em breve.</div>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Informações de Contato</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <Mail className="text-slate-400" size={18} />
                                        </div>
                                        <div className="w-full pt-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">E-mail Corporativo</p>
                                            {(isEditing || isCreating) ? (
                                                <input
                                                    type="email"
                                                    value={formData.email || ''}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="email@empresa.com"
                                                    className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900 break-all">{selectedClient?.email || '-'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <Phone className="text-slate-400" size={18} />
                                        </div>
                                        <div className="w-full pt-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Telefone</p>
                                            {(isEditing || isCreating) ? (
                                                <input
                                                    type="tel"
                                                    value={formData.phone || ''}
                                                    onChange={handlePhoneChange}
                                                    placeholder="(11) 90000-0000"
                                                    maxLength={15}
                                                    className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900">{selectedClient?.phone || '-'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                            <MapPin className="text-slate-400" size={18} />
                                        </div>
                                        <div className="w-full pt-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Endereço</p>
                                            {(isEditing || isCreating) ? (
                                                <textarea
                                                    rows={2}
                                                    value={formData.address || ''}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="Endereço completo"
                                                    className="w-full text-sm font-medium text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                                ></textarea>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-900">{selectedClient?.address || '-'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segments */}
                            <div className="space-y-4 pt-2 border-t border-slate-100 mt-4 pt-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Segmentos associados</h4>
                                    {(isEditing || isCreating) && !isAddingSegment && (
                                        <button
                                            onClick={() => setIsAddingSegment(true)}
                                            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-blue-700 transition-colors bg-primary/5 px-2 py-1 rounded">
                                            <Plus size={12} /> NOVO NO BANCO
                                        </button>
                                    )}
                                </div>

                                {/* Add New Segment Form inside panel */}
                                {(isEditing || isCreating) && isAddingSegment && (
                                    <div className="flex gap-2 p-3 bg-slate-50 border border-dash border-slate-200 rounded-lg">
                                        <input
                                            type="text"
                                            value={newSegmentName}
                                            onChange={(e) => setNewSegmentName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleCreateNewSegment();
                                                }
                                            }}
                                            placeholder="Ex: Farmácia"
                                            className="flex-1 text-sm px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-primary"
                                        />
                                        <button onClick={handleCreateNewSegment} className="bg-primary text-white text-xs px-3 rounded font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary/50">ADC</button>
                                        <button onClick={() => setIsAddingSegment(false)} className="text-slate-400 hover:text-slate-600 px-2"><X size={16} /></button>
                                    </div>
                                )}

                                {(isEditing || isCreating) ? (
                                    <div className="flex flex-wrap gap-2">
                                        {allSegments.map((segment) => {
                                            const isSelected = selectedSegmentIds.includes(segment.id);
                                            return (
                                                <div
                                                    key={segment.id}
                                                    onClick={() => toggleSegmentSelection(segment.id)}
                                                    className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors border ${isSelected ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {segment.name}
                                                    <button
                                                        onClick={(e) => handleDeleteSegment(e, segment.id)}
                                                        className="ml-1 p-0.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                                                        title="Excluir segmento"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {allSegments.length === 0 && <span className="text-sm text-slate-400">Nenhum segmento castrado.</span>}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClient?.segments.map((segment) => (
                                            <div key={segment.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                                                {segment.name}
                                            </div>
                                        ))}
                                        {(selectedClient?.segments.length === 0) && (
                                            <div className="text-sm text-slate-500 italic">Este cliente não possui segmentos vinculados.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Panel Footer Button */}
                        <div className="w-full p-6 bg-white border-t border-slate-100 shrink-0">
                            {(isEditing || isCreating) ? (
                                <button
                                    onClick={handleSaveClient}
                                    className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? 'Finalizar Cadastro' : 'Salvar Alterações'}
                                </button>
                            ) : (
                                <button className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                                    Ver Ficha Completa
                                    <ChevronDown size={16} className="-rotate-90 opacity-70" />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

        </main>
    );
}
