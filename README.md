# Harbor Live Departures

Synthetic live dispatch dashboard, vanilla JavaScript + Node HTTP. Three NDJSON
records are written at 700 ms intervals; the finite stream ends after 2.1 seconds.
The browser incrementally displays the shipments and reports first-chunk/total time.
Separate small CSS and JS routes exercise actual browser asset loading.

Run `npm start`, then open http://localhost:3200 and click the button.
Expected: three destinations, final “3 Sendungen vollständig”, first chunk arriving
before the final response. `/health` identifies the release; missing routes return404.
All data is synthetic; no persistence, credentials, polling, or external calls.
