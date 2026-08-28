import { useState } from "react";
import { ArrowUpRight, Bot, Send, X } from "lucide-react";
import { askCustomerAssistant, type AssistantResponse } from "@/lib/api";

type Message = { role: "customer" | "assistant"; text: string; answer?: AssistantResponse["answer"] };

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setMessage(""); setError(""); setMessages((current) => [...current, { role: "customer", text }]); setBusy(true);
    try {
      const result = await askCustomerAssistant(text);
      setMessages((current) => [...current, { role: "assistant", text: result.answer.directAnswer, answer: result.answer }]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The assistant is taking a pause. Please try again."); }
    finally { setBusy(false); }
  };
  return <aside className={`assistant-widget ${open ? "assistant-widget--open" : ""}`} aria-label="Rinovabd customer support assistant">
    {open && <section className="assistant-panel"><header><div><span className="eyebrow">Rinova / support desk</span><h2>Ask the <em>edit.</em></h2></div><button aria-label="Close assistant" onClick={() => setOpen(false)}><X size={18} /></button></header><div className="assistant-intro">Product ideas, routines, delivery, returns — grounded in Rinovabd’s live catalogue and approved support notes.</div><div className="assistant-messages" aria-live="polite">{!messages.length && <p className="assistant-empty">Try “Which product suits a simple daily routine?”</p>}{messages.map((item, index) => <div className={`assistant-message assistant-message--${item.role}`} key={`${item.role}-${index}`}><span>{item.role === "assistant" ? "Rinova assistant" : "You"}</span><p>{item.text}</p>{item.answer && <div className="assistant-answer"><strong>Why</strong><p>{item.answer.why}</p><strong>Next step</strong><p>{item.answer.nextStep}</p>{item.answer.products.length > 0 && <div className="assistant-products">{item.answer.products.map((product) => <a href={`/shop?product=${encodeURIComponent(product.id)}`} key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>৳{product.price.toLocaleString()}</small></span><ArrowUpRight size={14} /></a>)}</div>}</div>}</div>)}</div>{error && <p className="assistant-error">{error}</p>}<form onSubmit={send}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a question" aria-label="Ask Rinovabd assistant" maxLength={1200} /><button disabled={busy || !message.trim()} aria-label="Send message"><Send size={17} /></button></form><small className="assistant-disclaimer">Answers use approved Rinovabd facts. For account or order help, sign in.</small></section>}
    <button className="assistant-launcher" onClick={() => setOpen((value) => !value)} aria-expanded={open}><Bot size={18} /><span>{open ? "Close desk" : "Ask Rinova"}</span></button>
  </aside>;
}
