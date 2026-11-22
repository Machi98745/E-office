# Hybrid Server API and Browser State Persistence

To support both full-stack demonstration (`next dev` with a real Next.js REST API `/api/eoffice` persisting to `data/eoffice-db.json` on disk) and zero-setup offline classroom presentation (`mockup-preview.html`), the E-Office state store uses a hybrid persistence model: when running on the Next.js server, all workflow transitions synchronize with `/api/eoffice` and write to `data/eoffice-db.json`, while falling back transparently to `localStorage` when running offline or via the standalone HTML bundle.
