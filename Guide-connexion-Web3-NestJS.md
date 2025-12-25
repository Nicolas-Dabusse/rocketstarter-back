# Guide de connexion Web3 (NestJS) – RocketStarter
_Version de travail – 25/12/2025_

## 1) Vue d’ensemble
Le backend expose un login Web3 classique : le serveur délivre un **challenge** (message + nonce) à signer, puis vérifie la signature.
En cas de succès, il renvoie un **JWT** à envoyer dans `Authorization: Bearer <token>` sur les routes protégées.

### Séquence
1. Front → `POST /auth/challenge` (address)
2. Backend → `{
   message, nonce
}`
3. Front → signature du `message` avec le wallet
4. Front → `POST /auth/verify` (address + signature)
5. Backend → `{
   accessToken
}`
6. Front → appels API protégés avec `Authorization: Bearer <token>`

## 2) Endpoints

### 2.1 `POST /auth/challenge`
**Body**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```
**Réponse (exemple)**
```json
{
  "message": "Sign this message to authenticate: <nonce>",
  "nonce": "abc123xyz..."
}
```

**Règles**
- Adresse Ethereum valide (0x + 40 hex)
- Nonce unique, expire ~5 minutes
- Signer **exactement** le `message` renvoyé

### 2.2 `POST /auth/verify`
**Body**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x..."
}
```
**Réponse (succès)**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Règles**
- Signature au format `0x...` (souvent 132+ caractères)
- Vérifie signature ⇔ message(challenge) + address
- Nonce consommé après succès (anti replay)

### 2.3 Routes protégées
Header requis :
```http
Authorization: Bearer <accessToken>
```

## 3) Erreurs fréquentes
- **Adresse invalide** → 400/401
- **Challenge expiré/introuvable** → 401 (“No valid challenge found…”)
- **Signature invalide** → 401 (“Invalid signature”)
- **JWT manquant** → 401 sur routes protégées

## 4) Écart front actuel vs backend
- Pas de `POST /auth/challenge` → pas de signature
- Auth basée sur `/users` + header custom (`x-user-address`)
- Backend attend un **JWT** (Authorization Bearer)

## 5) Modifs à faire côté front (priorités)
1. `POST /auth/challenge` avec l’adresse du wallet
2. `signMessage(message)` (wallet)
3. `POST /auth/verify` (address + signature) → récupérer `accessToken`
4. Stocker le token + l’injecter dans `Authorization` sur les requêtes API
5. L’état “authenticated” = token valide, pas uniquement adresse

### Injection du token (idée)
```js
api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## 6) Exemple d’intégration (wagmi/viem – principe)
```js
const { message } = await api.post('/auth/challenge', { address }).then(r => r.data);
const signature = await signMessageAsync({ message });
const { accessToken } = await api.post('/auth/verify', { address, signature }).then(r => r.data);
authStore.setState({ accessToken });
```

## 7) Tests sans UI (debug)
Possible via script Node (ethers) : challenge → `signMessage` → verify → coller le JWT dans Insomnia.

## 8) Checklist
- [ ] Challenge OK
- [ ] Message signé sans modification
- [ ] Verify renvoie `accessToken`
- [ ] Authorization Bearer branché partout
- [ ] Gestion des 401 (logout/retry challenge)
