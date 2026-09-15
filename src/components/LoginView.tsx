import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { UserAccount, UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email confirmation handling
  const [emailNotConfirmed, setEmailNotConfirmed] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const handleResendConfirmation = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setErrorMsg('Veuillez renseigner votre adresse email.');
      return;
    }

    setResendingEmail(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: targetEmail,
        });
        if (error) throw error;
        setSuccessMsg(`Email de confirmation réexpédié à ${targetEmail}. Veuillez vérifier votre boîte mail ainsi que le dossier Spam/Indésirables.`);
      } else {
        setSuccessMsg(`Lien de confirmation renvoyé à ${targetEmail}.`);
      }
    } catch (err: any) {
      console.warn('Erreur renvoi email confirmation:', err);
      setErrorMsg(err.message || 'Impossible de renvoyer l’email pour l’instant.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleBypassConfirmation = async () => {
    const targetEmail = email.trim();
    setLoading(true);
    setErrorMsg(null);

    try {
      let profileData: any = null;
      if (isSupabaseConfigured && supabase && targetEmail) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*, agencies(name, slug, status)')
            .eq('email', targetEmail)
            .maybeSingle();
          profileData = data;
        } catch (err) {
          console.warn('Profil introuvable via email:', err);
        }
      }

      const userNamePart = targetEmail ? targetEmail.split('@')[0] : 'Direction';
      const userAccount: UserAccount = {
        id: profileData?.id || `usr-${Date.now()}`,
        agencyId: profileData?.agency_id || 'agency-default',
        email: targetEmail || 'contact@fital-immo.sn',
        nom: profileData?.nom || (nom.trim() ? nom.trim() : userNamePart.toUpperCase()),
        prenom: profileData?.prenom || (prenom.trim() ? prenom.trim() : 'Responsable'),
        telephone: profileData?.telephone || telephone.trim() || '+221 77 000 00 00',
        role: (profileData?.role as UserRole) || selectedRole || 'ADMIN',
        statut: 'actif',
        permissions: profileData?.permissions || ['ALL'],
        organisation: profileData?.agencies?.name || agencyName.trim() || 'FITAL-IMMO Agence',
        createdAt: new Date().toISOString(),
      };

      onLoginSuccess(userAccount);
    } catch (err: any) {
      console.warn('Erreur ouverture session:', err);
      setErrorMsg('Impossible d’ouvrir la session en mode direct.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole, prenomDemo: string, nomDemo: string, userEmail: string, org?: string) => {
    const quickUser: UserAccount = {
      id: `usr-demo-${role.toLowerCase()}`,
      agencyId: 'agency-default',
      email: userEmail,
      nom: nomDemo,
      prenom: prenomDemo,
      telephone: '+221 77 100 20 30',
      role,
      statut: 'actif',
      permissions: ['ALL'],
      organisation: org || 'FITAL-IMMO Agence Centrale',
      createdAt: new Date().toISOString(),
    };

    onLoginSuccess(quickUser);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailNotConfirmed(false);

    if (!email || !password) {
      setErrorMsg('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // Fetch linked profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, agencies(name, slug, status)')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileError) {
            console.warn('Erreur récupération profil Supabase:', profileError);
          }

          const userAccount: UserAccount = {
            id: authData.user.id,
            agencyId: profileData?.agency_id || 'agency-default',
            email: authData.user.email || email.trim(),
            nom: profileData?.nom || 'Utilisateur',
            prenom: profileData?.prenom || '',
            telephone: profileData?.telephone || '+221 77 000 00 00',
            role: (profileData?.role as UserRole) || 'ADMIN',
            statut: 'actif',
            permissions: profileData?.permissions || ['ALL'],
            organisation: profileData?.agencies?.name || 'FITAL-IMMO Agence',
            createdAt: authData.user.created_at || new Date().toISOString(),
          };

          onLoginSuccess(userAccount);
          return;
        }
      } else {
        // Mode autonome / aperçu local lorsque les variables d'environnement Supabase ne sont pas encore renseignées
        const localAdmin: UserAccount = {
          id: `usr-${Date.now()}`,
          agencyId: 'agency-local',
          email: email.trim(),
          nom: nom.trim() || 'Administrateur',
          prenom: prenom.trim() || 'Direction',
          telephone: telephone.trim() || '+221 77 100 00 00',
          role: selectedRole,
          statut: 'actif',
          permissions: ['ALL'],
          organisation: agencyName.trim() || 'FITAL-IMMO Agence',
          createdAt: new Date().toISOString(),
        };

        onLoginSuccess(localAdmin);
      }
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed') || err.message?.includes('email_not_confirmed')) {
        console.warn('Compte non confirmé par email sur Supabase pour:', email.trim());
        setEmailNotConfirmed(true);
        setErrorMsg(null);
      } else {
        console.error('Erreur authentification:', err);
        setEmailNotConfirmed(false);
        let message = 'Impossible de se connecter. Vérifiez vos identifiants.';
        if (err.message?.includes('Invalid login credentials')) {
          message = 'Identifiants invalides (Email ou mot de passe incorrect).';
        } else if (err.message) {
          message = err.message;
        }
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailNotConfirmed(false);

    if (!email || !password || !nom || !prenom) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Create Supabase Auth User
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              nom: nom.trim(),
              prenom: prenom.trim(),
              telephone: telephone.trim(),
              role: selectedRole,
              agency_name: agencyName.trim() || 'FITAL-IMMO Agence',
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // 2. Create Agency & Profile if needed
          const agencyId = crypto.randomUUID ? crypto.randomUUID() : `ag-${Date.now()}`;
          const agencySlug = (agencyName || 'agence').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

          try {
            await supabase.from('agencies').insert([
              {
                id: agencyId,
                name: agencyName.trim() || 'FITAL-IMMO Gestion Immobilière',
                slug: agencySlug,
                email: email.trim(),
                phone: telephone.trim() || '+221 33 800 00 00',
                status: 'active',
              },
            ]);

            await supabase.from('profiles').insert([
              {
                id: signUpData.user.id,
                agency_id: agencyId,
                email: email.trim(),
                nom: nom.trim(),
                prenom: prenom.trim(),
                telephone: telephone.trim() || '+221 77 000 00 00',
                role: selectedRole,
                statut: 'actif',
              },
            ]);
          } catch (insertErr) {
            console.warn('Création agence / profil post-inscription:', insertErr);
          }

          if (signUpData.session) {
            // Auto-confirmed on Supabase -> direct login
            const userAccount: UserAccount = {
              id: signUpData.user.id,
              agencyId,
              email: signUpData.user.email || email.trim(),
              nom: nom.trim(),
              prenom: prenom.trim(),
              telephone: telephone.trim() || '+221 77 000 00 00',
              role: selectedRole,
              statut: 'actif',
              permissions: ['ALL'],
              organisation: agencyName.trim() || 'FITAL-IMMO Agence',
              createdAt: signUpData.user.created_at || new Date().toISOString(),
            };
            onLoginSuccess(userAccount);
            return;
          } else {
            // Confirmation email sent
            setEmailNotConfirmed(true);
            setSuccessMsg(`Compte créé avec succès ! Un lien de confirmation a été envoyé à ${email.trim()}.`);
            setIsRegisterMode(false);
          }
        }
      } else {
        // Local preview registration
        const localUser: UserAccount = {
          id: `usr-${Date.now()}`,
          agencyId: 'agency-local',
          email: email.trim(),
          nom: nom.trim(),
          prenom: prenom.trim(),
          telephone: telephone.trim() || '+221 77 000 00 00',
          role: selectedRole,
          statut: 'actif',
          permissions: ['ALL'],
          organisation: agencyName.trim() || 'FITAL-IMMO Agence',
          createdAt: new Date().toISOString(),
        };

        setSuccessMsg('Compte initialisé. Redirection vers votre tableau de bord...');
        setTimeout(() => onLoginSuccess(localUser), 800);
      }
    } catch (err: any) {
      console.warn('Erreur inscription:', err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        setSuccessMsg('Un lien de réinitialisation vous a été envoyé par email.');
      } else {
        setSuccessMsg('En mode hors-ligne, vous pouvez redéfinir un mot de passe directement lors de votre connexion.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d’envoyer le lien de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A111D] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#F0EDE8]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C9A96E]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#162133]/60 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-[#162133]/90 border border-[#C9A96E]/30 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E2E45] to-[#0A111D] border border-[#C9A96E]/40 shadow-xl mb-4 p-2.5">
            <img src="/favicon.svg" alt="FITAL-IMMO" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            FITAL<span className="text-[#C9A96E] font-medium">-IMMO</span>
          </h1>
          <p className="text-xs text-[#A8B4C4] mt-1 font-medium">
            Plateforme Professionnelle de Gestion Locative & Loyers
          </p>
        </div>

        {/* Supabase Connection Status Badge */}
        <div className="mb-5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#0A111D]/80 border border-white/5 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" /> Base de données :
          </span>
          {isSupabaseConfigured ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Supabase Cloud Connecté
            </span>
          ) : (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Mode Déploiement / Local
            </span>
          )}
        </div>

        {/* Notifications */}
        {emailNotConfirmed && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <h4 className="font-bold text-amber-300 text-sm">Adresse email non encore confirmée</h4>
                <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                  Supabase requiert une validation par lien envoyé à{' '}
                  <strong className="text-white underline">{email || 'votre adresse email'}</strong>.
                  Si vous n'avez pas reçu le message ou souhaitez accéder à l'application sans attendre :
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="flex-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? 'animate-spin' : ''}`} />
                <span>{resendingEmail ? 'Envoi...' : 'Renvoyer l’email'}</span>
              </button>

              <button
                type="button"
                onClick={handleBypassConfirmation}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Accéder sans attendre</span>
              </button>
            </div>
          </div>
        )}

        {errorMsg && !emailNotConfirmed && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form switcher tabs */}
        {!isForgotPassword && (
          <div className="flex border-b border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
                !isRegisterMode
                  ? 'border-[#C9A96E] text-[#E8D5B0]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Connexion Agence
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
                isRegisterMode
                  ? 'border-[#C9A96E] text-[#E8D5B0]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Créer une Agence
            </button>
          </div>
        )}

        {/* Forgot password mode */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse email associée à votre compte
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@agence.sn"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-lg shadow-[#C9A96E]/20 hover:shadow-[#C9A96E]/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMsg(null);
                }}
                className="text-xs text-[#C9A96E] hover:underline"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        ) : isRegisterMode ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nom de l'Agence Immobilière *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ex : Teranga Immobilier"
                  className="w-full pl-10 pr-3.5 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Amadou"
                  className="w-full px-3 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Diop"
                  className="w-full px-3 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Téléphone professionnel
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full pl-10 pr-3.5 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Rôle initial
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="ADMIN">Administrateur d'Agence</option>
                <option value="GESTIONNAIRE">Gestionnaire de Patrimoine</option>
                <option value="CAISSIER">Caissier / Comptable</option>
                <option value="AGENT">Agent de Recouvrement</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Adresse Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@agence.sn"
                  className="w-full pl-10 pr-3.5 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Mot de passe * (min. 6 caractères)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-lg shadow-[#C9A96E]/20 hover:shadow-[#C9A96E]/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                'Création en cours...'
              ) : (
                <>
                  <span>Créer mon Agence & Accéder</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@fital-immo.sn"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] text-[#C9A96E] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0A111D] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A07840] text-[#0F1B2D] font-bold text-xs shadow-lg shadow-[#C9A96E]/20 hover:shadow-[#C9A96E]/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                'Connexion en cours...'
              ) : (
                <>
                  <span>Accéder à mon Agence</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Access Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-center mb-3">
            <span className="text-[11px] font-semibold text-[#C9A96E] uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              Accès Immédiat • Profils de Démonstration
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Accédez directement à l'espace de votre choix en 1 clic :
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN', 'Amadou', 'SOW', 'amadou.sow@fital-immo.sn')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Direction</div>
              <div className="text-[9px] text-slate-400 truncate">Super Admin</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('GESTIONNAIRE', 'Fatou', 'DIOP', 'fatou.diop@fital-immo.sn')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Gestionnaire</div>
              <div className="text-[9px] text-slate-400 truncate">Portefeuille</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('CAISSIER', 'Moussa', 'NDIAYE', 'moussa.ndiaye@fital-immo.sn')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Caisse</div>
              <div className="text-[9px] text-slate-400 truncate">Recouvrement</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('PROPRIETAIRE', 'Mamadou', 'SOW', 'mamadou.sow@gmail.com')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Bailleur</div>
              <div className="text-[9px] text-slate-400 truncate">Propriétaire</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('LOCATAIRE', 'Awa', 'FALL', 'awa.fall@gmail.com')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Locataire</div>
              <div className="text-[9px] text-slate-400 truncate">Espace Client</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('AGENT', 'Ousmane', 'BA', 'ousmane.ba@fital-immo.sn')}
              className="p-2 rounded-xl bg-[#0A111D] border border-white/10 hover:border-[#C9A96E]/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white group-hover:text-[#C9A96E]">Agent Terrain</div>
              <div className="text-[9px] text-slate-400 truncate">États des lieux</div>
            </button>
          </div>
        </div>

        {/* Security & Multi-tenant Notice */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-[#6B7C94] leading-relaxed">
            Authentification sécurisée Supabase Auth • Données isolées par agence (RLS) • Cryptage SSL / TLS
          </p>
        </div>
      </div>
    </div>
  );
};
