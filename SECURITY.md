# 🔐 Checklist Sécurité Backend - RocketStarter

## ✅ Sécurité Actuelle (Implémentée)

### 1. **Authentification Web3 + JWT**
- ✅ Signature cryptographique via wallet Ethereum
- ✅ Challenge/nonce unique (expiration 5 min)
- ✅ Protection contre les attaques replay
- ✅ JWT avec expiration (24h)

### 2. **Cookies httpOnly**
- ✅ `httpOnly: true` → Protection XSS (JavaScript ne peut pas lire)
- ✅ `secure: true` en production → HTTPS uniquement
- ✅ `sameSite: strict` en production → Protection CSRF
- ✅ `maxAge` défini → Expiration automatique

### 3. **CORS Configuré**
- ✅ `credentials: true` → Autorise les cookies cross-origin
- ✅ Origines spécifiques définies (pas de wildcard `*`)
- ✅ Methods HTTP limitées
- ✅ Headers autorisés restreints

### 4. **Headers de Sécurité (Helmet)**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY` → Anti-clickjacking
- ✅ `X-XSS-Protection`
- ✅ `Strict-Transport-Security` (HSTS en production)
- ✅ CSP (Content Security Policy) en production

### 5. **Rate Limiting (Throttler)**
- ✅ Max 100 requêtes/minute par IP
- ✅ Protection contre les attaques DDoS
- ✅ Appliqué globalement sur toutes les routes

### 6. **Validation des Données**
- ✅ `class-validator` + `class-transformer`
- ✅ `whitelist: true` → Retire les props non définies
- ✅ `forbidNonWhitelisted: true` → Rejette les props inconnues
- ✅ Validation des adresses Ethereum (format 0x + 40 hex)

---

## ⚠️ À Faire Avant Production

### 1. **Variables d'Environnement**
```bash
# Générer un secret JWT fort
openssl rand -base64 64

# Dans .env (PRODUCTION)
NODE_ENV=production
JWT_SECRET=<votre_secret_genere>
DB_PASSWORD=<mot_de_passe_fort>
FRONTEND_URL=https://votre-domaine.com
COOKIE_DOMAIN=.votre-domaine.com
```

### 2. **HTTPS Obligatoire**
- [ ] Certificat SSL/TLS (Let's Encrypt)
- [ ] Redirection HTTP → HTTPS
- [ ] `secure: true` sur les cookies activé

### 3. **Base de Données**
- [ ] Utiliser des connexions chiffrées (SSL/TLS)
- [ ] Créer un utilisateur DB dédié (pas de superuser)
- [ ] Limiter les permissions (GRANT SELECT, INSERT, UPDATE, DELETE uniquement)
- [ ] Sauvegardes automatiques quotidiennes

### 4. **Secrets Management**
- [ ] Ne JAMAIS commit `.env` dans Git (déjà dans `.gitignore`)
- [ ] Utiliser un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rotation régulière du JWT_SECRET (tous les 3-6 mois)

### 5. **Monitoring & Logs**
- [ ] Logger les tentatives d'authentification échouées
- [ ] Alertes sur taux d'erreurs anormal
- [ ] Surveillance des requêtes suspectes
- [ ] Ne JAMAIS logger les secrets/tokens

### 6. **Docker Production**
- [ ] Utiliser un Dockerfile multi-stage (build + runtime)
- [ ] Image de base minimale (alpine)
- [ ] Scanner les vulnérabilités (`docker scan`)
- [ ] Mettre à jour régulièrement les dépendances

---

## 🔍 Tests de Sécurité Recommandés

### Avant le déploiement :
```bash
# 1. Scanner les dépendances npm
npm audit

# 2. Vérifier les secrets exposés
git secrets --scan

# 3. Linter de sécurité
npm install -g eslint-plugin-security
```

### Outils externes :
- **OWASP ZAP** : Scanner de vulnérabilités web
- **Burp Suite** : Pentesting API
- **Snyk** : Analyse de dépendances

---

## 📊 Niveaux de Sécurité

### 🟢 Développement (Actuel)
- Cookies `sameSite: lax`
- `secure: false` (HTTP autorisé)
- CORS permissif (localhost)
- Logs détaillés

### 🟡 Staging
- Cookies `sameSite: strict`
- `secure: true` (HTTPS)
- CORS restreint
- Monitoring actif

### 🔴 Production
- Tout ce qui est en staging +
- WAF (Web Application Firewall)
- CDN avec protection DDoS
- Audits de sécurité réguliers

---

## 🚨 Incidents de Sécurité

En cas de compromission :
1. Révoquer immédiatement le `JWT_SECRET`
2. Forcer la déconnexion de tous les utilisateurs
3. Analyser les logs
4. Corriger la faille
5. Notifier les utilisateurs si données exposées

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
