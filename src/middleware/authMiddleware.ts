import { Request, Response, NextFunction } from 'express';
import JWT, { JwtPayload } from '../utils/security/token';
// Import type augmentation for req.user
import '../types';

/**
 * Middleware d'authentification JWT (obligatoire)
 * Vérifie la présence et la validité du token JWT
 * Bloque la requête si le token est absent ou invalide
 * 
 * Utilisation: 
 * router.get('/api/v1/protected', authenticateJWT, controller);
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraire le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token manquant. Header Authorization requis avec format: Bearer <token>',
      });
      return;
    }

    // Extraire le token (après "Bearer ")
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token invalide',
      });
      return;
    }

    // Vérifier et décoder le token
    const decoded = JWT.verify(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré',
      });
      return;
    }

    // Attacher les données utilisateur à la requête
    req.user = decoded;

    // Continuer vers le contrôleur
    next();
  } catch (error) {
    console.error('Error in authenticateJWT:', error);
    res.status(401).json({
      success: false,
      error: 'Échec de l\'authentification',
    });
  }
};

/**
 * Middleware d'authentification optionnelle
 * Vérifie le token s'il est présent, mais ne bloque pas si absent
 * Utile pour les routes publiques qui peuvent avoir un comportement différent si authentifié
 * 
 * Utilisation:
 * router.get('/api/v1/public', optionalAuth, controller);
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Si pas de header, continuer sans authentification
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    // Vérifier le token s'il est présent
    const decoded = JWT.verify(token);

    if (decoded) {
      req.user = decoded;
    }

    // Continuer dans tous les cas
    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    // (token invalide mais la route est publique)
    next();
  }
};

/**
 * Middleware de vérification de rôle
 * DOIT être utilisé APRÈS authenticateJWT
 * Vérifie que l'utilisateur a un des rôles autorisés
 * 
 * Utilisation:
 * router.delete('/api/v1/projects/:id', authenticateJWT, requireRole('Owner'), controller);
 */
export const requireRole = (...allowedRoles: Array<'Owner' | 'Builder'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise. Utilisez le middleware authenticateJWT avant requireRole.',
      });
      return;
    }

    // Vérifier le rôle
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes',
        details: {
          required: allowedRoles,
          current: req.user.role,
        },
      });
      return;
    }

    // Rôle valide, continuer
    next();
  };
};
