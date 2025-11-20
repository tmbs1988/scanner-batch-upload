# MDR RUNBOOK — Batchåterställning av skannerfiler (skelett)

## Syfte
Standardiserad process för att manuellt/automatiskt återladda saknade skannerfiler och CSV så att patientdata bearbetas i ordinarie pipeline. Säkerställa spårbarhet, idempotens och minimerad duplicering.

## Omfattning
- Återladda `.pdf` (report), modellfiler (`.oex/.stl/.obj`), samt bildlistor (`arch[]`, `foot3d[]`, `pronator[]`).
- Injektera exakt de 1–2 CSV‑rader (R/L) som hör till respektive patient.
- Skapa `scannerTransmissions` vid behov (via `ensure-transmission`) och trigga `processingJobs`/cron.

## Risker och kontroller (utdrag)
- Dubbletter i Storage:
  - Kontroll av befintliga filer via path `scanner_data/{scannerId}/{transmissionId}/{filnamn}`.
  - Valbar storleks-/hash‑jämförelse.
- Felmappning av patient/transmission:
  - Härled `scannerId` server-side via `store_name` (serial).
  - `transmissionKey = store_name + user_name + scanTime + phone` används för att återfinna/Skapa transmission.
- Delvis saknade filer:
  - Kategori‑vis jämförelse (report, model_L, model_R, arch/foot3d/pronator).
  - Endast saknade filer laddas upp; redan uppladdade hoppar vi över.
- CSV återinjektion:
  - Default: Skippa om `processingMetadata.manualCsvImported === true`.
  - Valbar “force” i manuellt läge, med auditlogg.

## Dokumentation
- `docs/ARCHITECTURE.md` – integrationsflöde och komponenter.
- `docs/OPERATIONS.md` – manual/auto körning, konfig, felsökning.
- Release‑notiser i respektive repo (uploader) efter verifiering.

## Roller & åtkomst
- Batchapp: ingen klient‑auth. Servern validerar `store_name` → `scannerId`; kan förstärkas med pre‑shared key.
- Adminportal: visar `transmissions`, `files[]`, `processingStatus`, historik och audit.


