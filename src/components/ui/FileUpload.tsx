"use client";

import { useState, useRef } from "react";

interface UploadedFile {
  url: string;
  nom: string;
  taille: number;
}

interface Props {
  type: "photos" | "documents";
  accept: string;
  multiple?: boolean;
  label: string;
  onUpload: (files: UploadedFile[]) => void;
  showUploadedList?: boolean;
}

export default function FileUpload({ type, accept, multiple = false, label, onUpload, showUploadedList = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const newFiles: UploadedFile[] = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("type", type);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newFiles.push(data);
        } else {
          const data = await res.json().catch(() => null);
          uploadErrors.push(data?.error || `Impossible d'envoyer ${files[i].name}`);
        }
      } catch {
        uploadErrors.push(`Erreur réseau pendant l'envoi de ${files[i].name}`);
      }
    }

    const all = [...uploadedFiles, ...newFiles];
    setUploadedFiles(all);
    onUpload(all);
    setUploading(false);
    if (uploadErrors.length > 0) {
      setError(
        uploadErrors.length === 1
          ? uploadErrors[0]
          : `${uploadErrors[0]} (+ ${uploadErrors.length - 1} autre${uploadErrors.length > 2 ? "s" : ""})`
      );
    }

    // Reset l'input
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index: number) {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    onUpload(updated);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Zone de drop / sélection */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFiles}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-primary font-medium">Upload en cours...</span>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="text-primary font-medium">Cliquez pour sélectionner</span> ou glissez vos fichiers
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {type === "photos" ? "JPEG, PNG, HEIC" : "PDF, JPEG, PNG, HEIC"} {multiple ? "(plusieurs fichiers possibles)" : ""}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Fichiers uploadés */}
      {showUploadedList && uploadedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {type === "photos" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.nom}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.taille)}</p>
                </div>
              </div>
              <button type="button" onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-600 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
