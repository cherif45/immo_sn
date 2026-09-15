import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Coins,
  Menu as MenuIcon,
  Search,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { RecoveryTrackerView } from './components/RecoveryTrackerView';
import { AutomatedRemindersView } from './components/AutomatedRemindersView';
import { PaymentsView } from './components/PaymentsView';
import { PropertiesView } from './components/PropertiesView';
import { TenantsView } from './components/TenantsView';
import { OwnersView } from './components/OwnersView';
import { ContractsView } from './components/ContractsView';
import { InspectionsView } from './components/InspectionsView';
import { MaintenanceView } from './components/MaintenanceView';
import { FinanceView } from './components/FinanceView';
import { DocumentsView } from './components/DocumentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { InvoicesView } from './components/InvoicesView';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentBulletinModal } from './components/PaymentBulletinModal';
import { CashVoucherModal } from './components/CashVoucherModal';
import { NewTenantWizardModal } from './components/NewTenantWizardModal';
import { TenantExitModal } from './components/TenantExitModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MobileMoneyPaymentModal } from './components/MobileMoneyPaymentModal';
import { QuickCommsModal } from './components/QuickCommsModal';

// Multi-role dashboards and financial modules
import { AdminControlCenterView } from './components/AdminControlCenterView';
import { AdminActivityJournalView } from './components/AdminActivityJournalView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AdminUsersView } from './components/AdminUsersView';
import { CashierDashboardView } from './components/CashierDashboardView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { TenantDashboardView } from './components/TenantDashboardView';
import { AgentDashboardView } from './components/AgentDashboardView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { CashRegisterView } from './components/CashRegisterView';
import { PendingPaymentsView } from './components/PendingPaymentsView';
import { PaymentMethodsConfigView } from './components/PaymentMethodsConfigView';
import { PaymentMethodReportsView } from './components/PaymentMethodReportsView';
import { LoginView } from './components/LoginView';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import {
  ActiveTab,
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
} from './types';

import {
  initialProperties,
  initialOwners,
  initialTenants,
  initialContracts,
  initialPayments,
  initialReminders,
  initialInspections,
  initialMaintenance,
  initialDisbursements,
  initialInvoices,
  initialCashVouchers,
  initialNotifications,
  initialAuditLogs,
  initialSettings,
  initialUsers,
  initialPaymentMethods,
  initialCashMovements,
  initialCashClosings,
} from './data/mockData';
import {
  loadFullApplicationData,
  persistCollection,
  logSystemAudit,
  signOutSession,
  getAuthSession,
} from './lib/supabase/service';

