# Risk Register

- R-001: OTA uppdateringar körs inte (fel artefakt/ingen tagg).
  - Mitigation: Bygg endast NSIS installer; ta bort `portable`; GitHub Actions release på tagg; test i staging.

- R-002: Auto-läge misslyckas utan `store_name`.
  - Mitigation: Läs `store_name` från `feetbase.csv` automatiskt om fältet är tomt; logga tydliga fel.

- R-003: Olikt tema (ljust/mörkt) skapar förvirring.
  - Mitigation: Tvinga mörkt läge som standard; synlig version i window title.


