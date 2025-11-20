# apps/uploader (GUI) — skelett

Electron‑baserat GUI‑verktyg för batch‑uppladdning av skannerfiler och CSV till backend.\n
\n
Status: Endast mappstruktur (ingen körbar kod ännu).\n
\n
## Mappar\n
\n
- `src/main/` – Electron main process (app‑bootstrap, single instance, IPC‑endpoints)\n
- `src/renderer/` – UI‑lager (React/Vite eller enkel HTML/TS) [väljs vid implementation]\n
- `src/shared/` – Gemensam logik mellan main/renderer (t.ex. mappskanning, kanonisering, dedup)\n
- `src/assets/` – Ikoner, logotyper, ev. översättningsfiler\n
- `scripts/` – start/build/release‑skript (fylls i vid implementering)\n
\n
## Planerade funktioner\n
1. Manuellt läge\n
   - Välj dagsmapp + `feetbase.csv`\n
   - “Torrkörning”: visa planerade uppladdningar och detekterade dubletter/konflikter\n
   - Starta batch, visa progress, exportera resultatlogg\n
2. Automatiskt läge (senare)\n
   - Körs via CLI‑flaggor (t.ex. `--auto --date=yesterday --root=D:\\LSF350 --store=SN12345`)\n
   - Headless, skriver sammanfattningsrapport\n
\n
## Backend‑integration (återanvänds)\n
- `POST /api/scanners/register-manual-files`\n
- `POST /api/scanners/import-csv-data`\n
- `GET  /api/cron/process-pending-transmissions` (endast dev/test)\n
- (Valfritt) `POST /api/scanners/ensure-transmission` om transmission saknas\n
\n
## Nästa steg\n
- Skapa `package.json` och installera Electron + bundler (Vite/webpack)\n
- Implementera `core`‑moduler för CSV/mappskanning och dedup\n
- Bygg minimal UI för att testa torrkörning\n

