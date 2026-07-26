"use client";

import React, { useState } from "react";
import { X, Check, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";

export interface CreatorBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBio: string;
  onBioSaved: (newBio: string) => void;
}

export function CreatorBioModal({
  isOpen,
  onClose,
  currentBio,
  onBioSaved,
}: CreatorBioModalProps) {
  const supabase = createClient();
  const [bio, setBio] = useState(currentBio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!bio.trim()) {
      setError("Please enter a bio before saving.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: saveError } = await supabase.from("creators").upsert({
      id: user.id,
      bio: bio.trim(),
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    onBioSaved(bio.trim());
    setSuccess(true);
    setSaving(false);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-950/60 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden space-y-4">
        {/* Mobile Top Drag Bar */}
        <div className="w-12 h-1.5 rounded-full bg-surface-200 mx-auto shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-surface-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-100 text-surface-900 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-surface-900 leading-tight">
                Creator Bio & Intro
              </h3>
              <p className="text-[11px] sm:text-xs text-surface-500">
                Describe your filming style and specialties for visiting brands
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 p-2 rounded-xl border border-surface-200 min-h-10 min-w-10 flex items-center justify-center shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Creator bio updated successfully!
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-surface-700 uppercase tracking-wider block">
              Bio / Brand Pitch Intro
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g., On-camera UGC video creator with 3+ years experience creating high-converting TikTok & Instagram Reels video ads for e-commerce brands..."
              required
              className="w-full rounded-xl border border-surface-200 bg-white p-3 text-xs font-medium text-surface-900 outline-none focus:border-surface-400 transition-colors min-h-24 leading-relaxed"
            />
            <p className="text-[11px] text-surface-400">
              This bio will appear on your public storefront (`elaura.com/@yourname`).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 transition-colors min-h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 min-h-11 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{saving ? "Saving Bio..." : "Save Bio"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
