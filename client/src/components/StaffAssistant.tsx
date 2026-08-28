import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { askStaffAssistant, type AssistantResponse } from "@/lib/api";

export function StaffAssistant({ session }: { session: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState("");
  const send = async (event: React.FormEvent) => {
    event.preventDefault(); const text = message.trim(); if (!text || busy) return;
    setBusy(true); setError(""); setResult(null);
    try { setResult(await askStaffAssistant(session, text)); setMessage(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Studio assistant is unavailable."); }
    finally { setBusy(false); }
  };
  return <section className="staff-assistant"><div className="staff-assistant-heading"><div><span className="eyebrow">Cloudflare AI / private</span><h2>Studio <em>copilot.</em></h2></div><Bot size={24} /></div><p className="staff-assistant-copy">Ask about the live catalogue, stock position, order queue, or approved operating notes. Chat can propose; a person still confirms every change.</p><form onSubmit={send}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask the Studio assistant" aria-label="Ask Studio assistant" maxLength={1200} /><button disabled={busy || !message.trim()} aria-label="Send to Studio assistant"><Send size={17} /></button></form>{busy && <p className="staff-assistant-status">Retrieving approved facts…</p>}{error && <p className="staff-assistant-error">{error}</p>}{result && <div className="staff-assistant-result"><span className="eyebrow">{result.intent} / {result.retrieval.mode}</span><h3>{result.answer.directAnswer}</h3><strong>Evidence</strong><p>{result.answer.why}</p><strong>Next step</strong><p>{result.answer.nextStep}</p><div className="staff-assistant-approval">{result.answer.actionProposal?.requiresApproval ? "Any operational change requires explicit Studio confirmation." : "Read-only assistant response."}</div></div>}</section>;
}
