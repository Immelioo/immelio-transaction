import path from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const LOCAL_CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

// Domaines autorisés pour le proxy de téléchargement (SSRF protection)
const ALLOWED_PROXY_HOSTNAMES = new Set(["res.cloudinary.com"]);

function isAllowedRemoteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      ALLOWED_PROXY_HOSTNAMES.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function buildDisposition(filename: string) {
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function getLocalFilePath(sourceUrl: string): string {
  const publicDir = path.join(process.cwd(), "public");
  // Utiliser path.resolve pour résoudre le chemin réel, puis vérifier le préfixe
  const resolved = path.resolve(publicDir, sourceUrl.replace(/^\//, ""));
  const expectedPrefix = publicDir + path.sep;
  if (!resolved.startsWith(expectedPrefix) && resolved !== publicDir) {
    throw new Error("Path traversal détecté");
  }
  return resolved;
}

async function downloadLocalFile(sourceUrl: string, filename: string) {
  try {
    const filePath = getLocalFilePath(sourceUrl);
    const fileBuffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": LOCAL_CONTENT_TYPES[extension] || "application/octet-stream",
        "Content-Disposition": buildDisposition(filename),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    logger.error("Fichier local introuvable pour téléchargement", {
      sourceUrl,
      filename,
      error: String(error),
    });
    return null;
  }
}

export async function proxyFileDownload(
  request: NextRequest,
  sourceUrl: string,
  filename: string,
) {
  if (sourceUrl.startsWith("/")) {
    const localResponse = await downloadLocalFile(sourceUrl, filename);
    if (localResponse) return localResponse;
  }

  const absoluteUrl = sourceUrl.startsWith("/")
    ? new URL(sourceUrl, request.nextUrl.origin).toString()
    : sourceUrl;

  if (!isAllowedRemoteUrl(absoluteUrl)) {
    logger.warn("Proxy téléchargement refusé — URL non autorisée", { sourceUrl });
    return NextResponse.json({ error: "URL non autorisée" }, { status: 403 });
  }

  try {
    const upstream = await fetch(absoluteUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      logger.error("Téléchargement distant impossible", {
        sourceUrl,
        filename,
        status: upstream.status,
      });
      return NextResponse.json({ error: "Document indisponible" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Disposition", buildDisposition(filename));
    headers.set("Cache-Control", "private, no-store");

    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    logger.error("Erreur proxy téléchargement", {
      sourceUrl,
      filename,
      error: String(error),
    });
    return NextResponse.json({ error: "Document indisponible" }, { status: 502 });
  }
}
