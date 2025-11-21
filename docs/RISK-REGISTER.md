# Risk Register

- R-007: Upload failar p.g.a. intermittenta nätverksfel; data försvinner.
  - **Mitigation (0.1.18)**: Retry 3 gånger per fil (exp. backoff); verifiera efter FINALIZE; spara misslyckade i retry-kö för nästa körning.

- R-006: Flera app-instanser startar vid schemalagd körning (Task Scheduler).
  - **Mitigation (0.1.15)**: Bytt till intern scheduler; endast en instans körs i tray, timer triggar batch inifrån appen.

- R-001: OTA uppdateringar körs inte (fel artefakt/ingen tagg).
  - Mitigation: Bygg endast NSIS installer; ta bort `portable` i lokala byggscript; GitHub Actions release på tagg med `permissions: contents: write` och `fetch-depth: 0`; test i staging.

- R-005: Installer uppgraderas inte p.g.a. felaktig feed i app-update.yml.
  - Mitigation: `publish: github` i `electron-builder.yml`; installera senaste Setup så `app-update.yml` pekar på rätt repo/owner.

- R-004: Desktop/startmeny‑genväg skapas inte efter installation.
  - Mitigation: Sätt `nsis.createDesktopShortcut: always`, `createStartMenuShortcut: true`, `shortcutName` och verifiera i manuell QA.

- R-002: Auto-läge misslyckas utan `store_name`.
  - Mitigation: Läs `store_name` från `feetbase.csv` automatiskt om fältet är tomt; logga tydliga fel.

- R-003: Olikt tema (ljust/mörkt) skapar förvirring.
  - Mitigation: Tvinga mörkt läge som standard; synlig version i window title.

- R-006: Schema körs inte om datorn är avstängd/sömn eller ingen inloggad.
  - Mitigation: Skapa även ett ONLOGON‑jobb; använd interaktivt läge `/IT` och `/RL HIGHEST`; exponera “Kör schema nu” för manuell test.



