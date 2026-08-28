# Rinovabd v2 AI assistant architecture

Rinovabd v2 will expose two fixed channels: a public customer assistant and a Studio-only staff assistant. The route determines the channel; a request body cannot upgrade its audience. The Worker authenticates first, detects bounded intent and language, retrieves approved D1 facts plus relevant published knowledge from the dedicated `rinovabd-v2-assistant-knowledge` Vectorize index, filters by audience/locale/publication/product, builds a small grounded context, calls Workers AI, validates and redacts the draft, attaches Worker-verified cards or proposed actions, and stores only a safe conversation event.

| Boundary | Customer assistant | Staff assistant |
| --- | --- | --- |
| Route | `/api/assistant/customer` | `/api/admin/assistant` |
| Authorization | Anonymous or existing customer session; order facts require that customer’s own session | Existing Studio session only |
| Facts | Published products, categories, delivery/returns policy, and own order summary when explicitly allowed | Catalogue, inventory, order queue, and approved operational knowledge |
| Vectorize filter | `audience=customer`, `published=1`, requested locale | `audience=staff`, `published=1`, requested locale |
| Output | Direct answer (1–2 sentences), Why, Next step, separate verified product cards | Answer, evidence, and an approval-required action proposal |
| Mutations | None | None from chat; existing Studio forms require human confirmation |
| Persistence | Hash of conversation ID, channel, intent, locale, safe event metadata | Same, plus admin role and action status; never raw private payloads |

The customer response contract is `{ directAnswer, why, nextStep, products, sources }`. Products are resolved from D1 by allow-listed IDs after model generation; the model cannot invent names, prices, URLs, inventory, order states, or actions. The staff response contract additionally includes `actionProposal` with an allow-listed action name and `requiresApproval: true`.

Language detection is bounded to `en`, `bn`, and `bn-Latn` using deterministic character/script heuristics, with an explicit request locale accepted only from that allow-list. Intent classification is similarly bounded to product discovery, routine, delivery, returns, order status, and human support for customers; staff adds catalogue, inventory, orders, and reporting. Unknown intent falls back to support.

No response or event may contain passwords, bearer tokens, sessions, service-account JSON, private keys, payment details, delivery addresses, or unrelated customer identity. Knowledge content is untrusted data: prompt-injection-shaped text is never treated as an instruction. The answer validator rejects empty output, unsupported private claims, unsafe medical guarantees, and any forbidden secret pattern. If Workers AI or Vectorize is unavailable, the Worker returns a safe setup/degraded response rather than fabricating an answer.

Cloudflare binding plan: add a new Workers AI binding named `AI` and a new Vectorize binding named `ASSISTANT_KNOWLEDGE` pointing only to `rinovabd-v2-assistant-knowledge`. The existing v2 D1 and KV remain the structured-fact and session stores; no legacy resource is used.

## References

[1]: https://developers.cloudflare.com/workers-ai/configuration/bindings/ "Cloudflare Workers AI bindings"
[2]: https://developers.cloudflare.com/vectorize/reference/client-api/ "Cloudflare Vectorize client API"
[3]: https://developers.cloudflare.com/workers-ai/guides/tutorials/build-retrieval-augmented-generation-ai/ "Cloudflare Workers AI RAG tutorial"

The binding and Vectorize query patterns follow Cloudflare’s published documentation.[1] [2] The RAG tutorial is implementation guidance only; audience authorization, field allow-lists, and output validation remain Worker responsibilities.[3]
