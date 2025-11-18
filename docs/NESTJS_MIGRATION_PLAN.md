# Plan de Migration vers NestJS

## 📦 Assets Disponibles (Tag: `security-reference`)

### ✅ Code Réutilisable

#### 1. **Logique de Vérification Web3**
**Fichiers sources :**
- `src/utils/security/signature.ts` - Vérification signature Ethereum
- `src/services/nonce.service.ts` - Génération et validation nonces

**Destination NestJS :**
```
src/
  auth/
    services/
      signature.service.ts    ← Adapter signature.ts
      nonce.service.ts        ← Adapter nonce.service.ts
```

**Modifications nécessaires :**
- Ajouter décorateur `@Injectable()`
- Injecter les dépendances via constructeur
- Remplacer Map en mémoire par Redis ou PostgreSQL

#### 2. **Configuration JWT**
**Fichiers sources :**
- `src/utils/security/jwtConfig.ts`
- `src/utils/security/token.ts`

**Destination NestJS :**
```typescript
// app.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '24h' },
})
```

#### 3. **Types TypeScript**
**Fichiers sources :**
- `src/types/index.ts` (AuthRequest, JWTPayload, etc.)

**Destination NestJS :**
```
src/
  auth/
    dto/
      challenge-request.dto.ts
      verify-signature.dto.ts
    interfaces/
      jwt-payload.interface.ts
```

### ❌ Code à Remplacer

#### Middleware → Guards
```typescript
// ❌ Express Middleware (actuel)
src/middleware/authMiddleware.ts

// ✅ NestJS Guard (futur)
src/auth/guards/jwt-auth.guard.ts
```

#### Router → Decorators
```typescript
// ❌ Express Router (actuel)
router.post('/api/v1/auth/verify', verifySignature);

// ✅ NestJS Controller (futur)
@Controller('auth')
export class AuthController {
  @Post('verify')
  async verify(@Body() dto: VerifySignatureDto) { }
}
```

#### Controllers → NestJS Controllers
```typescript
// ❌ Express Controller (actuel)
export const verifySignature = async (req: Request, res: Response) => {
  const { address, signature } = req.body;
  // ...
  res.json({ data: { token } });
};

// ✅ NestJS Controller (futur)
@Post('verify')
async verify(@Body() dto: VerifySignatureDto): Promise<AuthResponse> {
  return this.authService.verify(dto);
}
```

## 🚀 Workflow de Migration

### Phase 1 : Setup NestJS (1-2h)
1. Installer NestJS CLI globalement
2. Créer nouveau projet NestJS
3. Configurer Sequelize pour NestJS
4. Migrer les modèles (User, Project, Task, etc.)

### Phase 2 : Authentification Web3 (2-3h)
1. Créer module `AuthModule`
2. Adapter `SignatureService` et `NonceService`
3. Créer `JwtStrategy` (remplace authMiddleware)
4. Créer `JwtAuthGuard`
5. Créer DTOs avec validation

### Phase 3 : Migration Controllers (3-4h)
1. Créer modules métier (Users, Projects, Tasks, Steps)
2. Adapter les controllers un par un
3. Appliquer `@UseGuards(JwtAuthGuard)` aux routes protégées

### Phase 4 : Tests & Documentation (2h)
1. Tester les endpoints avec Postman/Thunder Client
2. Mettre à jour la documentation API
3. Créer des tests E2E

## 📚 Ressources NestJS

- [Documentation officielle](https://docs.nestjs.com)
- [Guards & Authentication](https://docs.nestjs.com/guards)
- [Sequelize Integration](https://docs.nestjs.com/techniques/database#sequelize-integration)
- [JWT Strategy](https://docs.nestjs.com/security/authentication#jwt-token)

## ⚠️ Points d'Attention

1. **Nonces en mémoire** : Actuellement stockés dans une Map. Migrer vers Redis ou PostgreSQL.
2. **Rate Limiting** : Non implémenté. Utiliser `@nestjs/throttler`.
3. **CORS** : Reconfigurer dans `main.ts` de NestJS.
4. **Environment Variables** : Utiliser `@nestjs/config`.

## 🔗 Liens Utiles

- Tag de référence : `security-reference`
- Branch actuelle (stable) : `main`
- Branch migration : `feat/nestjs-migration` (à créer)