import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  DollarSign,
} from 'lucide-react';
import { MaintenanceTicket, Property, Tenant } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';

interface MaintenanceViewProps {
  tickets: MaintenanceTicket[];
  properties: Property[];
  tenants: Tenant[];
  onAddTicket: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  tickets,
  properties,
  tenants,
  onAddTicket,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<'Urgente' | 'Moyenne' | 'Faible'>('Moyenne');
  const [bienId, setBienId] = useState(properties[0]?.id || '');
  const [cout, setCout] = useState<number>(45000);
  const [prestataire, setPrestataire] = useState('');

  const filtered = tickets.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        t.titre.toLowerCase().includes(q) ||
        t.bienNom.toLowerCase().includes(q) ||
        t.locataireNom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p紧 = properties.find((prop) => prop.id === bienId);

    const newTicket: MaintenanceTicket = {
      id: `maint-${Date.now()}`,
      bienId,
      bienNom: p紧?.nom || 'Bien assigné',
      locataireNom: p紧?.locataireActuelNom || 'Locataire en place',
      titre,
      description,
      priorite,
      statut: 'En attente',
      dateSignalement: new Date().toISOString().split('T')[0],
      coutEstime: Number(cout),
      imputableA: 'Propriétaire',
      prestataire: prestataire || 'Artisan Référencé FITAL',
    };

    onAddTicket(newTicket);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#162133] border border-[#C9A96E]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Maintenance, Travaux & Réparations</div>
            <div className="text-xs text-[#A8B4C4]">
              Suivi des interventions techniques, plomberie, électricité et imputation sur charges/loyers
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Ticket Travaux</span>
        </button>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-[#162133] border border-[#C9A96E]/20 hover:border-[#C9A96E]/50 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    t.priorite === 'Urgente'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  Priorité {t.priorite}
                </span>
                <span className="text-[10px] text-[#6B7C94]">{formatDate(t.dateSignalement)}</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{t.titre}</h3>
              <p className="text-xs text-[#A8B4C4] line-clamp-2 leading-relaxed mb-3">
                {t.description}
              </p>

              <div className="p-3 rounded-xl bg-[#1E2E45]/40 border border-[#C9A96E]/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B7C94]">Bien :</span>
                  <span className="font-semibold text-white truncate max-w-[140px]">{t.bienNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C94]">Locataire :</span>
                  <span className="text-[#E8D5B0]">{t.locataireNom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7C94]">Imputation :</span>
                  <span className="text-sky-300">{t.imputableA}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#C9A96E]/15 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#6B7C94] uppercase">Coût Estimé</div>
                <div className="text-sm font-bold text-[#C9A96E] font-mono">
                  {formatCurrency(t.coutEstime)}
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-[#1E2E45] text-[#A8B4C4] font-medium">
                {t.statut}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Nouveau Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#162133] border border-[#C9A96E]/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#C9A96E]/20 flex items-center justify-between bg-[#1E2E45]/80">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Wrench className="w-5 h-5 text-[#C9A96E]" />
                <span>Signaler un Incident / Travaux</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A8B4C4] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#A8B4C4] uppercase mb-1">Titre de l'incident</label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E]/20 text-white"
                  placeholder="Ex: Réparation chauffe-eau ou Fuite robinetterie"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A8B4C4] uppercase mb-1">Bien concerné</label>
                  <select
                    value={bienId}
                    onChange={(e) => setBienId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E]/20 text-white"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A8B4C4] uppercase mb-1">Priorité</label>
                  <select
                    value={priorite}
                    onChange={(e) => setPriorite(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E]/20 text-white"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A8B4C4] uppercase mb-1">Description détaillée</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E]/20 text-white"
                  placeholder="Détails du problème technique..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#C9A96E] uppercase mb-1">Coût Estimé (FCFA)</label>
                  <input
                    type="number"
                    value={cout}
                    onChange={(e) => setCout(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E] text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A8B4C4] uppercase mb-1">Artisan / Prestataire</label>
                  <input
                    type="text"
                    value={prestataire}
                    onChange={(e) => setPrestataire(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#1E2E45] border border-[#C9A96E]/20 text-white"
                    placeholder="Plomberie Express Dakar"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#C9A96E]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2E45] text-[#A8B4C4]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Créer le Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
