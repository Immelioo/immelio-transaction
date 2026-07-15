import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { verifyAuth, unauthorizedResponse, rateLimitResponse } from "@/lib/auth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { getCloudinary } from "@/lib/cloudinary";

// Types MIME autorisés
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const ALLOWED_DOC_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_DOC_SIZE = 20 * 1024 * 1024;    // 20 MB


export async function POST(req: NextRequest) {
  // 1. Authentification obligatoire
  const user = await verifyAuth(req, "ADMIN_OR_PARTENAIRE");
  if (!user) return unauthorizedResponse("Connexion requise pour uploader des fichiers");

  // 2. Rate limiting
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "upload", RATE_LIMITS.upload);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "documents";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
    }

    const isPhoto = type === "photos";

    // 3. Vérification du type MIME — fallback par extension (Chrome ne reconnaît pas HEIC)
    const EXT_MIME: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      webp: "image/webp", heic: "image/heic", heif: "image/heif",
      pdf: "application/pdf",
    };
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = file.type && file.type !== "application/octet-stream"
      ? file.type
      : (EXT_MIME[ext] ?? file.type);

    const allowedTypes = isPhoto ? ALLOWED_PHOTO_TYPES : ALLOWED_DOC_TYPES;

    if (!allowedTypes.has(mimeType)) {
      logger.warn("Upload refusé — type MIME non autorisé", {
        userId: user.id, mimeType, fileName: file.name,
      });
      return NextResponse.json(
        { error: `Type de fichier non autorisé. Types acceptés : ${Array.from(allowedTypes).join(", ")}` },
        { status: 400 }
      );
    }

    // 4. Vérification de la taille
    const maxSize = isPhoto ? MAX_PHOTO_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum : ${maxSize / 1024 / 1024} MB` },
        { status: 400 }
      );
    }

    // 5. Identifiant de fichier sécurisé avec UUID (évite les noms devinables/conflits)
    const uploadFolder = isPhoto ? "immelio/photos" : "immelio/documents";
    const publicId = randomUUID();

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await getCloudinary().uploader.upload(dataUri, {
      folder: uploadFolder,
      public_id: publicId,
      resource_type: "auto", // détecte image vs PDF automatiquement
      type: "upload",
      overwrite: false,
    });

    logger.info("Fichier uploadé avec succès", {
      userId: user.id, url: result.secure_url, mimeType, size: file.size,
    });

    // Insert f_auto,q_auto so browsers receive WebP/JPEG instead of raw HEIC
    const url = result.secure_url.replace(
      "/image/upload/",
      "/image/upload/f_auto,q_auto/"
    );

    return NextResponse.json(
      { url, nom: file.name, taille: file.size },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Erreur upload", { error: String(error) });
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