export default function App() {
  // Authentication & Multi-Account State
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Core Real Estate & Financial Domain Data
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [contracts, setContracts] = useState<LeaseContract[]>(initialContracts);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [reminders, setReminders] = useState<TenantReminder[]>(initialReminders);
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(initialMaintenance);
  const [disbursements, setDisbursements] = useState<OwnerDisbursement[]>(initialDisbursements);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [cashVouchers, setCashVouchers] = useState<CashVoucher[]>(initialCashVouchers);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [settings, setSettings] = useState<AgencySettings>(initialSettings);

  // Dynamic Payment Methods & Cash Register States
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(initialPaymentMethods);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(initialCashMovements);
  const [cashClosings, setCashClosings] = useState<CashClosing[]>(initialCashClosings);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Ce mois (Mai 2026)');

  // Modals State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [receiptModalPayment, setReceiptModalPayment] = useState<Payment | null>(null);
  const [ownerSlipModalOwner, setOwnerSlipModalOwner] = useState<Owner | null>(null);
  const [cashVoucherModalOwner, setCashVoucherModalOwner] = useState<Owner | null>(null);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState<boolean>(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState<boolean>(false);
  const [isNewTenantWizardOpen, setIsNewTenantWizardOpen] = useState<boolean>(false);
  const [tenantExitTarget, setTenantExitTarget] = useState<Tenant | null>(null);
  const [initialTenantForPayment, setInitialTenantForPayment] = useState<Tenant | null>(null);
  const [mobileMoneyModalConfig, setMobileMoneyModalConfig] = useState<{
    isOpen: boolean;
    tenantName?: string;
    tenantPhone?: string;
    propertyNom?: string;
    amount?: number;
    period?: string;
    reference?: string;
    tenantId?: string;
  } | null>(null);
  const [quickCommsModalConfig, setQuickCommsModalConfig] = useState<{
    isOpen: boolean;
    recipientName?: string;
    recipientPhone?: string;
    recipientRole?: string;
    propertyNom?: string;
    dueAmount?: number;
    daysLate?: number;
  } | null>(null);

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync / Load Initial Data from Storage / Supabase
  useEffect(() => {
    loadFullApplicationData().then((data) => {
      if (data.properties.length > 0) setProperties(data.properties);
      if (data.owners.length > 0) setOwners(data.owners);
      if (data.tenants.length > 0) setTenants(data.tenants);
      if (data.contracts.length > 0) setContracts(data.contracts);
      if (data.payments.length > 0) setPayments(data.payments);
      if (data.users.length > 0) setUsers(data.users);
      if (data.cashMovements.length > 0) setCashMovements(data.cashMovements);
      if (data.cashClosings.length > 0) setCashClosings(data.cashClosings);
      if (data.paymentMethods.length > 0) setPaymentMethods(data.paymentMethods);
      if (data.settings) setSettings(data.settings);
    });

    // Check active auth session
    getAuthSession().then(async (session) => {
      try {
        if (session?.user && supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, agencies(name, slug, status)')
            .eq('id', session.user.id)
            .maybeSingle();

          const userAccount: UserAccount = {
            id: session.user.id,
            agencyId: profile?.agency_id || 'agency-default',
            email: session.user.email || '',
            nom: profile?.nom || 'Administrateur',
            prenom: profile?.prenom || '',
            telephone: profile?.telephone || '',
            role: (profile?.role as any) || 'ADMIN',
            statut: 'actif',
            permissions: profile?.permissions || ['ALL'],
            organisation: profile?.agencies?.name || 'FITAL-IMMO Agence',
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          setCurrentUser(userAccount);
          setUsers((prev) => (prev.some((u) => u.id === userAccount.id) ? prev : [userAccount, ...prev]));
        } else {
          const localUserJson = localStorage.getItem('fital_immo_user');
          if (localUserJson) {
            try {
              const parsed = JSON.parse(localUserJson);
              if (parsed && parsed.id) {
                setCurrentUser(parsed);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('Erreur verification session auth:', err);
      } finally {
        setIsAuthLoading(false);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await signOutSession();
    try {
      localStorage.removeItem('fital_immo_user');
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  const handleTriggerAuditLog = (action: string, module: string, details: string, entityRef?: string) => {
    const userLabel = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Système';
    const userRole = currentUser ? currentUser.role : 'SYSTÈME';
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      action,
      entite: module,
      entiteId: entityRef || 'SYSTÈME',
      utilisateur: `${userLabel} (${userRole})`,
      userNom: userLabel,
      module,
      entityRef,
      details,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    logSystemAudit(newLog);
  };

  // Role-Based Route Guard / Middleware Simulation:
  // Whenever user changes or route is requested, enforce role permissions
  const checkAccessPermission = (tab: ActiveTab, user: UserAccount): boolean => {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'CAISSIER') {
      return ['dashboard', 'caisse', 'pending-payments', 'payments', 'payment-reports', 'tenants', 'finance', 'documents'].includes(tab);
    }
    if (user.role === 'PROPRIETAIRE') {
      return ['dashboard', 'properties', 'tenants', 'payments', 'finance', 'maintenance', 'documents'].includes(tab);
    }
    if (user.role === 'LOCATAIRE') {
      return ['dashboard', 'properties', 'payments', 'maintenance'].includes(tab);
    }
    if (user.role === 'AGENT') {
      return ['dashboard', 'inspections', 'properties', 'maintenance', 'recovery'].includes(tab);
    }
    if (user.role === 'GESTIONNAIRE') {
      return ['dashboard', 'owners', 'properties', 'tenants', 'contracts', 'inspections', 'recovery', 'reminders', 'maintenance', 'documents'].includes(tab);
    }
    return false;
  };

  const handleSwitchUser = (newUser: UserAccount) => {
    setCurrentUser(newUser);
    // If current tab is unauthorized for the new role, automatically redirect to dashboard
    if (!checkAccessPermission(activeTab, newUser)) {
      setActiveTab('dashboard');
    }
  };

  const handleSafeTabChange = (targetTab: ActiveTab) => {
    if (checkAccessPermission(targetTab, currentUser)) {
      setActiveTab(targetTab);
    } else {
      // Middleware blocks unauthorized access and redirects to dashboard
      setActiveTab('dashboard');
    }
  };

  // State Mutation Handlers
  const handleAddPayment = (newPayment: Payment) => {
    setPayments((prev) => [newPayment, ...prev]);

    // If paid via cash, auto record an entry in CashMovements
    if (newPayment.modePaiement === 'Espèces' || newPayment.moyenPaiementCode === 'ESPECES') {
      const newCashEntry: CashMovement = {
        id: `csh-${Date.now()}`,
        type: 'ENCAISSEMENT',
        montant: newPayment.montantPaye,
        libelle: `Encaissement loyer ${newPayment.periode} - ${newPayment.locataireNom}`,
        dateHeure: new Date().toISOString().replace('T', ' ').substring(0, 16),
        auteurId: currentUser.id,
        auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
        justificatifRef: newPayment.quittanceNumero,
        moyenPaiementCode: 'ESPECES',
      };
      setCashMovements((prev) => [newCashEntry, ...prev]);
    }

    // Update tenant status to 'À jour' if fully settled
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === newPayment.locataireId) {
          return {
            ...t,
            statut: newPayment.statut === 'Payé' ? 'À jour' : 'Retard',
            joursRetard: newPayment.statut === 'Payé' ? 0 : t.joursRetard,
            arrieresCumules: newPayment.montantRestant,
          };
        }
        return t;
      })
    );

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        action: 'ENCAISSEMENT_LOYER',
        entite: 'PAYMENT',
        entiteId: newPayment.id,
        utilisateur: `${currentUser.prenom} ${currentUser.nom} (${currentUser.role})`,
        details: `Encaissement de ${newPayment.montantPaye} FCFA pour ${newPayment.locataireNom} (${newPayment.quittanceNumero})`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Direct Mobile Money (Wave / Orange Money) Handlers
  const handleOpenMobileMoney = (tenant?: Tenant, amount?: number) => {
    const t = tenant || tenants[0];
    setMobileMoneyModalConfig({
      isOpen: true,
      tenantName: t ? `${t.prenom} ${t.nom}` : 'Client FITAL-IMMO',
      tenantPhone: t?.telephone || '+221 77 845 20 10',
      propertyNom: t?.bienNom || 'Résidence FITAL-IMMO',
      amount: amount || t?.arrieresCumules || t?.loyerMensuel || 250000,
      period: selectedPeriod,
      reference: `LOY-${(t?.nom || 'CLI').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      tenantId: t?.id,
    });
  };

  // Direct Communications (Appel / SMS / WhatsApp) Handlers
  const handleOpenQuickComms = (contact?: {
    name: string;
    phone: string;
    role?: string;
    propertyNom?: string;
    amount?: number;
    daysLate?: number;
  }) => {
    if (contact) {
      setQuickCommsModalConfig({
        isOpen: true,
        recipientName: contact.name,
        recipientPhone: contact.phone,
        recipientRole: contact.role || 'Locataire',
        propertyNom: contact.propertyNom,
        dueAmount: contact.amount,
        daysLate: contact.daysLate,
      });
    } else {
      const lateTenant = tenants.find((t) => t.statut === 'Retard') || tenants[0];
      setQuickCommsModalConfig({
        isOpen: true,
        recipientName: lateTenant ? `${lateTenant.prenom} ${lateTenant.nom}` : 'Locataire FITAL-IMMO',
        recipientPhone: lateTenant?.telephone || '+221 77 845 20 10',
        recipientRole: 'Locataire',
        propertyNom: lateTenant?.bienNom || 'Logement Dakar',
        dueAmount: lateTenant?.arrieresCumules || lateTenant?.loyerMensuel || 150000,
        daysLate: lateTenant?.joursRetard || 0,
      });
    }
  };

  const handleConfirmMobileMoneyPayment = (amount: number, method: string, transactionId: string) => {
    const tId = mobileMoneyModalConfig?.tenantId;
    const tenant = tenants.find((t) => t.id === tId) || tenants[0];
    const property = properties.find((p) => p.id === tenant?.bienId);
    const owner = owners.find((o) => o.id === (property?.proprietaireId || tenant?.proprietaireId));

    const paymentId = `pay-${Date.now()}`;
    const quittanceNum = `QUITT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newPayment: Payment = {
      id: paymentId,
      ref: transactionId || `PAY-MM-${Date.now().toString().slice(-6)}`,
      quittanceNumero: quittanceNum,
      locataireId: tenant?.id || 'loc-1',
      locataireNom: tenant ? `${tenant.prenom} ${tenant.nom}` : 'Locataire',
      bienId: property?.id || tenant?.bienId || 'bien-1',
      bienNom: property?.nom || tenant?.bienNom || 'Bien FITAL-IMMO',
      proprietaireId: owner?.id || 'prop-1',
      proprietaireNom: owner ? `${owner.prenom} ${owner.nom}` : 'Propriétaire',
      periode: mobileMoneyModalConfig?.period || selectedPeriod,
      loyerBase: amount,
      charges: 0,
      tva: 0,
      tom: 0,
      penalites: 0,
      montantTotal: amount,
      montantPaye: amount,
      montantRestant: 0,
      modePaiement: 'Mobile Money',
      moyenPaiementCode: method === 'WAVE' ? 'WAVE' : 'ORANGE_MONEY',
      numeroTransaction: transactionId,
      datePaiement: new Date().toISOString().split('T')[0],
      statut: 'Payé',
      observation: `Règlement direct validé via ${method === 'WAVE' ? 'Wave Sénégal' : 'Orange Money'} (Tx: ${transactionId})`,
      auteurId: currentUser.id,
      auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
      dateHeurePaiement: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    handleAddPayment(newPayment);
    setMobileMoneyModalConfig(null);

    // Notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        titre: `Paiement ${method} Validé`,
        message: `${amount.toLocaleString('fr-FR')} FCFA encaissés pour ${newPayment.locataireNom}. Quittance ${quittanceNum} émise.`,
        type: 'PAIEMENT',
        lu: false,
        date: 'À l\'instant',
      },
      ...prev,
    ]);
  };

  const handleValidatePendingPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          const updated: Payment = {
            ...p,
            verificationStatut: 'valide',
            statut: 'Payé',
            quittanceNumero: p.quittanceNumero || `QUITT-VAL-${Math.floor(1000 + Math.random() * 9000)}`,
            dateValidation: new Date().toISOString().split('T')[0],
            valideParId: currentUser.id,
            valideParNom: `${currentUser.prenom} ${currentUser.nom}`,
          };
          return updated;
        }
        return p;
      })
    );

    // Audit
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        action: 'VALIDATION_PAIEMENT_DIGITAL',
        entite: 'PAYMENT',
        entiteId: paymentId,
        utilisateur: `${currentUser.prenom} ${currentUser.nom}`,
        details: `Validation du paiement dématérialisé ${paymentId}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleRejectPendingPayment = (paymentId: string, reason: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            verificationStatut: 'rejete',
            statut: 'Impayé',
            motifRejet: reason,
          };
        }
        return p;
      })
    );
  };

  const handleAddCashMovement = (mov: CashMovement) => {
    setCashMovements((prev) => [mov, ...prev]);
  };

  const handleAddCashClosing = (cls: CashClosing) => {
    setCashClosings((prev) => [cls, ...prev]);
  };

  const handleUpdatePaymentMethod = (method: PaymentMethodConfig) => {
    setPaymentMethods((prev) => prev.map((m) => (m.id === method.id ? method : m)));
  };

  const handleAddPaymentMethod = (method: PaymentMethodConfig) => {
    setPaymentMethods((prev) => [...prev, method]);
  };

  const handleAddUser = (user: UserAccount) => {
    setUsers((prev) => [user, ...prev]);
  };

  const handleUpdateUserStatus = (userId: string, status: 'ACTIF' | 'INACTIF' | 'SUSPENDU') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, statut: status } : u)));
  };

  const handleUpdateUserRole = (userId: string, newRole: any) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties((prev) => {
      const next = [newProperty, ...prev];
      persistCollection('properties', next);
      return next;
    });
    handleTriggerAuditLog('AJOUT_BIEN_IMMOBILIER', 'PROPERTIES', `Création du lot ${newProperty.nom} (${newProperty.ref})`, newProperty.id);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties((prev) => {
      const next = prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p));
      persistCollection('properties', next);
      return next;
    });
    handleTriggerAuditLog('MODIFICATION_BIEN', 'PROPERTIES', `Mise à jour des informations du lot ${updatedProperty.nom}`, updatedProperty.id);
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties((prev) => {
      const next = prev.filter((p) => p.id !== propertyId);
      persistCollection('properties', next);
      return next;
    });
    handleTriggerAuditLog('SUPPRESSION_BIEN', 'PROPERTIES', `Archivage / suppression du bien ID ${propertyId}`, propertyId);
  };

  const handleAddContract = (newContract: LeaseContract) => {
    setContracts((prev) => {
      const next = [newContract, ...prev];
      persistCollection('contracts', next);
      return next;
    });
    handleTriggerAuditLog('CREATION_CONTRAT_BAIL', 'CONTRACTS', `Signature du bail ${newContract.ref} pour ${newContract.locataireNom}`, newContract.id);
  };

  const handleUpdateContract = (updatedContract: LeaseContract) => {
    setContracts((prev) => {
      const next = prev.map((c) => (c.id === updatedContract.id ? updatedContract : c));
      persistCollection('contracts', next);
      return next;
    });
  };

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    if (newTenant.bienId) {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === newTenant.bienId) {
            return {
              ...p,
              statut: 'Occupé',
              locataireActuelNom: `${newTenant.prenom} ${newTenant.nom}`,
            };
          }
          return p;
        })
      );
    }
  };

  const handleCompleteNewTenantWizard = (data: {
    tenant: Tenant;
    contract: LeaseContract;
    inspection: Inspection;
  }) => {
    handleAddTenant(data.tenant);
    setContracts((prev) => [data.contract, ...prev]);
    setInspections((prev) => [data.inspection, ...prev]);
  };

  const handleCompleteTenantExit = (data: {
    tenantId: string;
    bienId: string;
    dateSortie: string;
    inspection: Inspection;
    retenueCaution: number;
    restitutionCaution: number;
  }) => {
    setInspections((prev) => [data.inspection, ...prev]);
    setTenants((prev) =>
      prev.map((t) =>
        t.id === data.tenantId
          ? { ...t, statut: 'À jour', bienNom: `${t.bienNom} (Sorti le ${data.dateSortie})` }
          : t
      )
    );
    setProperties((prev) =>
      prev.map((p) =>
        p.id === data.bienId ? { ...p, statut: 'Vacant', locataireActuelNom: undefined } : p
      )
    );
  };

  const handleAddOwner = (newOwner: Owner) => setOwners((prev) => [newOwner, ...prev]);
  const handleAddReminder = (newReminder: TenantReminder) => setReminders((prev) => [newReminder, ...prev]);
  const handleAddInspection = (newInspection: Inspection) => setInspections((prev) => [newInspection, ...prev]);
  const handleAddTicket = (newTicket: MaintenanceTicket) => setMaintenance((prev) => [newTicket, ...prev]);
  const handleAddDisbursement = (newDisbursement: OwnerDisbursement) => setDisbursements((prev) => [newDisbursement, ...prev]);
  const handleAddInvoice = (newInvoice: Invoice) => setInvoices((prev) => [newInvoice, ...prev]);
  const handleSaveSettings = (newSettings: AgencySettings) => setSettings(newSettings);

  const handleOpenQuickReminder = (tenant: Tenant) => {
    setActiveTab('reminders');
  };

  const handleOpenNewPaymentForTenant = (tenant?: Tenant) => {
    if (tenant) {
      setInitialTenantForPayment(tenant);
    } else {
      setInitialTenantForPayment(null);
    }
    setIsNewPaymentModalOpen(true);
  };

  const unpaidCount = tenants.filter((t) => t.statut === 'Impayé' || t.statut === 'Retard').length;
  const pendingPaymentsCount = payments.filter((p) => p.verificationStatut === 'en_attente').length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A111D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A8B4C4] font-medium tracking-wide">Chargement sécurisé de FITAL-IMMO...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('fital_immo_user', JSON.stringify(user));
          setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [user, ...prev]));
          handleTriggerAuditLog('CONNEXION', 'AUTH', `Connexion réussie : ${user.prenom} ${user.nom} (${user.role})`);
        }}
      />
    );
  }

  // Filtered lists according to current user's role (RLS in memory)
  const scopedProperties = currentUser.role === 'PROPRIETAIRE'
    ? properties.filter((p) => p.proprietaireId === currentUser.proprietaireId)
    : currentUser.role === 'LOCATAIRE'
    ? properties.filter((p) => p.id === currentUser.bienId)
    : properties;

  const scopedTenants = currentUser.role === 'PROPRIETAIRE'
    ? tenants.filter((t) => t.proprietaireId === currentUser.proprietaireId)
    : currentUser.role === 'LOCATAIRE'
    ? tenants.filter((t) => t.id === currentUser.locataireId)
    : tenants;

  const scopedPayments = currentUser.role === 'PROPRIETAIRE'
    ? payments.filter((p) => p.proprietaireId === currentUser.proprietaireId)
    : currentUser.role === 'LOCATAIRE'
    ? payments.filter((p) => p.locataireId === currentUser.locataireId)
    : payments;

  return (
    <div className="min-h-screen bg-[#0A111D] text-[#F0EDE8] flex font-sans antialiased selection:bg-[#C9A96E]/30 selection:text-[#E8D5B0]">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSafeTabChange}
        unpaidCount={unpaidCount}
        urgentMaintenanceCount={maintenance.filter((m) => m.priorite === 'Urgente').length}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        pendingPaymentsCount={pendingPaymentsCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Sticky Top Navigation & Controls Bar */}
        <Topbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewPayment={() => handleOpenNewPaymentForTenant()}
          onOpenNewProperty={() => setIsNewPropertyModalOpen(true)}
          onOpenReminders={() => handleSafeTabChange('reminders')}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          unpaidCount={unpaidCount}
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={handleSwitchUser}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onSignOut={handleSignOut}
          notificationsList={notifications}
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenQuickComms={() => handleOpenQuickComms()}
          onOpenMobileMoney={() => handleOpenMobileMoney()}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 max-w-[1600px] w-full mx-auto">
          {/* 1. DASHBOARD TABS BASED ON ROLE */}
          {activeTab === 'dashboard' && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
            <DashboardView
              properties={properties}
              tenants={tenants}
              payments={payments}
              maintenance={maintenance}
              setActiveTab={handleSafeTabChange}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              onOpenQuickReminder={handleOpenQuickReminder}
              onOpenNewPayment={() => handleOpenNewPaymentForTenant()}
              onOpenNewProperty={() => setIsNewPropertyModalOpen(true)}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'CAISSIER' && (
            <CashierDashboardView
              payments={payments}
              tenants={tenants}
              owners={owners}
              cashMovements={cashMovements}
              cashClosings={cashClosings}
              paymentMethods={paymentMethods}
              onOpenNewPayment={() => handleOpenNewPaymentForTenant()}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              setActiveTab={handleSafeTabChange}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'PROPRIETAIRE' && (
            <OwnerDashboardView
              currentUser={currentUser}
              owner={owners.find((o) => o.id === currentUser.proprietaireId) || owners[0]}
              properties={scopedProperties}
              tenants={scopedTenants}
              payments={scopedPayments}
              maintenance={maintenance}
              disbursements={disbursements.filter((d) => d.proprietaireId === currentUser.proprietaireId || !currentUser.proprietaireId)}
              cashVouchers={cashVouchers.filter((v) => v.proprietaireId === currentUser.proprietaireId || !currentUser.proprietaireId)}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              onOpenOwnerSlip={(owner) => setOwnerSlipModalOwner(owner)}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'LOCATAIRE' && (
            <TenantDashboardView
              currentUser={currentUser}
              tenant={tenants.find((t) => t.id === currentUser.locataireId) || tenants[0]}
              property={properties.find((p) => p.id === (currentUser.bienId || tenants.find((t) => t.id === currentUser.locataireId)?.bienId))}
              contract={contracts.find((c) => c.locataireId === currentUser.locataireId)}
              payments={scopedPayments}
              inspections={inspections.filter((i) => i.locataireId === currentUser.locataireId)}
              maintenance={maintenance.filter((m) => m.bienId === currentUser.bienId || m.locataireNom.includes(currentUser.nom))}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              onInitiateOnlinePayment={(amount, methodCode, ref) => {
                const newP: Payment = {
                  id: `pay-${Date.now()}`,
                  ref: `PAY-${Date.now().toString().slice(-6)}`,
                  quittanceNumero: `QUI-ONLINE-${Math.floor(1000 + Math.random() * 9000)}`,
                  locataireId: currentUser.locataireId || 'loc-1',
                  locataireNom: `${currentUser.prenom} ${currentUser.nom}`,
                  bienId: currentUser.bienId || 'bien-1',
                  bienNom: properties.find((p) => p.id === currentUser.bienId)?.nom || 'Bien loué',
                  proprietaireId: 'prop-1',
                  proprietaireNom: 'Mamadou SOW',
                  periode: selectedPeriod,
                  loyerBase: amount,
                  charges: 0,
                  tva: 0,
                  tom: 0,
                  penalites: 0,
                  indemnitesOccupation: 0,
                  montantTotal: amount,
                  montantPaye: amount,
                  montantRestant: 0,
                  statut: 'Payé',
                  modePaiement: methodCode === 'WAVE' || methodCode === 'ORANGE_MONEY' ? 'Mobile Money' : 'Virement',
                  moyenPaiementCode: methodCode,
                  verificationStatut: 'en_attente',
                  referenceTransaction: ref,
                  transactionReference: ref,
                  datePaiement: new Date().toISOString().split('T')[0],
                  dateEcheance: '2026-05-05',
                  recuPar: 'Portail Locataire',
                };
                handleAddPayment(newP);
              }}
              onSubmitIncident={(title, description) => {
                const newT: MaintenanceTicket = {
                  id: `maint-${Date.now()}`,
                  titre: title,
                  bienId: currentUser.bienId || 'bien-1',
                  bienNom: properties.find((p) => p.id === currentUser.bienId)?.nom || 'Bien loué',
                  locataireNom: `${currentUser.prenom} ${currentUser.nom}`,
                  priorite: 'Moyenne',
                  coutEstime: 0,
                  dateSignalement: new Date().toISOString().split('T')[0],
                  statut: 'Signalé',
                  description: description,
                };
                handleAddTicket(newT);
              }}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'AGENT' && (
            <AgentDashboardView
              currentUser={currentUser}
              properties={properties}
              tenants={tenants}
              inspections={inspections}
              maintenance={maintenance}
              reminders={reminders}
              onOpenInspectionModal={() => handleSafeTabChange('inspections')}
              onOpenMaintenanceModal={() => handleSafeTabChange('maintenance')}
              setActiveTab={handleSafeTabChange}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'GESTIONNAIRE' && (
            <ManagerDashboardView
              properties={properties}
              tenants={tenants}
              owners={owners}
              contracts={contracts}
              payments={payments}
              maintenance={maintenance}
              reminders={reminders}
              onOpenNewContract={() => handleSafeTabChange('contracts')}
              onOpenNewTenant={() => setIsNewTenantWizardOpen(true)}
              onOpenNewReminder={() => handleSafeTabChange('reminders')}
              setActiveTab={handleSafeTabChange}
            />
          )}

          {/* 1.5. CENTRE DE CONTRÔLE ADMIN & JOURNAL D'AUDIT */}
          {activeTab === 'admin-control' && (
            <AdminControlCenterView
              users={users}
              properties={properties}
              owners={owners}
              tenants={tenants}
              payments={payments}
              cashMovements={cashMovements}
              cashClosings={cashClosings}
              paymentMethods={paymentMethods}
              auditLogs={auditLogs}
              settings={settings}
              maintenance={maintenance}
              onTriggerAuditLog={handleTriggerAuditLog}
            />
          )}

          {activeTab === 'admin-journal' && (
            <AdminActivityJournalView
              auditLogs={auditLogs}
              onTriggerAuditLog={handleTriggerAuditLog}
            />
          )}

          {/* 2. MULTI-COMPTES & UTILISATEURS (ADMIN) */}
          {activeTab === 'admin-users' && (
            <AdminUsersView
              users={users}
              currentUser={currentUser}
              owners={owners}
              tenants={tenants}
              onAddUser={handleAddUser}
              onUpdateUser={(updatedUser) => {
                setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
              }}
              onSwitchActiveUser={handleSwitchUser}
            />
          )}

          {/* 3. CAISSE & CLÔTURE */}
          {activeTab === 'caisse' && (
            <CashRegisterView
              cashMovements={cashMovements}
              cashClosings={cashClosings}
              currentUser={currentUser}
              onAddCashMovement={handleAddCashMovement}
              onAddCashClosing={handleAddCashClosing}
            />
          )}

          {/* 4. PAIEMENTS EN ATTENTE DE VALIDATION */}
          {activeTab === 'pending-payments' && (
            <PendingPaymentsView
              payments={payments}
              currentUser={currentUser}
              onValidatePayment={handleValidatePendingPayment}
              onRejectPayment={handleRejectPendingPayment}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
            />
          )}

          {/* 5. MOYENS DE PAIEMENT CONFIGURATION */}
          {activeTab === 'payment-methods' && (
            <PaymentMethodsConfigView
              paymentMethods={paymentMethods}
              onUpdatePaymentMethod={handleUpdatePaymentMethod}
              onAddPaymentMethod={handleAddPaymentMethod}
            />
          )}

          {/* 6. RAPPORTS MOYENS DE PAIEMENT */}
          {activeTab === 'payment-reports' && (
            <PaymentMethodReportsView
              payments={payments}
              paymentMethods={paymentMethods}
              owners={owners}
              properties={properties}
              tenants={tenants}
            />
          )}

          {/* 7. DOMAIN MODULES */}
          {activeTab === 'recovery' && (
            <RecoveryTrackerView
              properties={scopedProperties}
              owners={owners}
              tenants={scopedTenants}
              payments={scopedPayments}
              selectedPeriod={selectedPeriod}
              onOpenQuickReminder={handleOpenQuickReminder}
              onOpenNewPayment={handleOpenNewPaymentForTenant}
              onOpenOwnerSlip={(owner) => setOwnerSlipModalOwner(owner)}
              onAddPayment={handleAddPayment}
            />
          )}

          {activeTab === 'reminders' && (
            <AutomatedRemindersView
              tenants={scopedTenants}
              properties={scopedProperties}
              reminders={reminders}
              onAddReminder={handleAddReminder}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={scopedPayments}
              tenants={scopedTenants}
              properties={scopedProperties}
              owners={owners}
              currentUser={currentUser || undefined}
              onAddPayment={handleAddPayment}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              isNewPaymentModalOpen={isNewPaymentModalOpen}
              setIsNewPaymentModalOpen={setIsNewPaymentModalOpen}
              initialTenantForPayment={initialTenantForPayment}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesView
              properties={scopedProperties}
              owners={owners}
              currentUser={currentUser}
              onAddProperty={handleAddProperty}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
              isNewPropertyModalOpen={isNewPropertyModalOpen}
              setIsNewPropertyModalOpen={setIsNewPropertyModalOpen}
            />
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-4">
              {currentUser.role === 'ADMIN' && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsNewTenantWizardOpen(true)}
                    className="px-4 py-2.5 bg-[#C9A96E] hover:bg-[#D8BA80] text-[#0A111D] font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>✨ Assistant Nouveau Locataire (7 Étapes)</span>
                  </button>
                </div>
              )}
              <TenantsView
                tenants={scopedTenants}
                properties={scopedProperties}
                onOpenQuickReminder={handleOpenQuickReminder}
                onOpenNewPayment={handleOpenNewPaymentForTenant}
                onAddTenant={handleAddTenant}
                onOpenMobileMoney={(tenant) => handleOpenMobileMoney(tenant)}
                onAddPayment={handleAddPayment}
              />
            </div>
          )}

          {activeTab === 'owners' && (
            <OwnersView
              owners={owners}
              properties={properties}
              payments={payments}
              onOpenOwnerSlip={(owner) => setOwnerSlipModalOwner(owner)}
              onAddOwner={handleAddOwner}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView
              contracts={contracts}
              tenants={scopedTenants}
              properties={scopedProperties}
              owners={owners}
              currentUser={currentUser}
              onAddContract={handleAddContract}
              onUpdateContract={handleUpdateContract}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionsView
              inspections={inspections}
              tenants={scopedTenants}
              properties={scopedProperties}
              onAddInspection={handleAddInspection}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              tickets={maintenance}
              properties={scopedProperties}
              tenants={scopedTenants}
              onAddTicket={handleAddTicket}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              properties={scopedProperties}
              owners={owners}
              tenants={scopedTenants}
              onAddInvoice={handleAddInvoice}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              disbursements={disbursements}
              payments={scopedPayments}
              owners={owners}
              properties={scopedProperties}
              onAddDisbursement={handleAddDisbursement}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              properties={scopedProperties}
              tenants={scopedTenants}
              payments={scopedPayments}
              owners={owners}
              disbursements={disbursements}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              payments={scopedPayments}
              owners={owners}
              tenants={scopedTenants}
              contracts={contracts}
              properties={scopedProperties}
              onOpenReceipt={(payment) => setReceiptModalPayment(payment)}
              onOpenOwnerSlip={(owner) => setOwnerSlipModalOwner(owner)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Global Printable Modals */}
      {receiptModalPayment && (
        <ReceiptModal
          payment={receiptModalPayment}
          onClose={() => setReceiptModalPayment(null)}
        />
      )}

      {ownerSlipModalOwner && (
        <PaymentBulletinModal
          owner={ownerSlipModalOwner}
          properties={properties}
          tenants={tenants}
          payments={payments}
          selectedPeriod={selectedPeriod}
          onClose={() => setOwnerSlipModalOwner(null)}
        />
      )}

      {cashVoucherModalOwner && (
        <CashVoucherModal
          owner={cashVoucherModalOwner}
          montantNet={1485000}
          loyersBruts={1650000}
          commission={165000}
          periode={selectedPeriod}
          onClose={() => setCashVoucherModalOwner(null)}
        />
      )}

      {/* Wizard Modal */}
      {isNewTenantWizardOpen && (
        <NewTenantWizardModal
          properties={properties}
          onComplete={handleCompleteNewTenantWizard}
          onClose={() => setIsNewTenantWizardOpen(false)}
        />
      )}

      {/* Tenant Exit Modal */}
      {tenantExitTarget && (
        <TenantExitModal
          tenant={tenantExitTarget}
          property={properties.find((p) => p.id === tenantExitTarget.bienId)}
          onConfirmExit={handleCompleteTenantExit}
          onClose={() => setTenantExitTarget(null)}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        properties={properties}
        owners={owners}
        tenants={tenants}
        contracts={contracts}
        payments={payments}
        invoices={invoices}
        maintenance={maintenance}
        onNavigate={(targetTab) => handleSafeTabChange(targetTab)}
      />

      {/* Profile & Security Modal */}
      <UserProfileModal
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSignOut={handleSignOut}
        onUpdatePassword={(newPass) => {
          // Update password audit
          setAuditLogs((prev) => [
            {
              id: `audit-${Date.now()}`,
              action: 'MODIFICATION_MOT_DE_PASSE',
              entite: 'USER',
              entiteId: currentUser.id,
              utilisateur: `${currentUser.prenom} ${currentUser.nom}`,
              details: `Mise à jour sécurisée du mot de passe via Supabase Auth`,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }}
      />

      {/* Global Mobile Money Payment Modal (Wave & Orange Money) */}
      {mobileMoneyModalConfig && (
        <MobileMoneyPaymentModal
          isOpen={mobileMoneyModalConfig.isOpen}
          onClose={() => setMobileMoneyModalConfig(null)}
          amount={mobileMoneyModalConfig.amount || 250000}
          tenantName={mobileMoneyModalConfig.tenantName || 'Client FITAL-IMMO'}
          tenantPhone={mobileMoneyModalConfig.tenantPhone || '+221 77 845 20 10'}
          propertyNom={mobileMoneyModalConfig.propertyNom || 'Logement Dakar'}
          period={mobileMoneyModalConfig.period || selectedPeriod}
          reference={mobileMoneyModalConfig.reference || `LOY-${Date.now().toString().slice(-4)}`}
          onConfirmPayment={handleConfirmMobileMoneyPayment}
        />
      )}

      {/* Global Quick Comms Modal (Appel, SMS, WhatsApp) */}
      {quickCommsModalConfig && (
        <QuickCommsModal
          isOpen={quickCommsModalConfig.isOpen}
          onClose={() => setQuickCommsModalConfig(null)}
          tenants={tenants}
          owners={owners}
          properties={properties}
          recipientName={quickCommsModalConfig.recipientName}
          recipientPhone={quickCommsModalConfig.recipientPhone}
          recipientRole={quickCommsModalConfig.recipientRole}
          propertyNom={quickCommsModalConfig.propertyNom}
          dueAmount={quickCommsModalConfig.dueAmount}
          daysLate={quickCommsModalConfig.daysLate}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Thumb-friendly on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F1B2D]/95 backdrop-blur-xl border-t border-[#C9A96E]/20 px-2 py-1.5 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => handleSafeTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'dashboard'
              ? 'text-[#C9A96E] font-bold'
              : 'text-[#6B7C94] hover:text-[#A8B4C4]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        {currentUser.role !== 'LOCATAIRE' && (
          <button
            onClick={() => handleSafeTabChange('properties')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              activeTab === 'properties'
                ? 'text-[#C9A96E] font-bold'
                : 'text-[#6B7C94] hover:text-[#A8B4C4]'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Biens</span>
          </button>
        )}

        {currentUser.role !== 'LOCATAIRE' && currentUser.role !== 'PROPRIETAIRE' && (
          <button
            onClick={() => handleSafeTabChange('tenants')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
              activeTab === 'tenants'
                ? 'text-[#C9A96E] font-bold'
                : 'text-[#6B7C94] hover:text-[#A8B4C4]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Locataires</span>
          </button>
        )}

        <button
          onClick={() => handleSafeTabChange(currentUser.role === 'CAISSIER' ? 'caisse' : 'payments')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            activeTab === 'payments' || activeTab === 'caisse'
              ? 'text-[#C9A96E] font-bold'
              : 'text-[#6B7C94] hover:text-[#A8B4C4]'
          }`}
        >
          {currentUser.role === 'CAISSIER' ? (
            <Coins className="w-5 h-5 mb-0.5" />
          ) : (
            <CreditCard className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px]">
            {currentUser.role === 'CAISSIER' ? 'Caisse' : 'Loyers'}
          </span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[44px] ${
            isMobileSidebarOpen
              ? 'text-[#C9A96E] font-bold'
              : 'text-[#6B7C94] hover:text-[#A8B4C4]'
          }`}
        >
          <MenuIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
}
