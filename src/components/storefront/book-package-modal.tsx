"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Send, Sparkles, Building2, Mail, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { CreatorPackage, Creator } from "@/types";

export interface BookPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
  selectedPackage: CreatorPackage | null;
}

export function BookPackageModal({
  isOpen,
  onClose,
  creator,
  selectedPackage,
}: BookPackageModalProps) {
  const supabase = createClient();

  const [brandName, setBrandName] = useState("");
  const [brandEmail, setBrandEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !selectedPackage) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!brandName.trim() || !brandEmail.trim() || !projectDetails.trim()) {
      setError("Please complete all fields to send your brief.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Submit proposal / application notification in database
      const { error: dbError } = await supabase.from("notifications").insert({
        user_id: creator.id,
        type: "package_booking",
        title: `New Booking Request from ${brandName.trim()}`,
        message: `${brandName.trim()} requested package: "${selectedPackage?.label}" (₦${Number(selectedPackage?.price || 0).toLocaleString("en-US")}). Email: ${brandEmail.trim()}`,
        metadata: {
          brand_name: brandName.trim(),
          brand_email: brandEmail.trim(),
          project_details: projectDetails.trim(),
          package_label: selectedPackage?.label,
          package_price: selectedPackage?.price,
        },
      });

      if (dbError) {
        setError(dbError.message);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch {
      setError("Something went wrong submitting your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-950/60 backdrop-blur-xs p-0 sm:p-4 select-none transition-all">
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden space-y-4">
        {/* Mobile Top Handle */}
        <div className="w-12 h-1.5 rounded-full bg-surface-200 mx-auto shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-surface-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900 leading-tight">
                Order UGC Package
              </h3>
              <p className="text-xs text-surface-500">
                Book @{creator.user_name || "creator"} directly for your ad campaign
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

        {/* Selected Package Highlight Box */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
            SELECTED PACKAGE
          </span>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-surface-900 truncate">
              {selectedPackage.label}
            </p>
            <span className="text-sm font-black text-brand-700 shrink-0">
              ₦{Number(selectedPackage.price || 0).toLocaleString("en-US")}
            </span>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 py-1">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-700 font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Order request sent! The creator will review and contact you shortly.</span>
            </div>
          )}

          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-surface-400" />
              <span>Brand / Company Name</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Acme Wear or Brand Co."
              required
              className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
            />
          </div>

          {/* Brand Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-surface-400" />
              <span>Contact Work Email</span>
            </label>
            <input
              type="email"
              value={brandEmail}
              onChange={(e) => setBrandEmail(e.target.value)}
              placeholder="marketing@company.com"
              required
              className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
            />
          </div>

          {/* Project Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-surface-400" />
              <span>Campaign & Video Brief Details</span>
            </label>
            <textarea
              rows={3}
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              placeholder="Describe your product, target audience, and key script talking points..."
              required
              className="w-full rounded-xl border border-surface-200 bg-white p-3 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-surface-200 px-4 py-2.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 transition-colors min-h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 text-xs font-bold shadow-md shadow-brand-100/50 transition-all disabled:opacity-50 min-h-11"
            >
              {submitting ? (
                "Sending Request..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Order Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
