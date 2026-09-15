import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  FileText,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  PhoneCall,
  Send,
} from 'lucide-react';
import { AgencySettings } from '../types';

interface SettingsViewProps {
  settings: AgencySettings;
  onSaveSettings: (newSettings: AgencySettings) => void;
}

export function SettingsView({ settings, onSaveSettings }: SettingsViewProps) {
  const [formData, setFormData] = useState<AgencySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'agency' | 'financial' | 'numbering' | 'mobileMoney' | 'roles'>('agency');

  // Mobile Money configs
  const [wavePhone, setWavePhone] = useState('+221 77 845 20 10');
  const [orangeMoneyMerchantCode, setOrangeMoneyMerchantCode] = useState('784912');
  const [whatsappSupport, setWhatsappSupport] = useState('+221 77 845 20 10');
  const [standardPhone, setStandardPhone] = useState('+221 33 820 40 50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3447] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F0EDE8] tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#C9A96E]" />
            Paramètres & Configuration de l'Agence
          </h1>
          <p className="text-sm text-[#A0AEC0] mt-1">
            Personnalisation des coordonnées de l'agence, devises (FCFA), taux de gérance et préfixes de numérotation.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-[#C9A96E] hover:bg-[#D8BA80] text-[#0A111D] rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#10B981]/20 border border-[#10B981]/40 rounded-xl text-[#10B981] flex items-center gap-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Vos paramètres ont été mis à jour et persistés avec succès !</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3447] pb-2">
        <button
          onClick={() => setActiveTab('agency')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'agency'
              ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
              : 'bg-[#141E30] text-[#A0AEC0] hover:text-[#F0EDE8]'
          }`}
        >
          <Building className="w-4 h-4" />
          Identité Agence
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'financial'
              ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
              : 'bg-[#141E30] text-[#A0AEC0] hover:text-[#F0EDE8]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Règles Financières & Taxes
        </button>

        <button
          onClick={() => setActiveTab('numbering')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'numbering'
              ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
              : 'bg-[#141E30] text-[#A0AEC0] hover:text-[#F0EDE8]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Numérotation des Actes
        </button>

        <button
          onClick={() => setActiveTab('mobileMoney')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'mobileMoney'
              ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
              : 'bg-[#141E30] text-[#A0AEC0] hover:text-[#F0EDE8]'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          Mobile Money & Télécoms
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40'
              : 'bg-[#141E30] text-[#A0AEC0] hover:text-[#F0EDE8]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Rôles & Permissions RLS
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-[#141E30]/90 border border-[#2A3447] rounded-2xl p-6 shadow-xl space-y-6">
        {activeTab === 'agency' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Raison Sociale de l'Agence
              </label>
              <input
                type="text"
                value={formData.nomAgence}
                onChange={(e) => setFormData({ ...formData, nomAgence: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Slogan / Titre Professionnel
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Téléphone de Contact
              </label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Email Officiel
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Adresse Siège Social
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Numéro NINEA / RC
              </label>
              <input
                type="text"
                value={formData.ninea}
                onChange={(e) => setFormData({ ...formData, ninea: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Devise Principale
              </label>
              <input
                type="text"
                value={formData.devise}
                disabled
                className="w-full px-4 py-2.5 bg-[#0A111D]/60 border border-[#2A3447] rounded-xl text-sm text-[#C9A96E] font-bold cursor-not-allowed"
              />
              <span className="text-xs text-[#A0AEC0] mt-1 block">Devise par défaut : FCFA (Francs CFA).</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Taux de Gérance par Défaut (%)
              </label>
              <input
                type="number"
                value={formData.tauxGeranceDefaut}
                onChange={(e) => setFormData({ ...formData, tauxGeranceDefaut: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
                min="1"
                max="30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Taux Pénalités de Retard (%)
              </label>
              <input
                type="number"
                value={formData.penaliteDefaut}
                onChange={(e) => setFormData({ ...formData, penaliteDefaut: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
                min="0"
                max="25"
              />
              <span className="text-xs text-[#A0AEC0] mt-1 block">Applicable dès J+15 après échéance.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Taux TVA sur Commission (%)
              </label>
              <input
                type="number"
                value={formData.tvaTaux}
                onChange={(e) => setFormData({ ...formData, tvaTaux: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'numbering' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Préfixe Quittances de Loyer
              </label>
              <input
                type="text"
                value={formData.prefixQuittance}
                onChange={(e) => setFormData({ ...formData, prefixQuittance: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm font-mono text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
              <span className="text-xs text-[#A0AEC0] mt-1 block">Exemple: QUI-2026-0001</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Préfixe Bons de Caisse (BCA)
              </label>
              <input
                type="text"
                value={formData.prefixBonCaisse}
                onChange={(e) => setFormData({ ...formData, prefixBonCaisse: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm font-mono text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
              <span className="text-xs text-[#A0AEC0] mt-1 block">Exemple: BCA-2026-0001</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Préfixe Factures (Adhésions / Travaux)
              </label>
              <input
                type="text"
                value={formData.prefixFacture}
                onChange={(e) => setFormData({ ...formData, prefixFacture: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm font-mono text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-2">
                Préfixe Contrats de Baux
              </label>
              <input
                type="text"
                value={formData.prefixContrat}
                onChange={(e) => setFormData({ ...formData, prefixContrat: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0A111D] border border-[#2A3447] rounded-xl text-sm font-mono text-[#F0EDE8] focus:border-[#C9A96E] focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'mobileMoney' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#0A111D] border border-[#2A3447] rounded-xl">
              <h3 className="font-semibold text-[#F0EDE8] text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Passerelles de Paiement Mobile Money & Lignes Directes
              </h3>
              <p className="text-xs text-[#A0AEC0] mt-1">
                Configurez les comptes marchands Wave, Orange Money et les numéros de standard pour les appels et relances WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Wave */}
              <div className="p-4 bg-[#0A111D]/80 border border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center font-black text-xs">W</div>
                  <span>Wave Sénégal & UEMOA</span>
                </div>
                <div>
                  <label className="block text-xs text-[#A0AEC0] mb-1">Numéro Marchand / Téléphone Wave de l'Agence</label>
                  <input
                    type="text"
                    value={wavePhone}
                    onChange={(e) => setWavePhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141E30] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] font-mono focus:border-cyan-500 focus:outline-none"
                    placeholder="+221 77 000 00 00"
                  />
                  <span className="text-[11px] text-[#6B7C94] mt-1 block">Utilisé pour générer les liens de paiement directs Wave `wave://` et `pay.wave.com`.</span>
                </div>
              </div>

              {/* Orange Money */}
              <div className="p-4 bg-[#0A111D]/80 border border-orange-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center font-black text-xs">OM</div>
                  <span>Orange Money</span>
                </div>
                <div>
                  <label className="block text-xs text-[#A0AEC0] mb-1">Code Marchand Orange Money (CI/SN/ML)</label>
                  <input
                    type="text"
                    value={orangeMoneyMerchantCode}
                    onChange={(e) => setOrangeMoneyMerchantCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141E30] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] font-mono focus:border-orange-500 focus:outline-none"
                    placeholder="784912"
                  />
                  <span className="text-[11px] text-[#6B7C94] mt-1 block">Génère automatiquement la syntaxe USSD `#144#39*${orangeMoneyMerchantCode}*...#`.</span>
                </div>
              </div>

              {/* Téléphone Standard */}
              <div className="p-4 bg-[#0A111D]/80 border border-blue-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>Standard Téléphonique Agence (Appels direct)</span>
                </div>
                <div>
                  <label className="block text-xs text-[#A0AEC0] mb-1">Ligne Fixe / Mobile Standard</label>
                  <input
                    type="text"
                    value={standardPhone}
                    onChange={(e) => setStandardPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141E30] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="+221 33 820 40 50"
                  />
                  <span className="text-[11px] text-[#6B7C94] mt-1 block">Numéro d'appel entrant/sortant pour le support locataires et propriétaires.</span>
                </div>
              </div>

              {/* WhatsApp Business */}
              <div className="p-4 bg-[#0A111D]/80 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Send className="w-4 h-4" />
                  <span>Numéro WhatsApp Business Officiel</span>
                </div>
                <div>
                  <label className="block text-xs text-[#A0AEC0] mb-1">Ligne WhatsApp Officielle</label>
                  <input
                    type="text"
                    value={whatsappSupport}
                    onChange={(e) => setWhatsappSupport(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141E30] border border-[#2A3447] rounded-xl text-sm text-[#F0EDE8] font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="+221 77 845 20 10"
                  />
                  <span className="text-[11px] text-[#6B7C94] mt-1 block">Utilisé pour l'expédition instantanée des quittances et relances par WhatsApp.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0A111D] border border-[#2A3447] rounded-xl">
              <h3 className="font-semibold text-[#F0EDE8] text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C9A96E]" />
                Modèle de Sécurité PostgreSQL & Row Level Security (RLS)
              </h3>
              <p className="text-xs text-[#A0AEC0] mt-1">
                Les politiques d'accès sont appliquées au niveau de la base de données :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-[#141E30] rounded-lg border border-[#2A3447]">
                  <span className="font-bold text-[#10B981]">ADMINISTRATEUR</span>
                  <p className="text-[#A0AEC0] mt-0.5">Accès intégral (Lecture, Écriture, Suppression, Paramètres, Reversements).</p>
                </div>
                <div className="p-3 bg-[#141E30] rounded-lg border border-[#2A3447]">
                  <span className="font-bold text-[#C9A96E]">GESTIONNAIRE</span>
                  <p className="text-[#A0AEC0] mt-0.5">Gestion des Biens, Locataires, Baux, États des lieux et Recouvrement.</p>
                </div>
                <div className="p-3 bg-[#141E30] rounded-lg border border-[#2A3447]">
                  <span className="font-bold text-[#3B82F6]">COMPTABLE</span>
                  <p className="text-[#A0AEC0] mt-0.5">Encaissements, Quittances, Bons de caisse et Rapports financiers.</p>
                </div>
                <div className="p-3 bg-[#141E30] rounded-lg border border-[#2A3447]">
                  <span className="font-bold text-[#94A3B8]">AGENT</span>
                  <p className="text-[#A0AEC0] mt-0.5">Saisie des relances, visites, états des lieux et signalements travaux.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
