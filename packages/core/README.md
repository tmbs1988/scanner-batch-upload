# packages/core — skelett
\n
Delad logik för batch‑uppladdaren:\n
\n
- CSV‑parser för `feetbase.csv` (återanvänder samma heuristik som backendens `import-csv-data`)\n
- Mappskanning för dagsmappar (D:\\LSF350\\YYYY\\MM\\DD\\...)\n
- Whitelist + kanonisering av filer (endast report/model L/R/arch/foot3d/pronator)\n
- Deduplicering (namn/size/valfri hash), idempotens mot `transmission.files[]`\n
- Batch‑orkestrering (sekventiell körning per patient), logg/rapportgenerator\n
\n
> Implementeras i TypeScript när vi påbörjar genomförandet.\n

