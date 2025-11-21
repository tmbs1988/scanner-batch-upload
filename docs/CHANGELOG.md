## 0.1.10 - 2025-11-21

- Schema: Daglig körning skapas nu med interaktivt läge och högsta behörighet.
- Fallback: Extra “vid inloggning”-jobb skapas så batchen körs även om datorn sov.
- UI: Knapp “Kör schema nu” för snabb manuell test från appen.
- Updater: Synlig logg i UI för “checking/available/downloaded/error”.

## 0.1.11 - 2025-11-21

- Rebuild: inkluderar updater‑loggning och schemafixar i den offentliga releasen.

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



