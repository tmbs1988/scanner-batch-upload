# OPERATIONS — körning och drift (skelett)
\n
## Manuell körning (GUI)\n
1. Starta `uploader`‑appen.\n
2. Välj rotmapp (t.ex. `D:\\\\LSF350\\\\2025\\\\11\\\\10`) och `feetbase.csv`.\n
3. Kör “Torrkörning” för att se vilka filer som kommer laddas upp (endast whitelistan: report/pdf, models L/R, arch/foot3d/pronator).\n
4. Bekräfta och “Starta batch”. Följ progress.\n
5. Efter körning: exportera körningslogg (CSV), öppna länkar till transmissions i Admin vid behov.\n
\n
## Automatiskt läge (senare)\n
- Körs via schemaläggare (t.ex. Windows Task Scheduler) 1 gång/dygn.\n
- Samma logik som manuellt läge, men utan UI. Skapar rapportfil och avslutar.\n
- Konfiguration (förslag, att definieras vid implementation):\n
  - `--root` (rotmapp)\n
  - `--date` (t.ex. `yesterday` eller `2025-11-10`)\n
  - `--store` (scanner‑serial / store_name)\n
  - `--dedupe=hash|size|name` (standard: size)\n
  - `--force-csv` (överskriv CSV‑injektion även om redan importerad)\n
  - `--concurrency=N` (antals parallella patienter)\n
  - `--report=file.csv`\n
\n
## Support/återkörning\n
- Vid nätverksfel: kör “Refresh files” i Admin eller kör automatläget igen mot samma datum.\n
- Vid felaktiga filer: använd manuellt läge, välj om endast saknade filer ska laddas upp.\n

