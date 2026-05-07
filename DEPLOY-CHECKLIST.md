# 🚀 Capilink — Checklist de Déploiement

## Prérequis

- [ ] Compte Vercel configuré
- [ ] Projet Supabase créé (zone EU-West pour le Cameroun)
- [ ] Compte Twilio avec WhatsApp Business API activé
- [ ] Compte Resend avec domaine vérifié (capilink.cm)

---

## 1. Variables d'environnement Vercel

Configurer ces variables dans **Settings → Environment Variables** :

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

### NextAuth
```
NEXTAUTH_SECRET=<générer avec `openssl rand -base64 32`>
NEXTAUTH_URL=https://capilink.cm
```

### Twilio (WhatsApp)
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+237...
```

### Resend (Email)
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@capilink.cm
RESEND_FROM_NAME=Capilink by Oriz Advisory
```

### URLs applicatives
```
NEXT_PUBLIC_APP_URL=https://capilink.cm
NEXT_PUBLIC_ORIZ_WHATSAPP=+237...
```

---

## 2. Configuration Supabase

### Base de données
- [ ] Exécuter `npx prisma db push` pour créer les tables
- [ ] Exécuter `npx prisma db seed` pour les données initiales (utilisateurs admin/analyste, projets de démo)

### Storage
- [ ] Créer le bucket `documents-projets` dans Supabase Storage
- [ ] Configurer la politique d'accès :
  - Upload : authentifié via Service Role Key (côté serveur)
  - Download : public pour les URLs publiques, signé pour les documents privés

### RLS (Row Level Security)
- [ ] Les opérations sont effectuées côté serveur via la Service Role Key → RLS ne bloque pas nos requêtes
- [ ] Si nécessaire pour le client direct, ajouter des politiques par rôle

---

## 3. Configuration Twilio

- [ ] Activer le Sandbox WhatsApp ou configurer un numéro Business
- [ ] Enregistrer les templates de messages dans la console Twilio
  - Template `accusé_reception`
  - Template `paiement_confirme`
  - Template `scoring_termine`
  - etc.
- [ ] Tester l'envoi vers un numéro +237

---

## 4. Configuration Resend

- [ ] Vérifier le domaine `capilink.cm` (DNS TXT/DKIM)
- [ ] Tester l'envoi d'un email de test
- [ ] Surveiller le tableau de bord Resend pour les bounces/plaintes

---

## 5. Déploiement

```bash
# Premier déploiement
vercel

# Les déploiements suivants seront automatiques via GitHub
git push origin main
```

### Post-déploiement
- [ ] Vérifier que toutes les pages chargent correctement
- [ ] Tester l'authentification (inscription → connexion → redirection)
- [ ] Tester le parcours complet porteur (soumission → paiement → scoring)
- [ ] Tester la vitrine investisseur (filtrage → détail → contact)
- [ ] Vérifier les headers de sécurité (https://securityheaders.com)
- [ ] Tester la génération PDF (scoring → rapport)
- [ ] Vérifier les notifications (email + WhatsApp)

---

## 6. Domaine personnalisé

- [ ] Ajouter `capilink.cm` dans Vercel → Settings → Domains
- [ ] Configurer les enregistrements DNS chez le registrar :
  - `A` → `76.76.21.21`
  - `CNAME www` → `cname.vercel-dns.com`
- [ ] Attendre la propagation DNS (24-48h max)
- [ ] Vérifier le certificat SSL automatique

---

## 7. Monitoring post-launch

- [ ] Activer Vercel Analytics
- [ ] Configurer les alertes d'erreur (Vercel → Monitoring)
- [ ] Surveiller les logs de notifications (Twilio/Resend dashboards)
- [ ] Planifier les sauvegardes Supabase (automatiques dans le plan Pro)
