import { supabase, isSupabaseConfigured } from './client';
import {
  Property,
  Owner,
  Tenant,
  LeaseContract,
  Payment,
  TenantReminder,
  Inspection,
  MaintenanceTicket,
  OwnerDisbursement,
  Invoice,
  CashVoucher,
  NotificationItem,
  AuditLog,
  AgencySettings,
  UserAccount,
  PaymentMethodConfig,
  CashMovement,
  CashClosing,
  Agency,
} from '../../types';

export interface AppStateData {
  agency: Agency | null;
  properties: Property[];
  owners: Owner[];
  tenants: Tenant[];
  contracts: LeaseContract[];
  payments: Payment[];
  reminders: TenantReminder[];
  inspections: Inspection[];
  maintenance: MaintenanceTicket[];
  disbursements: OwnerDisbursement[];
  invoices: Invoice[];
  cashVouchers: CashVoucher[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  settings: AgencySettings;
  users: UserAccount[];
  paymentMethods: PaymentMethodConfig[];
  cashMovements: CashMovement[];
  cashClosings: CashClosing[];
}

export const defaultSettings: AgencySettings = {
  nomAgence: 'FITAL-IMMO',
  slogan: 'Gestion Immobilière, Syndic & Recouvrement',
  telephone: '+221 33 820 00 00',
  email: 'contact@fital-immo.sn',
  adresse: 'Avenue Cheikh Anta Diop, Dakar',
  ville: 'Dakar',
  pays: 'Sénégal',
  ninea: '008920194 2V8',
  devise: 'FCFA',
  tauxGeranceDefaut: 10,
  penaliteDefaut: 10,
  tvaTaux: 18,
  prefixFacture: 'FAC-2026-',
  prefixQuittance: 'QUI-2026-',
  prefixPaiement: 'PAY-2026-',
  prefixContrat: 'BAIL-2026-',
  prefixBonCaisse: 'BCA-2026-',
};

export const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'pm-especes',
    code: 'ESPECES',
    libelle: 'Espèces (Caisse Agence)',
    description: 'Règlement au comptoir avec reçu de caisse instantané et émargement.',
    actif: true,
    parDefaut: true,
    estParDefaut: true,
    fraisPourcentage: 0,
    delaiValidationHeures: 0,
    instructions: 'Présentez-vous aux guichets de la gérance aux heures d’ouverture.',
  },
  {
    id: 'pm-wave',
    code: 'WAVE',
    libelle: 'Wave Mobile Money',
    description: 'Paiement sans frais supplémentaire par QR Code instantané ou lien marchand direct.',
    actif: true,
    parDefaut: false,
    estParDefaut: false,
    fraisPourcentage: 0,
    delaiValidationHeures: 0,
    numeroCompteOuTelephone: '+221 77 000 00 00',
    instructions: 'Scannez le QR Code Wave ou utilisez le lien direct de paiement.',
  },
  {
    id: 'pm-orange-money',
    code: 'ORANGE_MONEY',
    libelle: 'Orange Money (OM)',
    description: 'Paiement sécurisé via syntaxe USSD #144# ou code marchand officiel.',
    actif: true,
    parDefaut: false,
    estParDefaut: false,
    fraisPourcentage: 0,
    delaiValidationHeures: 1,
    numeroCompteOuTelephone: '+221 78 000 00 00',
    instructions: 'Composez le code marchand Orange Money ou effectuez un transfert direct.',
  },
  {
    id: 'pm-virement',
    code: 'VIREMENT',
    libelle: 'Virement Bancaire UEMOA',
    description: 'Règlement direct par transfert interbancaire avec mention de la référence du bien.',
    actif: true,
    parDefaut: false,
    estParDefaut: false,
    fraisPourcentage: 0,
    delaiValidationHeures: 24,
    banqueNom: 'CBAO Attijariwafa Bank',
    instructions: 'Effectuez votre virement sur le compte bancaire de l’agence.',
  },
  {
    id: 'pm-cheque',
    code: 'CHEQUE',
    libelle: 'Chèque Certifié',
    description: 'Dépôt de chèque certifié à l’ordre de la gérance immobilière.',
    actif: true,
    parDefaut: false,
    estParDefaut: false,
    fraisPourcentage: 0,
    delaiValidationHeures: 48,
    instructions: 'Chèque certifié émis à l’ordre de la gérance.',
  },
];

