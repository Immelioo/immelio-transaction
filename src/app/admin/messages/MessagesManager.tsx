"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { authFetch } from "@/lib/authFetch";

interface Partenaire {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string | null;
}

interface MessageItem {
  id: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
  expediteurId: string;
  destinataireId: string;
  expediteur: { id: string; nom: string; prenom: string; role: string };
}

interface Conversation {
  partenaire: Partenaire;
  lastMessage: { contenu: string; createdAt: string | Date } | null;
  unreadCount: number;
}

export default function MessagesManager({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState<Partenaire | null>(null);
  const [thread, setThread] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async (partenaireId: string) => {
    setLoadingThread(true);
    try {
      const res = await authFetch(`/api/messages?partenaireId=${partenaireId}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data);
      }
      await authFetch("/api/messages", { method: "PATCH", body: JSON.stringify({ partenaireId }) });
      setConversations((prev) =>
        prev.map((c) => (c.partenaire.id === partenaireId ? { ...c, unreadCount: 0 } : c))
      );
    } finally {
      setLoadingThread(false);
    }
  }, []);

  function selectConversation(p: Partenaire) {
    setSelected(p);
    setThread([]);
    loadThread(p.id);
  }

  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => loadThread(selected.id), 10000);
    return () => clearInterval(interval);
  }, [selected, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await authFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ destinataireId: selected.id, contenu: draft.trim() }),
      });
      if (res.ok) {
        const msg: MessageItem = await res.json();
        setThread((prev) => [...prev, msg]);
        setDraft("");
        setConversations((prev) =>
          [...prev.map((c) => (c.partenaire.id === selected.id ? { ...c, lastMessage: msg } : c))].sort(
            (a, b) => {
              const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
              const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
              return tb - ta;
            }
          )
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 220px)", minHeight: 480 }}
    >
      <div className="flex h-full">
        {/* Liste des conversations */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex-col shrink-0 ${selected ? "hidden md:flex" : "flex"}`}>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">Aucun partenaire enregistré.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.partenaire.id}
                  onClick={() => selectConversation(c.partenaire)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    selected?.id === c.partenaire.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 text-sm">
                    {c.partenaire.prenom[0]}
                    {c.partenaire.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {c.partenaire.prenom} {c.partenaire.nom}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="shrink-0 bg-accent text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{c.partenaire.entreprise || "—"}</p>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        c.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                      }`}
                    >
                      {c.lastMessage ? c.lastMessage.contenu : "Aucun message"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Fil de conversation */}
        <div className={`flex-1 flex-col min-w-0 ${selected ? "flex" : "hidden md:flex"}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sélectionnez un partenaire pour afficher la conversation
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 p-4 flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden text-gray-500" aria-label="Retour">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {selected.prenom} {selected.nom}
                  </p>
                  <p className="text-xs text-gray-400">{selected.entreprise || "—"}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingThread && thread.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">Chargement...</p>
                ) : thread.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">Aucun message pour le moment.</p>
                ) : (
                  thread.map((m) => {
                    const isMine = m.expediteur.role === "ADMIN";
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}
                        >
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
                  placeholder="Écrire un message..."
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
