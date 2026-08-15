"use client";

import React, { useState } from "react";
import { SaveIcon } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { apiClient } from "@/lib/api-client";
import type { SessionUser } from "@/components/providers/SessionProvider";

interface SettingsMessage {
  type: "success" | "error";
  text: string;
}

export function SettingsForm() {
  const { user, updateUser } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState<SettingsMessage | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiClient.patchJson<SessionUser>("/api/v1/user/me", {
        name,
        bio,
        phone,
      });
      updateUser(result.data);
      setMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not save your settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-[17px] font-semibold text-slate-900">Account settings</h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Update your personal details. Your changes are visible on your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-[13px] font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className={fieldClass}
            placeholder="A short line about you"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[13px] font-medium text-slate-700">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
            placeholder="+880 1X-XXXX-XXXX"
          />
        </div>

        {user?.email && (
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={user.email}
              disabled
              readOnly
              className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-500`}
            />
          </div>
        )}

        {message && (
          <p
            role="alert"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
