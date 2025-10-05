# Planet Next Theme

This theme renders planet data with Next.js and shadcn/ui.  
It relies on the core planet CLI to fetch feeds and emit `data.json`, then uses Next.js static export to build the site.

## Prerequisites

- `planet` CLI available (this repository).
- `npm` to run scripts.
- `config.yml` with:

```yaml
planet:
  theme: next
  format: json
  output: public   # or any folder
```

## Workflow

> **Important:** The directory that contains your `config.yml` does **not** need a `package.json`. After running `planet`, copy or symlink this `next` theme folder beside your `config.yml` (e.g. `./next/`). All npm commands are executed inside that theme folder.

1. **Fetch data from feeds**

   ```bash
   planet ./config.yml
   ```

   This writes `data.json`, `atom.xml`, and `rss.xml` into the directory configured by `planet.output`.

2. **Build and export the Next.js site**

   ```bash
   # from the directory that contains config.yml
   npm --prefix ./themes/next install          # first time only
   npm --prefix ./themes/next run export -- --config ./config.yml
   ```

   or, if you prefer to `cd`:

   ```bash
   cd themes/next
   npm install                                 # first time only
   npm run export -- --config ../config.yml
   ```

   The `export` script:

   - Resolves the output directory from `config.yml`.
   - Requires `<planet.output>/data.json` (generated in step 1).
   - Runs the full static export (`next build` + `next export`).
   - Copies the exported site into `<planet.output>/`, alongside the feeds produced earlier.
   - Leaves any existing files in `<planet.output>/` untouched.

3. Serve or deploy the contents of `<planet.output>/`.

## Development

To work on the theme locally:

```bash
cd themes/next
npm install
npm run dev
```

Set `PLANET_DATA_PATH` to point to a `data.json` file before starting dev mode to load real data:

```bash
PLANET_DATA_PATH=/absolute/path/to/data.json npm run dev
```

The dev server reads the file at startup; update the file and restart to refresh data.

## Testing

From the project root:

```bash
npm test
```

A Mocha test ensures the resolver script handles configuration paths correctly.
