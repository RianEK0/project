# Noctra

Noctra is a premium emotion-first music discovery web application built as a production-style single-page experience. It combines a scalable 1,000+ song library, cinematic discovery UI, mood-led recommendations, community stories, and an admin analytics surface in a lightweight dependency-free frontend.

## Run

```bash
npm run start
```

Then open `http://localhost:4173`.

## Architecture

- `src/data/catalog.js`: Generates and indexes a 1,000+ song catalog with scalable metadata, chart feeds, playlists, recommendations, stories, profile data, and admin analytics.
- `src/main.js`: Renders the application, wires interactions, and keeps UI updates scoped to small sections for performance.
- `src/styles/app.css`: Defines the rainy-night visual system, glassmorphism surfaces, motion language, responsive layout, and premium component styling.

## Scale Notes

- The catalog is created with normalized metadata and precomputed search text so 1,000+ songs filter instantly on the client.
- Trending feeds, playlists, recommendation inputs, and admin metrics are derived from the same source of truth, making future API ingestion straightforward.
- The UI intentionally renders previews and ranked slices instead of dumping the entire library, which keeps the interface responsive even as the catalog grows.
