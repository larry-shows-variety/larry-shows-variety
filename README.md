# Larry Shows Variety

A portfolio showcasing Larry's interior and exterior renovation work.

## Local development

Install Node.js 24 LTS, then install the dependencies:

```sh
npm ci
```

Start the local preview with automatic updates as you edit:

```sh
npm run dev
```

Open the Local URL printed in the terminal (usually `http://localhost:5173`).
Press Ctrl+C to stop the server.

## Production build

```sh
npm run build
npm run preview
```

The build writes the static site to `dist/`. The preview command serves that
build locally. Relative asset paths allow the build to work under a GitHub
Pages repository path or a custom domain.
