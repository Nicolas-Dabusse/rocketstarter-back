import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Configuration de sanitization sécurisée
 * Supprime TOUT le HTML par défaut (texte brut uniquement)
 */
const STRICT_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [], // Aucune balise autorisée
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape', // Échappe les balises au lieu de les supprimer
};

/**
 * Configuration permissive (pour descriptions riches si nécessaire)
 * Autorise uniquement les balises de formatage basiques
 */
const PERMISSIVE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'u', 'br'], // Formatage basique uniquement
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Décorateur pour nettoyer le HTML des champs texte
 * Utilise la config STRICT par défaut (texte brut uniquement)
 *
 * @param permissive - Si true, autorise le formatage basique (b, i, em, strong, u, br)
 *
 * Usage:
 * @Sanitize() // Texte brut uniquement (défaut)
 * @Sanitize(true) // Formatage basique autorisé
 */
export function Sanitize(permissive = false) {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    if (!value || value.trim() === '') return value;

    const config = permissive ? PERMISSIVE_CONFIG : STRICT_CONFIG;
    const sanitized = sanitizeHtml(value, config).trim();

    // Protection supplémentaire : limite de longueur
    const MAX_LENGTH = 50000; // 50k caractères max
    return sanitized.length > MAX_LENGTH
      ? sanitized.substring(0, MAX_LENGTH)
      : sanitized;
  });
}

/**
 * Décorateur pour nettoyer strictement (texte brut uniquement)
 * Alias de @Sanitize() pour plus de clarté
 */
export function SanitizeText() {
  return Sanitize(false);
}

/**
 * Décorateur pour URLs - validation et nettoyage
 */
export function SanitizeUrl() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    if (!value || value.trim() === '') return value;

    const sanitized = value.trim();

    // Vérifie que c'est une URL valide (http/https uniquement)
    try {
      const url = new URL(sanitized);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return ''; // Rejette les protocoles non-http
      }
      return sanitized;
    } catch {
      return ''; // URL invalide
    }
  });
}
