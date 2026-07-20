# Audit Upload de Fichiers — Immelio Transaction
**Date** : 2026-07-20  
**Fichier principal** : `src/app/api/upload/route.ts`

---

## Flux d'upload

```
Client (ADMIN ou PARTENAIRE)
  → POST /api/upload (multipart/form-data)
    ├── verifyAuth(ADMIN_OR_PARTENAIRE)       [auth]
    ├── checkRateLimit(ip, "upload", 10/min)  [rate limit]
    ├── Vérif MIME type (whitelist)           [type check]
    ├── Vérif taille (10MB photo / 20MB doc) [size check]
    ├── publicId = randomUUID()              [nom aléatoire]
    └── Cloudinary.uploader.upload(dataUri)  [stockage]
         → return { url, nom, taille }
```

---

## Types autorisés

| Usage | Types MIME acceptés | Taille max |
|-------|---------------------|-----------|
| Photos (`type=photos`) | image/jpeg, image/png, image/webp, image/heic, image/heif | 10 MB |
| Documents (`type=documents`) | application/pdf, image/jpeg, image/png | 20 MB |

---

## Points positifs

- ✅ Auth obligatoire (ADMIN ou PARTENAIRE uniquement)
- ✅ Whitelist MIME type stricte (Set, pas regex)
- ✅ Taille max vérifiée avant upload
- ✅ Nom de fichier Cloudinary = UUID aléatoire (pas devinable)
- ✅ `resource_type: "auto"` (Cloudinary détecte image vs PDF)
- ✅ `type: "upload"` (pas de raw URL manipulation)
- ✅ Rate limit : 10 uploads/min par IP
- ✅ Transformation automatique AVIF/WebP via `f_auto,q_auto`
- ✅ Fallback MIME depuis extension (Chrome ne reconnaît pas HEIC)

---

## Points à améliorer

### UPL-01 — MIME type client spoofable
**Sévérité** : LOW  
Le type MIME est lu depuis `file.type` (valeur envoyée par le client). Un attaquant peut envoyer un fichier `.exe` avec `Content-Type: image/jpeg`.

**Mitigation** : Cloudinary valide le contenu réel du fichier côté serveur avant de l'accepter. Il refusera un fichier non-image/PDF même si le MIME est falsifié.

**Correction optionnelle** : Lire les magic bytes du fichier avant upload pour valider le vrai type.

```ts
// Vérification magic bytes PDF
function isPdf(buffer: Uint8Array): boolean {
  return buffer[0] === 0x25 && buffer[1] === 0x50 && 
         buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
}
```

**Statut** : Acceptable (Cloudinary protège en aval)

### UPL-02 — Nom de fichier original conservé dans la réponse
Le champ `nom: file.name` est retourné au client et stocké en DB. Ce nom peut contenir des caractères spéciaux ou des chemins.

**Mitigation** : Le nom n'est utilisé que comme métadonnée (libellé), pas comme chemin de fichier. Zod `documentPartenaireSchema` limite la longueur.

**Statut** : OK

### UPL-03 — Pas de scan antivirus
**Sévérité** : LOW  
Les documents PDF ne sont pas scannés pour détecter des malwares. Pour un site B2B avec des partenaires de confiance, c'est acceptable.

**Correction future** : Intégrer Cloudinary Malware Scan add-on ou VirusTotal API.

**Statut** : Acceptable pour V1

---

## Suppression des fichiers

⚠️ Lors de la suppression d'un `documentPartenaire` via `DELETE /api/documents-partenaire/[id]`, le fichier est-il supprimé de Cloudinary ?

**À vérifier** : Lire `src/app/api/documents-partenaire/[id]/route.ts` — si la suppression en DB ne s'accompagne pas d'un `cloudinary.uploader.destroy()`, les fichiers s'accumulent sur Cloudinary.

**Recommandation** : Lors de toute suppression de document, appeler `getCloudinary().uploader.destroy(publicId)` avant ou après la suppression en DB.

---

## Storage Cloudinary

| Dossier | Usage |
|---------|-------|
| `immelio/photos` | Photos des biens et programmes |
| `immelio/documents` | Documents partenaires et biens |

Les URLs suivent le pattern : `https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/<uuid>`
