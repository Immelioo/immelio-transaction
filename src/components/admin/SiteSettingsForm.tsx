"use client";

import { useMemo, useState } from "react";
import { authFetch } from "@/lib/authFetch";

interface SiteSettingItem {
  key: string;
  label: string;
  group: string;
  inputType: "text" | "textarea" | "number" | "email" | "tel";
  value: string;
  description?: string;
}

interface Props {
  initialSettings: SiteSettingItem[];
}

export default function SiteSettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettingItem[]>(initialSettings);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const groupedSettings = useMemo(() => {
    return settings.reduce<Record<string, SiteSettingItem[]>>((accumulator, setting) => {
      if (!accumulator[setting.group]) accumulator[setting.group] = [];
      accumulator[setting.group].push(setting);
      return accumulator;
    }, {});
  }, [settings]);

  function updateValue(key: string, value: string) {
    setSettings((current) =>
      current.map((setting) => (setting.key === key ? { ...setting, value } : setting)),
    );
  }

  async function handleSave() {
    setStatus("saving");
    setMessage("");

    try {
      const res = await authFetch("/api/site-settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: settings.map(({ key, value }) => ({ key, value })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Impossible d'enregistrer les modifications");
      }

      setSettings(data.settings);
      setStatus("success");
      setMessage("Le contenu du site a ete mis a jour avec succes.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise a jour du site.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contenu du site</h1>
            <p className="text-gray-500 mt-1">
              Modifiez les informations publiques, la promesse de marque et les textes cles sans toucher au code.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "saving" ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>

        {message ? (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        ) : null}
      </div>

      {Object.entries(groupedSettings).map(([group, items]) => (
        <section key={group} className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">{group}</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {items.map((setting) => (
              <div key={setting.key} className={setting.inputType === "textarea" ? "xl:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {setting.label}
                </label>

                {setting.inputType === "textarea" ? (
                  <textarea
                    rows={4}
                    value={setting.value}
                    onChange={(event) => updateValue(setting.key, event.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />
                ) : (
                  <input
                    type={setting.inputType}
                    value={setting.value}
                    onChange={(event) => updateValue(setting.key, event.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                )}

                {setting.description ? (
                  <p className="mt-1.5 text-xs text-gray-500">{setting.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
