# Checklist Sécurité Capilink

## Authentification
- [x] Mots de passe hachés avec bcrypt (rounds ≥ 12)
- [x] Force mot de passe vérifiée (zxcvbn score ≥ 3)
- [x] Verrouillage compte après 5 tentatives (30 min)
- [x] Rate limiting sur toutes les routes auth (Upstash Redis)
- [x] Cookies de session : HttpOnly, Secure, SameSite=Lax
- [ ] Pas d'exposition de l'existence d'un compte (timing constant)

## Autorisation
- [x] Vérification de rôle sur chaque route API via avecGuard()
- [x] Vérification de propriété sur les ressources (projet, documents)
- [x] RLS Supabase activé sur toutes les tables
- [x] Policies RLS testées pour chaque rôle

## Validation des entrées
- [x] Validation Zod sur tous les inputs (client + serveur)
- [x] Sanitisation DOMPurify sur les champs texte libres
- [x] Validation magic bytes sur les fichiers uploadés
- [x] Taille max fichier vérifiée côté serveur
- [x] Noms de fichiers générés par le serveur (pas par l'utilisateur)

## Headers et transport
- [x] HTTPS forcé (HSTS avec preload)
- [x] CSP stricte configurée et testée (aucun unsafe-eval)
- [x] X-Frame-Options: DENY
- [x] Rapport CSP actif sur /api/security/csp-report

## Chiffrement
- [x] Données sensibles chiffrées au repos (AES-256-GCM)
  - [x] Numéros de téléphone
  - [x] Numéros de contribuable
- [x] Connexion DB via SSL (Supabase enforce SSL by default)
- [x] Secrets dans variables d'environnement uniquement

## Surveillance
- [x] Journal de sécurité actif (JournalSecurite)
- [x] Alertes email sur comportements anormaux
- [x] Page admin /admin/securite opérationnelle
- [x] Logs d'erreur 500 sans exposition des stack traces

## Dépendances
- [ ] npm audit — zéro vulnérabilité critique ou haute
- [ ] Versions épinglées dans package.json (pas de ^)
- [ ] Dependabot activé sur le repo GitHub

## Tests de pénétration à effectuer avant lancement
- [ ] Tester l'accès croisé entre porteurs (projet d'un autre porteur)
- [ ] Tester l'accès aux routes admin sans session
- [ ] Tenter l'upload d'un fichier avec extension PDF mais contenu malveillant
- [ ] Tester l'injection SQL via les champs de recherche
- [ ] Vérifier qu'aucune donnée sensible n'apparaît dans les logs Vercel
- [ ] Scanner avec OWASP ZAP en mode automatique
