# soundscape-games-website
A website to host audio games.

## Run locally

Do not open `index.html` directly with a `file://` URL. Browsers block `fetch()` for local JSON files in that mode.

Start a local server from this folder, then open the localhost URL:

```powershell
python -m http.server 5500
```

Then visit:

```text
http://localhost:5500
```

## games.json format

Each game entry supports:

- `name` (string, required)
- `description` (string, required)
- `version` (string, required)
- `windowsDownloadUrl` (string, required, Windows download)
- `macDownloadUrl` (string, optional, Mac download)

If `macDownloadUrl` is omitted, only the Windows download button is shown.
