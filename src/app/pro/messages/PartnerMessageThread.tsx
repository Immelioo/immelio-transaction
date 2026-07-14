"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { authFetch } from "@/lib/authFetch";

interface MessageItem {
  id: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
  expediteurId: string;
  destinataireId: string;
  expediteur: { id: string; nom: string; prenom: string; role: string };
}

export default function PartnerMessageThread({ initialMessages }: { initialMessages: MessageItem[] }) {
  const [thread, setThread] = useState<MessageItem[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const res = await authFetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      setThread(data);
    }
  }, []);

  useEffect(() => {
    authFetch("/api/messages", { method: "PATCH" });
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await authFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ contenu: draft.trim() }),
      });
      if (res.ok) {
        const msg: MessageItem = await res.json();
        setThread((prev) => [...prev, msg]);
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 flex flex-col flex-1"
      style={{ minHeight: 480 }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {thread.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Aucun message pour le moment. Envoyez votre premier message à l&apos;agence.
          </p>
        ) : (
          thread.map((m) => {
            const isMine = m.expediteur.role === "PARTENAIRE";
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {!isMine && (
                    <p className="text-[11px] font-semibold text-accent mb-0.5">Immelio Transaction</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.contenu}</p>
                  <p className={`text-[11px] mt-1 ${isMine ? "text-white/70" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