/**
 * Charge l'ensemble des données d'une agence depuis Supabase
 * RÈGLE ABSOLUE : Si la base est vide ou aucune donnée n'existe, renvoie des tableaux vides []
 */
export async function loadFullApplicationData(agencyId?: string): Promise<AppStateData> {
  const emptyState: AppStateData = {
    agency: null,
    properties: [],
    owners: [],
    tenants: [],
    contracts: [],
    payments: [],
    reminders: [],
    inspections: [],
    maintenance: [],
    disbursements: [],
    invoices: [],
    cashVouchers: [],
    notifications: [],
    auditLogs: [],
    settings: defaultSettings,
    users: [],
    paymentMethods: defaultPaymentMethods,
    cashMovements: [],
    cashClosings: [],
  };

  if (!isSupabaseConfigured || !supabase) {
    return emptyState;
  }

  try {
    // Si agencyId est fourni, filtrer par agence
    const agencyFilter = (query: any) => (agencyId ? query.eq('agency_id', agencyId) : query);

    const [
      agencyRes,
      propsRes,
      ownersRes,
      tenantsRes,
      contractsRes,
      paymentsRes,
      cashMovRes,
      cashCloseRes,
      maintRes,
      inspRes,
      disbRes,
      invRes,
      remindRes,
      auditRes,
      notifRes,
      pmRes,
      settingsRes,
      usersRes,
    ] = await Promise.allSettled([
      agencyId ? supabase.from('agencies').select('*').eq('id', agencyId).maybeSingle() : Promise.resolve({ data: null }),
      agencyFilter(supabase.from('properties').select('*').is('deleted_at', null)),
      agencyFilter(supabase.from('owners').select('*').is('deleted_at', null)),
      agencyFilter(supabase.from('tenants').select('*').is('deleted_at', null)),
      agencyFilter(supabase.from('contracts').select('*')),
      agencyFilter(supabase.from('payments').select('*').is('deleted_at', null).order('created_at', { ascending: false })),
      agencyFilter(supabase.from('cash_movements').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('cash_closings').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('maintenance_tickets').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('property_inspections').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('disbursements').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('invoices').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('tenant_reminders').select('*').order('created_at', { ascending: false })),
      agencyFilter(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)),
      agencyFilter(supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)),
      agencyFilter(supabase.from('payment_methods_config').select('*')),
      agencyId ? supabase.from('agency_settings').select('*').eq('agency_id', agencyId).maybeSingle() : Promise.resolve({ data: null }),
      agencyFilter(supabase.from('profiles').select('*')),
    ]);

    if (agencyRes.status === 'fulfilled' && agencyRes.value.data) {
      emptyState.agency = agencyRes.value.data as unknown as Agency;
    }
    if (propsRes.status === 'fulfilled' && propsRes.value.data) {
      emptyState.properties = propsRes.value.data as unknown as Property[];
    }
    if (ownersRes.status === 'fulfilled' && ownersRes.value.data) {
      emptyState.owners = ownersRes.value.data as unknown as Owner[];
    }
    if (tenantsRes.status === 'fulfilled' && tenantsRes.value.data) {
      emptyState.tenants = tenantsRes.value.data as unknown as Tenant[];
    }
    if (contractsRes.status === 'fulfilled' && contractsRes.value.data) {
      emptyState.contracts = contractsRes.value.data as unknown as LeaseContract[];
    }
    if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
      emptyState.payments = paymentsRes.value.data as unknown as Payment[];
    }
    if (cashMovRes.status === 'fulfilled' && cashMovRes.value.data) {
      emptyState.cashMovements = cashMovRes.value.data as unknown as CashMovement[];
    }
    if (cashCloseRes.status === 'fulfilled' && cashCloseRes.value.data) {
      emptyState.cashClosings = cashCloseRes.value.data as unknown as CashClosing[];
    }
    if (maintRes.status === 'fulfilled' && maintRes.value.data) {
      emptyState.maintenance = maintRes.value.data as unknown as MaintenanceTicket[];
    }
    if (inspRes.status === 'fulfilled' && inspRes.value.data) {
      emptyState.inspections = inspRes.value.data as unknown as Inspection[];
    }
    if (disbRes.status === 'fulfilled' && disbRes.value.data) {
      emptyState.disbursements = disbRes.value.data as unknown as OwnerDisbursement[];
    }
    if (invRes.status === 'fulfilled' && invRes.value.data) {
      emptyState.invoices = invRes.value.data as unknown as Invoice[];
    }
    if (remindRes.status === 'fulfilled' && remindRes.value.data) {
      emptyState.reminders = remindRes.value.data as unknown as TenantReminder[];
    }
    if (auditRes.status === 'fulfilled' && auditRes.value.data) {
      emptyState.auditLogs = auditRes.value.data as unknown as AuditLog[];
    }
    if (notifRes.status === 'fulfilled' && notifRes.value.data) {
      emptyState.notifications = notifRes.value.data as unknown as NotificationItem[];
    }
    if (pmRes.status === 'fulfilled' && pmRes.value.data && pmRes.value.data.length > 0) {
      emptyState.paymentMethods = pmRes.value.data as unknown as PaymentMethodConfig[];
    }
    if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
      emptyState.settings = { ...defaultSettings, ...settingsRes.value.data };
    }
    if (usersRes.status === 'fulfilled' && usersRes.value.data) {
      emptyState.users = usersRes.value.data.map((p: any) => ({
        id: p.id,
        agencyId: p.agency_id,
        email: p.email,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        role: p.role,
        statut: p.statut,
        permissions: p.permissions || [],
        avatar: p.avatar_url,
        proprietaireId: p.proprietaire_id,
        locataireId: p.locataire_id,
        derniereConnexion: p.derniere_connexion,
        organisation: emptyState.agency?.name || 'FITAL-IMMO',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }
  } catch (err) {
    console.error('Erreur chargement Supabase:', err);
  }

  return emptyState;
}

/**
 * Récupère le profil utilisateur connecté depuis la table profiles
 */
export async function fetchUserProfile(userId: string): Promise<UserAccount | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, agencies(name, slug, logo_url)')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.warn('Profil non trouvé ou erreur Supabase:', error);
      return null;
    }

    return {
      id: profile.id,
      agencyId: profile.agency_id,
      email: profile.email,
      nom: profile.nom,
      prenom: profile.prenom,
      telephone: profile.telephone,
      role: profile.role,
      statut: profile.statut,
      permissions: profile.permissions || [],
      avatar: profile.avatar_url,
      proprietaireId: profile.proprietaire_id,
      locataireId: profile.locataire_id,
      derniereConnexion: profile.derniere_connexion,
      organisation: profile.agencies?.name || 'FITAL-IMMO',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch (e) {
    console.error('Erreur fetchUserProfile:', e);
    return null;
  }
}

