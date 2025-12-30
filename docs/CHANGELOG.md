## 0.1.40 (2025-12-30)
- Deterministisk CSV‑matchning per skanning: i stället för sekventiell parning väljs nu två rader (L/R) från `feetbase.csv` per undermapp baserat på:
  - exakt `phone` (om tillgängligt),
  - normaliserat `user_name`, samt
  - närmast `ScanTime` inom ±24h.
- Bygger `scanData.json` från just dessa matchade rader och laddar upp den till transmissionen innan finalize.
- Samma två rader skickas till backend (`upload-manual-file` med `csvText`) för att fylla `feetdata`.
- Tydligare loggar i UI: visar vilka CSV‑rader (ScanTime) som valdes för L/R.
- Gäller både manuell “Start” och auto‑körning.

## 0.1.36 (2025-12-29)
- Finalize no longer expects/prints jobId; logs “Finaliserad transmission …”.
- Always calls `/api/process-transmission` directly after finalize (no cron fallback).
- Keeps original filenames on upload (OEX/PDF/BMP) to mirror 3DOE.
- Improved error logging around uploads and verification.

## 0.1.38 (2025-12-29)
- CSV auto-import: när preflight saknar `feetLeft/feetRight` skickar klienten 1–2 rader från feetbase till samma `transmissionId` via `upload-manual-file` (`csvText`) innan filuppladdningar.
- Behåller 0.1.37-beteendet: BMP (arch/foot3d/pronator) laddas alltid upp; rätt Content-Type för bilder; direktanrop till `/api/process-transmission` efter finalize.
- Förberedelse för full paritet med “Ladda upp CSV”-flödet (admin-endpoint uppdaterar även scan.metadata). 

## 0.1.39 (2025-12-29)
- Genererar 3DOE‑kompatibel `scanData.json` från feetbase.csv när feetdata saknas, och laddar upp den till `scanner_data/{scannerId}/{transmissionId}/scanData.json`.
- Backend kopierar nu `scanData.json` till `patients/{patientId}/scans/{scanId}/metadata/scan_metadata.json` och sätter `resources.scanData`.
- Om `transmission.feetdata` finns används den för `scan.metadata.feetdata`; annars kan backend backfilla från JSON.

## 0.1.37 (2025-12-29)
- Always upload BMP analysis files (arch/foot3d/pronator) if present locally, regardless of preflight “missing”.
- Set correct Content-Type for images based on extension (bmp/png/jpg).
- Ensures backend can refresh analysis pipeline reliably on finalize + process-transmission.

## 0.1.35 - 2025-12-29

- Remove client cron-fallback: efter FINALIZE kallar klienten direkt `POST /api/process-transmission` (ingen `GET /api/cron/process-pending-transmissions`).
- Följer 3DOE-flödet: låter backend kopiera OEX/PDF/BMP till patientens scan-mapp och trigga konverteringen.
- Ingen INIT av ny transmission – använder alltid befintlig `transmissionId`.

## 0.1.34 - 2025-12-28

- Enkel väg: använder alltid befintlig `transmissionId` (ingen INIT/create).
- Uppladdning: Signed PUT till GCS, finalize + cron‑fallback och verifierings‑retry kvar.
- CSV: hanteras via separat UI‑funktion (oförändrat).
- Fixar: UI-flödet hoppar över om ingen transmission hittas, inga nya tomma transmissions skapas.

## 0.1.10 - 2025-11-21

- Schema: Daglig körning skapas nu med interaktivt läge och högsta behörighet.
- Fallback: Extra “vid inloggning”-jobb skapas så batchen körs även om datorn sov.
- UI: Knapp “Kör schema nu” för snabb manuell test från appen.
- Updater: Synlig logg i UI för “checking/available/downloaded/error”.

## 0.1.11 - 2025-11-21

- Rebuild: inkluderar updater‑loggning och schemafixar i den offentliga releasen.

## 0.1.26 - 2025-11-21

- Fix: Scheduler loggar nu status vid start (config loaded, enabled/disabled) till UI-loggen.

## 0.1.27 - 2025-12-28

- Preflight: honor `missingDetailed` från backend och följ strikt närvaro (räkna bara `files[].url` på servern).
- Per-sida uppladdning: ladda endast `modelL/R`, `archL/R`, `foot3dL/R` och `report` som saknas enligt preflight.
- CSV: skicka endast om `feetLeft/feetRight` saknas.
- Krav: backend version med nya preflight‑fält (`missingDetailed`, `completeMinimal`, `completeStrict`, `inconsistent`).

## 0.1.30 - 2025-12-28

- Per‑fil continue: om en fil fallerar läggs den i retry‑kön och resten av filerna fortsätter laddas upp.
- Förbättrad feltext i logg: statuskod + servertext (visar t.ex. 403/415/validering).
- Cron‑fallback från klient: efter FINALIZE triggas även `GET /api/cron/process-pending-transmissions` för säkerhets skull.
- Kräver backendens preflight‑ändringar (strict `files[].url`, `missingDetailed`).

