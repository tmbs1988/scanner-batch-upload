# Arkitektur (översikt) — scanner-batch-uploader
\n
## Mål\n
Batch‑uppladdning av skannerdata (mappar + CSV) till befintlig backend, med samma bearbetningsflöde som 3DOE‑skannern:\n
\n
```\n
Lokala filer + feetbase.csv\n   ↓ (whitelist + kanonisering + dedup)\n/uploader → POST /api/scanners/ensure-transmission (om behövs)\n         → POST /api/scanners/register-manual-files\n         → POST /api/scanners/import-csv-data\n         → (prod) cron /api/cron/process-pending-transmissions\n         → process-transmission (patientmatchning + resursimport)\n```\n
\n
## Komponenter\n
- `packages/core`: domänlogik (CSV‑parser, mappskanning, whitelist/kanonisering, dedup, rapport)\n
- `apps/uploader`:\n
  - `main`: Electron main process (fönster, IPC, auto‑update (senare))\n
  - `renderer`: GUI (React/Vite eller enkel HTML/TS)\n
  - `shared`: gemensamma hjälpfunktioner mellan renderer och main\n\n
## Nytt API (vid behov)\n
- `POST /api/scanners/ensure-transmission`\n
  - Input: `{ store_name, user_name, phone, scanTime }`\n
  - Härleder `scannerId` via `store_name` (serial → `scanners.serialNumber`)\n
  - Skapar `scannerTransmissions` + `processingJobs` (som i `3doe.ts`) när ingen match hittas\n\n
## Deduplicering & idempotens\n
- Jämför planerade kanoniska filnamn och storlek mot `scanner_data/{scannerId}/{transmissionId}/...`\n
- För models L/R: hoppa över om motsvarande sida redan finns (även om filnamn skiljer)\n
- CSV injiceras bara om `processingMetadata.manualCsvImported !== true` (annars kan användaren välja “force”)\n\n
## Säkerhet\n
- Klient saknar Firebase Auth; servern kör Admin SDK\n
- `store_name` (scanner‑serial) används för mappning → `scannerId`\n
- Valbar pre‑shared key i request‑header för batchverktyg\n\n