/**
 * Mise à jour réelle du mot de passe via Supabase Auth
 */
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase n’est pas configuré.' };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur inconnue lors du changement de mot de passe.' };
  }
}

/**
 * Enregistrement réel d'un log d'audit dans Supabase
 */
export async function logSystemAudit(log: Partial<AuditLog>, agencyId?: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !agencyId) return;

  try {
    await supabase.from('audit_logs').insert([{
      agency_id: agencyId,
      user_nom: log.userNom || log.utilisateur || 'Système',
      action: log.action || 'ACTION',
      module: log.module || log.entite || 'SYSTÈME',
      entity_type: log.entityType || log.entite || 'GENERAL',
      entity_ref: log.entityRef || log.entiteId || 'N/A',
      details: log.details || '',
    }]);
  } catch (e) {
    console.warn('Erreur insertion audit log:', e);
  }
}

/**
 * CRUD Supabase : Propriétés
 */
export async function savePropertyToDb(property: Partial<Property>, agencyId: string): Promise<{ success: boolean; data?: Property; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: property as Property };
  }

  try {
    const record = {
      agency_id: agencyId,
      ref: property.ref || `BIEN-${Date.now()}`,
      nom: property.nom,
      type: property.type,
      adresse: property.adresse,
      quartier: property.quartier || 'Dakar',
      ville: property.ville || 'Dakar',
      proprietaire_id: property.proprietaireId,
      loyer_base: property.loyerBase,
      charges: property.charges || 0,
      tva_applicable: property.tvaApplicable || false,
      statut: property.statut || 'Vacant',
      superficie: property.superficie || 0,
      nombre_pieces: property.nombrePieces || 3,
      description: property.description || '',
    };

    if (property.id && !property.id.startsWith('prop-tmp-')) {
      const { data, error } = await supabase
        .from('properties')
        .update(record)
        .eq('id', property.id)
        .eq('agency_id', agencyId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Property };
    } else {
      const { data, error } = await supabase
        .from('properties')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Property };
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde propriété:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le bien immobilier.' };
  }
}

