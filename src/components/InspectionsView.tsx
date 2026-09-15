import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  Building,
  User,
  Download,
} from 'lucide-react';
import { Inspection, Tenant, Property } from '../types';
import { formatCurrency, formatNumber, formatDate, exportToCSV } from '../lib/utils';

interface InspectionsViewProps {
  inspections: Inspection[];
  tenants: Tenant[];
  properties: Property[];
  onAddInspection: (inspection: Inspection) => void;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  inspections,
  tenants,
  properties,
  onAddInspection,
}) => {
  const [search, setSearch] = useState('');
  const [selectedInspectionForPrint, setSelectedInspectionForPrint] = useState<Inspection | null>(null);

  const filtered = inspections.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        i.locataireNom.toLowerCase().includes(q) ||
        i.bienNom.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#162133] border border-[#C9A96E]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">États des Lieux d'Entrée & de Sortie</div>
            <div className="text-xs text-[#A8B4C4]">
              {inspections.length} procès-verbaux contradictoires · Inventaires, chiffrage des dégradations et retenues sur caution
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#162133] border border-[#C9A96E]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#1E2E45]/80 text-[#A8B4C4] font-semibold uppercase tracking-wider text-[10px] border-b border-[#C9A96E]/20">
                <th className="py-3 px-4">Date & Type</th>
                <th className="py-3 px-3">Bien / Lot</th>
                <th className="py-3 px-3">Locataire</th>
                <th className="py-3 px-3">Agent Constat</th>
                <th className="py-3 px-3 text-right">Frais Dégradations</th>
                <th className="py-3 px-3 text-right text-emerald-400">Caution Restituée</th>
                <th className="py-3 px-4 text-center">Procès-Verbal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A96E]/10">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#1E2E45]/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{item.type}</div>
                    <div className="text-[10px] text-[#A8B4C4]">{formatDate(item.date)}</div>
                  </td>

                  <td className="py-3 px-3 font-medium text-white max-w-[180px] truncate">
                    {item.bienNom}
                  </td>

                  <td className="py-3 px-3 font-bold text-[#E8D5B0]">{item.locataireNom}</td>

                  <td className="py-3 px-3 text-[#A8B4C4]">{item.agentNom}</td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                    {item.coutDegradations > 0 ? `${formatNumber(item.coutDegradations)} FCFA` : '0 FCFA (Impeccable)'}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {item.montantRestitueCaution ? `${formatNumber(item.montantRestitueCaution)} FCFA` : '—'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedInspectionForPrint(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#1E2E45] hover:bg-[#2A3F5C] text-[#C9A96E] font-medium text-[11px] border border-[#C9A96E]/20 transition-all flex items-center gap-1 mx-auto"
                    >
                      <Printer className="w-3 h-3" /> Imprimer PV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Print État des Lieux (Doc Page 6) */}
      {selectedInspectionForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#162133] border border-[#C9A96E]/30 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#C9A96E]/20 flex items-center justify-between bg-[#1E2E45]/80 no-print">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ClipboardCheck className="w-5 h-5 text-[#C9A96E]" />
                <span>Procès-Verbal d'État des Lieux (Doc FITAL-IMMO Page 6)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer
                </button>
                <button
                  onClick={() => setSelectedInspectionForPrint(null)}
                  className="p-1 rounded-lg text-[#A8B4C4] hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 bg-white text-neutral-900 rounded-b-3xl font-sans text-xs print-container leading-relaxed">
              <div className="text-center border-b-2 border-neutral-900 pb-3 mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-700">FITAL-IMMO GÉRANCE</div>
                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 mt-1">
                  PROCÈS-VERBAL D'{selectedInspectionForPrint.type.toUpperCase()}
                </h2>
                <div className="text-[10px] text-neutral-600 font-semibold">
                  Date du constat : {formatDate(selectedInspectionForPrint.date)} · Réalisé par : {selectedInspectionForPrint.agentNom}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-300 mb-4">
                <div>
                  <span className="text-neutral-500 font-bold uppercase text-[10px]">LOCAL CONCERNÉ : </span>
                  <div className="text-sm font-bold text-neutral-900">{selectedInspectionForPrint.bienNom}</div>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold uppercase text-[10px]">LOCATAIRE PRÉSENT : </span>
                  <div className="text-sm font-bold text-neutral-900">{selectedInspectionForPrint.locataireNom}</div>
                </div>
              </div>

              {/* Elements Table */}
              <table className="w-full text-left text-xs mb-4 border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">Éléments & Pièces</th>
                    <th className="py-2 px-3">État Constaté</th>
                    <th className="py-2 px-3">Observations & Dégradations</th>
                    <th className="py-2 px-3 text-right">Chiffrage Réparation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 border-b border-neutral-300">
                  {selectedInspectionForPrint.elements.map((el, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                      <td className="py-2 px-3 font-semibold text-neutral-900">{el.nom}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          el.etat === 'Très bon état' ? 'bg-emerald-100 text-emerald-800' :
                          el.etat === 'Bon état' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {el.etat}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-neutral-600">{el.commentaire}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                        {el.coutReparationEstime > 0 ? `${formatNumber(el.coutReparationEstime)} FCFA` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total deduction */}
              <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-300 flex justify-between items-center text-xs mb-6">
                <div>
                  <strong>Total retenues réparations :</strong>{' '}
                  <span className="text-rose-700 font-bold">{formatCurrency(selectedInspectionForPrint.coutDegradations)}</span>
                </div>
                <div>
                  <strong>Caution nette à restituer :</strong>{' '}
                  <span className="text-emerald-700 font-bold font-mono text-sm">
                    {formatCurrency(selectedInspectionForPrint.montantRestitueCaution || 0)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 text-xs">
                <div>
                  <div className="font-bold text-neutral-800">Signature du Locataire :</div>
                  <div className="h-14 border border-dashed border-neutral-400 rounded-lg mt-1 p-1">
                    <span className="text-[10px] text-neutral-400 italic">Mention "Lu et approuvé sans réserve"</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-800">Pour l'Agence FITAL-IMMO :</div>
                  <div className="h-14 border border-dashed border-neutral-400 rounded-lg mt-1 p-1 flex items-center justify-center">
                    <span className="text-[10px] font-black text-amber-800 uppercase">★ VISA DE CONFORMITÉ ★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
