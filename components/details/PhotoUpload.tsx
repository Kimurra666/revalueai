"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PhotoSlot } from "@/lib/types";
import { validatePhoto } from "@/lib/validation";

const SLOTS: { slot: PhotoSlot; label: string; hint: string; required: boolean }[] = [
  { slot: "front",    label: "Front",     hint: "Whole front, screen off",         required: true  },
  { slot: "back",     label: "Back",      hint: "Whole back, including camera",     required: true  },
  { slot: "screenOn", label: "Screen on", hint: "Optional – only if it turns on",   required: false },
];

interface PhotoUploadProps {
  photos: Record<PhotoSlot, File | null>;
  onChange: (slot: PhotoSlot, file: File | null) => void;
  errors: Record<string, string>;
}

export function PhotoUpload({ photos, onChange, errors }: PhotoUploadProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {SLOTS.map((s) => (
        <PhotoTile
          key={s.slot}
          {...s}
          file={photos[s.slot]}
          error={errors[`photos.${s.slot}`]}
          onChange={(file) => onChange(s.slot, file)}
        />
      ))}
    </div>
  );
}

interface PhotoTileProps {
  slot: PhotoSlot;
  label: string;
  hint: string;
  required: boolean;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

function PhotoTile({ slot, label, hint, required, file, error, onChange }: PhotoTileProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState(false);
  const id         = `photo-${slot}`;
  const shownError = localError ?? error;

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const problem = validatePhoto(f);
    setLocalError(problem);
    if (!problem) onChange(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  /* Hidden file input */
  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept="image/*"
      className="sr-only"
      aria-describedby={shownError ? `${id}-error` : `${id}-hint`}
      aria-invalid={shownError ? true : undefined}
      onChange={(e) => handleFile(e.target.files?.[0])}
    />
  );

  if (preview) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5 animate-fade-in">
        <p className="text-sm font-medium text-ink">
          {label}
          {!required && <span className="font-normal text-muted"> (optional)</span>}
        </p>

        {input}

        {/* 4:3 thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img src={preview} alt={`${label} photo preview`} className="h-full w-full object-cover" />

          {/* Remove button — top-right */}
          <button
            id={`${id}-remove`}
            type="button"
            onClick={() => { onChange(null); setLocalError(null); }}
            className="absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-white text-muted hover:text-ink hover:bg-surface"
            aria-label={`Remove ${label.toLowerCase()} photo`}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        {/* Replace link */}
        <label
          htmlFor={id}
          className="cursor-pointer self-start text-xs text-primary underline-offset-2 hover:underline"
        >
          Replace
        </label>

        {shownError && (
          <p id={`${id}-error`} className="text-xs text-danger" role="alert">
            {shownError}
          </p>
        )}
      </div>
    );
  }

  /* Empty / drag state */
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-sm font-medium text-ink">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </p>

      {input}

      <label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={[
          "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed transition-colors duration-150 px-2 text-center",
          dragOver
            ? "border-primary bg-primary-tint"
            : shownError
              ? "border-danger bg-white"
              : "border-line bg-surface hover:border-primary hover:bg-primary-tint",
        ].join(" ")}
      >
        <Camera
          className={`h-5 w-5 ${dragOver ? "text-primary" : "text-muted"}`}
          aria-hidden
        />
        <span className="text-xs font-medium text-primary">Add photo</span>
      </label>

      <p id={shownError ? `${id}-error` : `${id}-hint`} className={`text-xs ${shownError ? "text-danger" : "text-muted"}`} role={shownError ? "alert" : undefined}>
        {shownError ?? hint}
      </p>
    </div>
  );
}