/**
 * CRUD Supabase : Propriétaires
 */
export async function saveOwnerToDb(owner: Partial<Owner>, agencyId: string): Promise<{ success: boolean; data?: Owner; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: owner as Owner };
  }

  try {
    const record = {
      agency_id: agencyId,
      ref: owner.ref || `PRO-${Date.now()}`,
      nom: owner.nom,
      prenom: owner.prenom,
      telephone: owner.telephone,
      email: owner.email,
      adresse: owner.adresse || '',
      banque: owner.banque || 'CBAO Attijariwafa',
      compte_bancaire: owner.compteBancaire || '',
      mandat_gerance: owner.mandatGerance || `MANDAT-${Date.now()}`,
      taux_commission: owner.tauxCommission ?? 10,
      statut: owner.statut || 'Actif',
      observations: owner.observations || '',
    };

    if (owner.id && !owner.id.startsWith('own-tmp-')) {
      const { data, error } = await supabase
        .from('owners')
        .update(record)
        .eq('id', owner.id)
        .eq('agency_id', agencyId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Owner };
    } else {
      const { data, error } = await supabase
        .from('owners')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Owner };
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde propriétaire:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le propriétaire.' };
  }
}

/**
 * CRUD Supabase : Locataires
 */
export async function saveTenantToDb(tenant: Partial<Tenant>, agencyId: string): Promise<{ success: boolean; data?: Tenant; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: tenant as Tenant };
  }

  try {
    const record = {
      agency_id: agencyId,
      ref: tenant.ref || `LOC-${Date.now()}`,
      nom: tenant.nom,
      prenom: tenant.prenom,
      telephone: tenant.telephone,
      email: tenant.email,
      cni: tenant.cni || '',
      fonction: tenant.fonction || '',
      employeur: tenant.employeur || '',
      revenu_mensuel: tenant.revenuMensuel || 0,
      statut: tenant.statut || 'À jour',
      score_solvabilite: tenant.scoreSolvabilite || 85,
      bien_id: tenant.bienId || null,
      proprietaire_id: tenant.proprietaireId || null,
      date_entree: tenant.dateEntree || new Date().toISOString().split('T')[0],
      loyer_mensuel: tenant.loyerMensuel || 0,
      arrieres_cumules: tenant.arrieresCumules || 0,
      jours_retard: tenant.joursRetard || 0,
      observations: tenant.observations || '',
    };

    if (tenant.id && !tenant.id.startsWith('ten-tmp-')) {
      const { data, error } = await supabase
        .from('tenants')
        .update(record)
        .eq('id', tenant.id)
        .eq('agency_id', agencyId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Tenant };
    } else {
      const { data, error } = await supabase
        .from('tenants')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Tenant };
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde locataire:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le locataire.' };
  }
}

/**
 * CRUD Supabase : Contrats
 */