## 0.1.31 - 2025-12-28

- Alla filer laddas upp via GCS signed PUT (inga stora request bodies till Vercel).
- Auto‑finalize: Cloud Function på GCS “finalize” uppdaterar Firestore (`files[]`, `*_url`) automatiskt.
- Oförändrat 3DOE/edoe‑flöde (gäller endast batch‑uploadern).
- Fortsatt per‑fil continue och förbättrad feltext från 0.1.30.

## 0.1.25 - 2025-11-21

- Fix: NSIS graceful + force close, och sätter .just-updated flagga direkt i installern för tray-start.

## 0.1.24 - 2025-11-21

- Fix: NSIS installer stänger nu automatiskt körande app-instanser med taskkill före installation.

## 0.1.23 - 2025-11-21

- Fix: Återgå till fungerande auto-update mekanism från v0.1.18 (quitAndInstall direkt) + behåll .just-updated flagga för tray-start.

## 0.1.22 - 2025-11-21

- UX: Uppdateringar laddas ner automatiskt men installeras först när användaren stänger appen (löser file-lock problem).
- Ny tray-menyoption: "⚠️ Uppdatering väntar - starta om" när en uppdatering är nedladdad.

## 0.1.21 - 2025-11-21

- Fix: Stäng app och tray helt innan auto-update installation (löser "Failed to uninstall" fel).

## 0.1.20 - 2025-11-21

- UX: Fix för tray-minimering efter auto-uppdatering (använder userData-flagga istället för args).

## 0.1.19 - 2025-11-21

- UX: Efter auto-uppdatering startar appen minimerad till tray (stör inte användaren).

## 0.1.18 - 2025-11-21

- **Retry-logik**: Fil-upload försöker 3 gånger med exponentiell backoff (5s, 15s) vid fel.
- **Verifiering**: Efter FINALIZE körs en preflight-check för att bekräfta att transmission är komplett.
- **Retry-kö**: Misslyckade/ofullständiga uploads sparas lokalt och körs om vid nästa auto-körning.
- **Robust**: Säkerställer att alla patienter laddas upp korrekt, även vid intermittenta nätverksfel.

## 0.1.17 - 2025-11-21

- OTA: Kolla efter uppdateringar var 30:e minut (tidigare bara vid app-start).

## 0.1.16 - 2025-11-21

- UX: Rotmapp prefylls med D:\LSF350 (användaren ändrar bara om annan path behövs).

## 0.1.15 - 2025-11-21

- **Intern scheduler**: Appen har nu egen inbyggd timer istället för Windows Task Scheduler.
  - Endast en app-instans körs (i tray).
  - Schemat triggas inifrån appen vid vald tid.
  - Inställningar sparas lokalt och laddas vid start.
- **Autostart**: Appen startar automatiskt vid Windows-start (minimerad till tray).
- **UI**: "Aktivera/Inaktivera automatisk körning"-knapp ersätter Task Scheduler-knappar.

## 0.1.14 - 2025-11-21

- Loggar använder nu lokal systemtid istället för UTC för tydligare tidsvisning.

## 0.1.13 - 2025-11-21

- OTA: Verifierar att `latest.yml` publiceras korrekt för Generic‑provider.

## 0.1.12 - 2025-11-21

- OTA: Växla klientens provider till Generic (hämtar `latest.yml` från Releases/Latest/Download).
- CI: Fortsätter publicera artefakter till GitHub Releases.

## 0.1.9 - 2025-11-21

- OTA: Testrelease för automatisk uppdatering från 0.1.8 (inga funktionsändringar).
- Installer: fortsätter endast med NSIS (ingen portable).

## 0.1.8 - 2025-11-20

- CI: Åtgärdade GitHub Release-rättigheter (`permissions: contents: write`, `fetch-depth: 0`).
- Release: Publicerar via tagg `v*`; elektron‑builder `publish: github` aktiv.
- Installer: Säkerställd NSIS‑genvägar (desktop/startmeny), artefaktnamn oförändrat.
- OTA: Verifieringsrelease för att säkerställa uppdatering från 0.1.7.
  - Lokal bygg: Tog bort `portable` från `npm run build:win` för att undvika att man råkar köra en icke‑installerande exe.

## 0.1.2 - 2025-11-20

- Force dark theme regardless of OS setting for consistent UI.
- Auto-mode: auto-detect `store_name` from `feetbase.csv` for tray “Synka nu (1 gång)” and `--auto` runs.
- OTA: enable silent auto-install on Windows (quitAndInstall when downloaded).
- Packaging: build NSIS installer only (no portable), add `runAfterFinish`, create desktop/start menu shortcuts.
- Artifact name: `${productName} Setup ${version}.exe` for clarity.

## 0.1.1 - 2025-11-20

- Initial OTA integration, tray menu, window state, base UI improvements.



