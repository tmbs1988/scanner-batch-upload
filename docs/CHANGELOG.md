## 0.1.10 - 2025-11-21

- Schema: Daglig körning skapas nu med interaktivt läge och högsta behörighet.
- Fallback: Extra “vid inloggning”-jobb skapas så batchen körs även om datorn sov.
- UI: Knapp “Kör schema nu” för snabb manuell test från appen.
- Updater: Synlig logg i UI för “checking/available/downloaded/error”.

## 0.1.11 - 2025-11-21

- Rebuild: inkluderar updater‑loggning och schemafixar i den offentliga releasen.

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