export async function saveContractToDb(contract: Partial<LeaseContract>, agencyId: string): Promise<{ success: boolean; data?: LeaseContract; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: contract as LeaseContract };
  }

  try {
    const record = {
      agency_id: agencyId,
      ref: contract.ref || `BAIL-${Date.now()}`,
      type_contrat: contract.typeContrat || 'Bail d’habitation',
      locataire_id: contract.locataireId,
      bien_id: contract.bienId,
      proprietaire_id: contract.proprietaireId,
      loyer_base: contract.loyerBase,
      charges: contract.charges || 0,
      caution_loyer: contract.cautionLoyer || 0,
      caution_eau: contract.cautionEau || 0,
      caution_electricite: contract.cautionElectricite || 0,
      frais_adhesion: contract.fraisAdhesion || 0,
      date_debut: contract.dateDebut,
      date_fin: contract.dateFin,
      type_reglement: contract.typeReglement || 'Mensuel',
      jour_echeance: 5,
      statut: contract.statut || 'En cours',
    };

    if (contract.id && !contract.id.startsWith('con-tmp-')) {
      const { data, error } = await supabase
        .from('contracts')
        .update(record)
        .eq('id', contract.id)
        .eq('agency_id', agencyId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as LeaseContract };
    } else {
      const { data, error } = await supabase
        .from('contracts')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as LeaseContract };
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde contrat:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le contrat de bail.' };
  }
}

/**
 * CRUD Supabase : Paiements & Quittances
 */
export async function savePaymentToDb(payment: Partial<Payment>, agencyId: string, authorId?: string): Promise<{ success: boolean; data?: Payment; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: payment as Payment };
  }

  try {
    const record = {
      agency_id: agencyId,
      ref: payment.ref || `PAY-${Date.now()}`,
      quittance_numero: payment.quittanceNumero || `QUI-${Date.now()}`,
      locataire_id: payment.locataireId,
      bien_id: payment.bienId,
      proprietaire_id: payment.proprietaireId,
      periode: payment.periode,
      loyer_base: payment.loyerBase,
      charges: payment.charges || 0,
      tva: payment.tva || 0,
      tom: payment.tom || 0,
      penalites: payment.penalites || 0,
      montant_total: payment.montantTotal,
      montant_paye: payment.montantPaye,
      montant_restant: payment.montantRestant || 0,
      statut: payment.statut || 'Payé',
      mode_paiement: payment.modePaiement,
      moyen_paiement_code: payment.moyenPaiementCode || 'ESPECES',
      verification_statut: payment.verificationStatut || 'valide',
      reference_transaction: payment.referenceTransaction || null,
      proof_url: payment.justificatifUrl || null,
      date_paiement: payment.datePaiement || new Date().toISOString().split('T')[0],
      date_echeance: payment.dateEcheance || new Date().toISOString().split('T')[0],
      recu_par: payment.recuPar || 'Service Gérance',
      caissier_id: authorId || null,
      observation: payment.observation || '',
    };

    if (payment.id && !payment.id.startsWith('pay-tmp-')) {
      const { data, error } = await supabase
        .from('payments')
        .update(record)
        .eq('id', payment.id)
        .eq('agency_id', agencyId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Payment };
    } else {
      const { data, error } = await supabase
        .from('payments')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as unknown as Payment };
    }
  } catch (err: any) {
    console.error('Erreur enregistrement paiement:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le paiement.' };
  }
}

/**
 * Validation comptable réelle d'un paiement (Wave / OM / Virement)
 */
export async function validatePendingPaymentInDb(paymentId: string, agencyId: string, validatedBy: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        statut: 'Payé',
        verification_statut: 'valide',
        validated_by: validatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('agency_id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Erreur validation paiement:', err);
    return { success: false, error: err.message || 'Impossible de valider ce paiement.' };
  }
}

/**
 * Rejet d'un paiement en attente
 */
export async function rejectPendingPaymentInDb(paymentId: string, agencyId: string, motif?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        statut: 'Impayé',
        verification_statut: 'rejete',
        observation: motif || 'Paiement rejeté par le responsable de caisse',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('agency_id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Erreur rejet paiement:', err);
    return { success: false, error: err.message || 'Impossible de rejeter ce paiement.' };
  }
}

/**
 * CRUD Caisse : Mouvement de caisse réel
 */
