"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Building2,
  CheckCircle2,
  CreditCard,
  Globe,
  Phone,
  Clock,
  MapPin,
  Save,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GlobalLoader } from "@/components/ui/global-loader";
import type { Creator, Profile } from "@/types";

export default function CreatorSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettingsData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Fetch Profile and Creator details concurrently in parallel
      const [{ data: profData }, { data: creatorData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("creators").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (profData) {
        setProfile(profData);
        if (profData.avatar_url) {
          setAvatarUrl(profData.avatar_url);
        }
      }

      if (creatorData) {
        setCreator(creatorData);
      }

      setLoading(false);
    }

    loadSettingsData();
  }, [router, supabase]);

  /**
   * Resizes and compresses any image file into an optimized ~80KB-150KB JPEG blob
   * before uploading to Supabase Storage.
   */
  function compressAndConvertToJpegBlob(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  }

  /**
   * Instantly compresses & uploads selected photo to profile_pics bucket with in-frame loading indicator
   */
  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError("Image file size should be less than 15MB");
      return;
    }

    setUploadingAvatar(true);
    setImageError(false);
    setError(null);
    setSuccess(null);

    // Instant local preview URL
    const tempUrl = URL.createObjectURL(file);
    setAvatarUrl(tempUrl);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setUploadingAvatar(false);
        return;
      }

      // Compress raw file to 800x800 JPEG (reduces size from 5-10MB to ~80KB)
      // Unique file path for standard INSERT (bypasses PostgreSQL ON CONFLICT UPDATE RLS policy errors)
      const compressedJpegBlob = await compressAndConvertToJpegBlob(file);
      const filePath = `${user.id}_${Date.now()}.jpg`;

      // Upload directly to profile_pics Supabase Storage Bucket
      const { data: uploadData, error: storageErr } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, compressedJpegBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (storageErr) {
        setError(`Image Upload Error: ${storageErr.message}`);
        setUploadingAvatar(false);
        return;
      }

      const actualPath = uploadData?.path || filePath;

      const { data: publicUrlData } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(actualPath);

      if (publicUrlData?.publicUrl) {
        const freshPublicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        // Instantly upsert database profile row
        await supabase.from("profiles").upsert({
          id: user.id,
          avatar_url: freshPublicUrl,
          updated_at: new Date().toISOString(),
        });

        setAvatarUrl(freshPublicUrl);
        setSuccess("Profile picture updated successfully!");
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(`Upload Error: ${detail}`);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Synchronously capture form data BEFORE async await points prevent e.currentTarget access
    const formData = new FormData(e.currentTarget);

    setSaving(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const fullName = (formData.get("full_name") as string)?.trim() || null;
    const userName =
      (formData.get("user_name") as string)?.trim().toLowerCase() || null;
    const finalAvatarUrl = avatarUrl?.trim() || null;
    const bio = (formData.get("bio") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const shippingAddress =
      (formData.get("shipping_address") as string)?.trim() || null;
    const contentLanguage =
      (formData.get("content_language") as string)?.trim() || null;
    const turnaroundDaysRaw = formData.get("turnaround_days") as string;
    const turnaroundDays = turnaroundDaysRaw
      ? parseInt(turnaroundDaysRaw, 10) || null
      : null;

    const bankName = (formData.get("bank_name") as string)?.trim() || null;
    const bankCode = (formData.get("bank_code") as string)?.trim() || null;
    const bankAccountNumber =
      (formData.get("bank_account_number") as string)?.trim() || null;

    // 1. Upsert Profiles table
    const { error: profErr } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      user_name: userName,
      avatar_url: finalAvatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (profErr) {
      setError(profErr.message);
      setSaving(false);
      return;
    }

    // 2. Upsert Creator table
    const { error: creatorErr } = await supabase.from("creators").upsert({
      id: user.id,
      full_name: fullName,
      user_name: userName,
      bio,
      phone,
      shipping_address: shippingAddress,
      content_language: contentLanguage,
      turnaround_days: turnaroundDays,
      bank_name: bankName,
      bank_code: bankCode,
      bank_account_number: bankAccountNumber,
      updated_at: new Date().toISOString(),
    });

    if (creatorErr) {
      setError(creatorErr.message);
      setSaving(false);
      return;
    }

    // Update local state
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            full_name: fullName,
            user_name: userName,
            avatar_url: finalAvatarUrl,
          }
        : null,
    );
    setCreator((prev) =>
      prev
        ? {
            ...prev,
            full_name: fullName,
            user_name: userName,
            bio,
            phone,
            shipping_address: shippingAddress,
            content_language: contentLanguage,
            turnaround_days: turnaroundDays,
            bank_name: bankName,
            bank_code: bankCode,
            bank_account_number: bankAccountNumber,
          }
        : null,
    );

    setSuccess("Creator settings updated successfully!");
    setSaving(false);

    setTimeout(() => {
      setSuccess(null);
    }, 4000);
  }

  if (loading) {
    return (
      <GlobalLoader message="Loading Creator Settings..." fullScreen={true} />
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/60 pb-28 md:pb-16 pt-4 sm:pt-8 px-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight">
              Creator Account Settings
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              Manage your public storefront profile, payout details, and account
              info
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600 font-medium border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Card 1: Storefront Profile */}
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-surface-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-surface-900">
                  Public Storefront Profile
                </h2>
                <p className="text-[11px] text-surface-500">
                  This information is displayed to brands visiting your UGC
                  storefront page
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="full_name"
                    className="text-xs font-bold text-surface-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    defaultValue={
                      profile?.full_name ?? creator?.full_name ?? ""
                    }
                    placeholder="e.g. Jane Doe"
                    required
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="user_name"
                    className="text-xs font-bold text-surface-700"
                  >
                    Storefront Handle (Username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-surface-400">
                      @
                    </span>
                    <input
                      id="user_name"
                      name="user_name"
                      type="text"
                      defaultValue={
                        profile?.user_name ?? creator?.user_name ?? ""
                      }
                      placeholder="janedoe"
                      required
                      className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-8 pr-3.5 text-xs font-semibold text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload & Edit */}
              <div className="space-y-2 pb-2">
                <label className="text-xs font-bold text-surface-700 block">
                  Profile Picture
                </label>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl border border-surface-200 bg-surface-50/60">
                  {/* Large Avatar Preview */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-brand-500 shadow-md">
                    {/* In-Frame Uploading Spinner & Overlay */}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 text-white backdrop-blur-xs transition-all animate-in fade-in">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider mt-1 text-surface-200">
                          Uploading
                        </span>
                      </div>
                    )}

                    {avatarUrl && !imageError ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile Picture"
                        fill
                        unoptimized
                        onError={() => setImageError(true)}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-600 text-white font-black text-xl">
                        {profile?.full_name
                          ? profile.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "C"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {/* File Upload Button */}
                      <label
                        className={`inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer min-h-11 ${
                          uploadingAvatar
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>
                          {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white hover:bg-red-50 text-red-600 px-3.5 py-2 text-xs font-bold transition-colors min-h-11"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <label className="text-[11px] font-semibold text-surface-500 block mb-1">
                        Or enter image URL:
                      </label>
                      <input
                        type="url"
                        name="avatar_url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="bio"
                  className="text-xs font-bold text-surface-700"
                >
                  Creator Bio / Intro
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  defaultValue={creator?.bio ?? ""}
                  placeholder="Tell brands about your video style, experience, and key content niches..."
                  className="w-full rounded-xl border border-surface-200 bg-white p-3.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="content_language"
                    className="text-xs font-bold text-surface-700 flex items-center gap-1"
                  >
                    <Globe className="h-3.5 w-3.5 text-surface-400" />
                    <span>Content Languages</span>
                  </label>
                  <input
                    id="content_language"
                    name="content_language"
                    type="text"
                    defaultValue={creator?.content_language ?? "English"}
                    placeholder="e.g. English, French"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="turnaround_days"
                    className="text-xs font-bold text-surface-700 flex items-center gap-1"
                  >
                    <Clock className="h-3.5 w-3.5 text-surface-400" />
                    <span>Turnaround Time (Days)</span>
                  </label>
                  <input
                    id="turnaround_days"
                    name="turnaround_days"
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={creator?.turnaround_days ?? 3}
                    placeholder="3"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="shipping_address"
                  className="text-xs font-bold text-surface-700 flex items-center gap-1"
                >
                  <MapPin className="h-3.5 w-3.5 text-surface-400" />
                  <span>
                    Physical Shipping Address (For Brand Product Deliveries)
                  </span>
                </label>
                <input
                  id="shipping_address"
                  name="shipping_address"
                  type="text"
                  defaultValue={creator?.shipping_address ?? ""}
                  placeholder="Full street address, City, State, Country"
                  className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Bank & Payout Details */}
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-surface-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-surface-900">
                  Bank Account & Payout Details
                </h2>
                <p className="text-[11px] text-surface-500">
                  Your bank details for direct automated campaign escrow payouts
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="bank_name"
                    className="text-xs font-bold text-surface-700 flex items-center gap-1"
                  >
                    <Building2 className="h-3.5 w-3.5 text-surface-400" />
                    <span>Bank Name</span>
                  </label>
                  <input
                    id="bank_name"
                    name="bank_name"
                    type="text"
                    defaultValue={creator?.bank_name ?? ""}
                    placeholder="e.g. GTBank, Access Bank, Kuda"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="bank_code"
                    className="text-xs font-bold text-surface-700"
                  >
                    Bank Code
                  </label>
                  <input
                    id="bank_code"
                    name="bank_code"
                    type="text"
                    defaultValue={creator?.bank_code ?? ""}
                    placeholder="e.g. 058"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="bank_account_number"
                    className="text-xs font-bold text-surface-700"
                  >
                    Account Number
                  </label>
                  <input
                    id="bank_account_number"
                    name="bank_account_number"
                    type="text"
                    defaultValue={creator?.bank_account_number ?? ""}
                    placeholder="e.g. 0123456789"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold text-surface-700 flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5 text-surface-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={creator?.phone ?? ""}
                    placeholder="e.g. +234 800 000 0000"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-500 transition-colors min-h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop & Mobile Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-xs font-bold shadow-md shadow-brand-100/50 transition-all disabled:opacity-50 min-h-11"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Settings..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
