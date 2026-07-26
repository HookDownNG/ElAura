"use client";

import React from "react";
import {
  X,
  Package,
  Plus,
  Trash2,
  Check,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import type { CreatorPackage, CreatorCategory } from "@/types";

export const UGC_PACKAGE_TEMPLATES = [
  {
    type: "ugc_video",
    label: "1x 30s Human UGC Video Ad",
    category: "human",
  },
  {
    type: "ugc_hooks_bundle",
    label: "3x UGC Video Ad Hooks Bundle",
    category: "human",
  },
  {
    type: "unboxing_review",
    label: "Product Unboxing & Review Video",
    category: "human",
  },
  { type: "ai_ugc_avatar", label: "1x AI Avatar UGC Video Ad", category: "ai" },
  {
    type: "ai_voiceover_script",
    label: "AI Script + Voiceover UGC Ad",
    category: "ai",
  },
] as const;

export interface UgcPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorCategory: CreatorCategory;
  setCreatorCategory: (cat: CreatorCategory) => void;
  packages: CreatorPackage[];
  setPackages: React.Dispatch<React.SetStateAction<CreatorPackage[]>>;
  onSave: () => Promise<void>;
  saving: boolean;
  error: string | null;
  success: boolean;
}

export function UgcPackageModal({
  isOpen,
  onClose,
  creatorCategory,
  setCreatorCategory,
  packages,
  setPackages,
  onSave,
  saving,
  error,
  success,
}: UgcPackageModalProps) {
  if (!isOpen) return null;

  function addPackageFromTemplate(tpl: (typeof UGC_PACKAGE_TEMPLATES)[number]) {
    if (packages.some((p) => p.type === tpl.type)) return;
    setPackages((prev) => [
      { type: tpl.type as CreatorPackage["type"], label: tpl.label, price: 0 },
      ...prev,
    ]);
  }

  function addPackage() {
    setPackages((prev) => [
      {
        type: "custom",
        label: "Custom UGC Video Package",
        price: 0,
      },
      ...prev,
    ]);
  }

  function updatePackage(
    index: number,
    field: keyof CreatorPackage,
    value: string | number,
  ) {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)),
    );
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-950/60 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div className="relative w-full max-w-2xl max-h-[88vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden space-y-3">
        {/* Mobile Top Drag Bar */}
        <div className="w-12 h-1.5 rounded-full bg-surface-200 mx-auto shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-surface-100 pb-3 shrink-0 pt-1 sm:pt-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-surface-900 leading-tight">
                UGC Packages & Creator Type
              </h3>
              <p className="text-[11px] sm:text-xs text-surface-500 leading-normal">
                Set your rates so brands can hire you for human or AI UGC
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

        {/* Scrollable Form Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-medium border border-emerald-200 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              UGC Profile & Packages saved!
            </div>
          )}

          {/* Creator Category Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
              Select Creator Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCreatorCategory("human_ugc")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                  creatorCategory === "human_ugc"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 font-bold"
                    : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                }`}
              >
                <User className="h-4 w-4 mb-1 text-emerald-600" />
                <span className="text-[11px]">Human UGC</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatorCategory("ai_ugc")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                  creatorCategory === "ai_ugc"
                    ? "bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200 font-bold"
                    : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                }`}
              >
                <Bot className="h-4 w-4 mb-1 text-purple-600" />
                <span className="text-[11px]">AI UGC</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatorCategory("hybrid")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                  creatorCategory === "hybrid"
                    ? "bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-200 font-bold"
                    : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                }`}
              >
                <Sparkles className="h-4 w-4 mb-1 text-brand-600" />
                <span className="text-[11px]">Hybrid</span>
              </button>
            </div>
          </div>

          {/* Quick Add Templates */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
              Quick Add Templates
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-1 px-1">
              {UGC_PACKAGE_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => addPackageFromTemplate(t)}
                  disabled={packages.some((p) => p.type === t.type)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold border border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 min-h-10"
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Packages List */}
          <div className="space-y-3 pt-1">
            <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
              Active Packages
            </label>
            {packages.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-surface-200 rounded-xl">
                <Package className="h-6 w-6 text-surface-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-surface-600">
                  No packages added yet
                </p>
                <p className="text-[11px] text-surface-400 mt-0.5">
                  Use quick-add templates above
                </p>
              </div>
            ) : (
              packages.map((pkg, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center rounded-xl border border-surface-200 bg-surface-50/80 p-3 sm:p-3.5 space-y-2 sm:space-y-0"
                >
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-surface-400 sm:hidden block mb-1">
                      PACKAGE NAME
                    </label>
                    <input
                      type="text"
                      value={pkg.label}
                      onChange={(e) =>
                        updatePackage(i, "label", e.target.value)
                      }
                      placeholder="Package name (e.g., 1x 30s UGC Video)"
                      className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 sm:w-32">
                      <label className="text-[10px] font-bold text-surface-400 sm:hidden block mb-1">
                        RATE (₦)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                          ₦
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            pkg.price ? Number(pkg.price).toLocaleString("en-US") : ""
                          }
                          onChange={(e) => {
                            const rawDigits = e.target.value.replace(/[^0-9]/g, "");
                            updatePackage(
                              i,
                              "price",
                              rawDigits ? Number(rawDigits) : 0,
                            );
                          }}
                          placeholder="0"
                          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-7 pr-3 text-xs font-bold text-surface-900 outline-none focus:border-brand-400 transition-colors min-h-11"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePackage(i)}
                      className="text-surface-400 hover:text-red-500 transition-colors p-2.5 rounded-xl border border-surface-200 sm:border-0 bg-white sm:bg-transparent min-h-11 min-w-11 flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={addPackage}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors pt-1 min-h-11"
            >
              <Plus className="h-4 w-4" /> Add custom package
            </button>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-surface-100 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial rounded-xl border border-surface-200 px-4 py-2.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 transition-colors min-h-11"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 sm:flex-initial rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 min-h-11"
          >
            {saving ? "Saving..." : "Save UGC Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