export async function saveCashMovementToDb(movement: Partial<CashMovement>, agencyId: string, authorId?: string): Promise<{ success: boolean; data?: CashMovement; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: movement as CashMovement };
  }

  try {
    const record = {
      agency_id: agencyId,
      reference: movement.id?.startsWith('csh-') ? movement.id : `CSH-${Date.now()}`,
      type: movement.type,
      montant: movement.montant,
      description: movement.libelle || movement.motif || 'Mouvement de caisse',
      moyen_paiement_code: movement.moyenPaiementCode || 'ESPECES',
      user_id: authorId || null,
      user_nom: movement.auteurNom || 'Caissier',
      beneficiaire: movement.beneficiaire || null,
      justificatif_ref: movement.justificatifRef || null,
      statut: 'Validé',
    };

    const { data, error } = await supabase
      .from('cash_movements')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as unknown as CashMovement };
  } catch (err: any) {
    console.error('Erreur enregistrement mouvement caisse:', err);
    return { success: false, error: err.message || 'Impossible d’enregistrer le mouvement de caisse.' };
  }
}

/**
 * CRUD Caisse : Clôture journalière réelle
 */
export async function saveCashClosingToDb(closing: Partial<CashClosing>, agencyId: string, caissierId: string, caissierNom: string): Promise<{ success: boolean; data?: CashClosing; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: closing as CashClosing };
  }

  try {
    const record = {
      agency_id: agencyId,
      reference: `CLO-${Date.now()}`,
      date_cloture: closing.dateCloture || new Date().toISOString().split('T')[0],
      caissier_id: caissierId,
      caissier_nom: caissierNom,
      solde_initial: closing.soldeInitial || 0,
      total_entrees_especes: closing.totalEntreesEspeces || 0,
      total_sorties_especes: closing.totalSortiesEspeces || 0,
      solde_theorique: closing.soldeTheorique || 0,
      solde_reel: closing.soldeReel || 0,
      ecart: closing.ecart || 0,
      details_comptage: closing.detailsComptage || {},
      observations: closing.observations || '',
      statut: closing.statut || 'Validé par Responsable',
    };

    const { data, error } = await supabase
      .from('cash_closings')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as unknown as CashClosing };
  } catch (err: any) {
    console.error('Erreur enregistrement clôture caisse:', err);
    return { success: false, error: err.message || 'Impossible de finaliser la clôture de caisse.' };
  }
}

/**
 * Upload réel vers Supabase Storage
 */
export async function uploadFileToSupabaseStorage(
  bucket: 'agency-logos' | 'property-images' | 'documents' | 'payment-proofs' | 'avatars',
  filePath: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase Storage non configuré.' };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('Erreur upload Supabase Storage:', err);
    return { success: false, error: err.message || 'Impossible d’uploader le fichier.' };
  }
}

/**
 * Change le mot de passe de l'utilisateur connecté via Supabase Auth
 * Utilise strictement supabase.auth.updateUser({ password: newPassword })
 */
export async function changeUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Si Supabase n'est pas configuré (mode local), on valide localement
    return { success: true };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erreur changement mot de passe Supabase:', err);
    return {
      success: false,
      error: err.message || 'Impossible de mettre à jour le mot de passe sur Supabase.',
    };
  }
}

/**
 * Déconnecte la session Supabase
 */
export async function signOutSession(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erreur lors du signOut Supabase:', err);
    }
  }
  // Nettoyage des clés locales d'authentification
  localStorage.removeItem('fital_immo_session');
  localStorage.removeItem('fital_immo_user');
}

/**
 * Récupère la session active Supabase
 */
export async function getAuthSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Erreur getSession Supabase:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.warn('Erreur verification session:', err);
    return null;
  }
}

/**
 * Suppression douce (Soft delete) pour préserver l'intégrité comptable
 */
export async function softDeleteRecord(
  table: 'properties' | 'owners' | 'tenants' | 'contracts' | 'invoices',
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(table)
      .update({ statut: 'Archivé' })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Erreur archivage ${table}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Persiste une collection locale dans le cache local et synchronise si possible avec Supabase
 */
export function persistCollection(key: string, data: any[]): void {
  try {
    localStorage.setItem(`fital_immo_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Supabase Service] Impossible de persister la collection ${key} en local:`, err);
  }
}


