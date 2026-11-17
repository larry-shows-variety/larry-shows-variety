import { readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const galleries = [
  'creative_craftsmanship',
  'exceptional_exterior_work',
  'fantastic_finishing',
  'glorious_garbage',
];

export default defineConfig({
  build: {
    rolldownOptions: {
      input: ['index', ...galleries].map((page) => resolve(root, `${page}.html`)),
    },
  },
  plugins: [{
    name: 'static-gallery-images',
    transformIndexHtml: {
      // Insert image tags before Vite processes asset URLs for deployment.
      order: 'pre',
      handler(html, context) {
        const folder = basename(context.filename, '.html');
        if (!galleries.includes(folder)) return html;

        const images = readdirSync(resolve(root, 'images', folder))
          .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
          .sort()
          .map((file, index) => {
            const src = `/images/${folder}/${encodeURIComponent(file)}`;
            const alt = `${folder.replaceAll('_', ' ')} — photo ${index + 1}`;
            return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" />`;
          })
          .join('\n        ');

        return html.replace('<!-- gallery -->', images);
      },
    },
  }],
});
