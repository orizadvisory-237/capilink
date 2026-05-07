"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Upload, CheckCircle } from "lucide-react";
import type { DocumentUploadItem, TypeDocument } from "@/lib/types";

interface DocumentUploadProps {
  label: string;
  type: TypeDocument;
  required?: boolean;
  accept?: string;
  maxSizeMo?: number;
  document: DocumentUploadItem | undefined;
  onUpload: (doc: DocumentUploadItem) => void;
  onRemove: (id: string) => void;
}

/** Composant drag & drop pour upload de documents (simulation locale) */
export function DocumentUpload({
  label,
  type,
  required = false,
  accept = ".pdf",
  maxSizeMo = 10,
  document: doc,
  onUpload,
  onRemove,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMo * 1024 * 1024) {
        alert(`Le fichier ne doit pas dépasser ${maxSizeMo} Mo`);
        return;
      }

      // Simulation d'un upload avec progression fictive
      const newDoc: DocumentUploadItem = {
        id: `doc_${Date.now()}`,
        nom: file.name,
        type,
        fichier: file,
        taille: file.size,
        statut: "TELECHARGE",
        progression: 100,
      };
      onUpload(newDoc);
    },
    [type, maxSizeMo, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (doc && doc.statut === "TELECHARGE") {
    return (
      <div className="flex items-center justify-between p-4 border border-[#2D6A4F] rounded-lg bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#2D6A4F]" />
          <div>
            <p className="text-sm font-medium text-[#0A1628]">{doc.nom}</p>
            <p className="text-xs text-[#6B7280]">
              {(doc.taille / 1024 / 1024).toFixed(1)} Mo — Téléchargé ✓
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(doc.id)}
          className="p-1 hover:bg-red-100 rounded"
          aria-label="Supprimer le document"
        >
          <X size={16} className="text-[#C0392B]" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        "hover:border-[#C9A84C] hover:bg-amber-50/30",
        "border-gray-300 bg-white"
      )}
    >
      <Upload size={24} className="mx-auto mb-2 text-[#6B7280]" />
      <p className="text-sm font-medium text-[#0A1628]">
        {label} {required && <span className="text-[#C0392B]">*</span>}
      </p>
      <p className="text-xs text-[#6B7280] mt-1">
        Glissez-déposez ou cliquez — {accept.toUpperCase()}, max {maxSizeMo} Mo
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
}
