import {
  Property,
  Owner,
  Tenant,
  LeaseContract,
  Payment,
  TenantReminder,
  Inspection,
  PropertyInspection,
  OwnerDisbursement,
  OwnerPaymentSlip,
  MaintenanceTicket,
  Invoice,
  CashVoucher,
  NotificationItem,
  AuditLog,
  AgencySettings,
  UserAccount,
  PaymentMethodConfig,
  CashMovement,
  CashClosing,
} from '../types';

/**
 * FITAL-IMMO PRODUCTION CONFIGURATION
 * RÈGLE ABSOLUE : ZÉRO DONNÉE FICTIVE EN PRODUCTION
 * Tous les tableaux de données métier (biens, locataires, propriétaires, contrats, paiements)
 * sont initialisés à vide []. Les données réelles proviennent exclusivement de Supabase.
 */

export const INITIAL_OWNERS: Owner[] = [];
export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_CONTRACTS: LeaseContract[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_REMINDERS: TenantReminder[] = [];
export const INITIAL_INSPECTIONS: PropertyInspection[] = [];
export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [];
export const INITIAL_DISBURSEMENTS: OwnerDisbursement[] = [];
export const INITIAL_PAYMENT_SLIPS: OwnerPaymentSlip[] = [];

export const initialProperties: Property[] = [];
export const initialOwners: Owner[] = [];
export const initialTenants: Tenant[] = [];
export const initialContracts: LeaseContract[] = [];
export const initialPayments: Payment[] = [];
export const initialReminders: TenantReminder[] = [];
export const initialInspections: Inspection[] = [];
export const initialMaintenance: MaintenanceTicket[] = [];
export const initialDisbursements: OwnerDisbursement[] = [];
export const initialInvoices: Invoice[] = [];
export const initialCashVouchers: CashVoucher[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialUsers: UserAccount[] = [];
export const initialCashMovements: CashMovement[] = [];
export const initialCashClosings: CashClosing[] = [];

export const initialSettings: AgencySettings = {
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

export const initialPaymentMethods: PaymentMethodConfig[] = [
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
    instructions: 'Scannez le QR Code Wave ou utilisez le numéro marchand officiel.',
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
