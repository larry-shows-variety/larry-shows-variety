const photos = Object.entries(
  import.meta.glob('/images/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
).map(([path, url]) => ({
  url,
  alt: `Larry's renovation work — ${path.split('/').at(-2).replaceAll('_', ' ')}`,
}));

const slideshow = document.querySelector('.slideshow');
const frames = [...slideshow.querySelectorAll('img')];
let remaining = [];
let current;
let active = 0;
let timer;
let nextReady;

function nextPhoto() {
  if (remaining.length === 0) {
    remaining = [...photos];
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    // The next photo is popped from the end; avoid repeating across cycles.
    if (remaining.length > 1 && remaining.at(-1) === current) {
      [remaining[0], remaining[remaining.length - 1]] = [remaining.at(-1), remaining[0]];
    }
  }
  current = remaining.pop();
  return current;
}

async function prepare(frame) {
  const photo = nextPhoto();
  frame.className = 'slideshow__image';
  frame.src = photo.url;
  frame.alt = photo.alt;
  frame.setAttribute('aria-hidden', 'true');
  await frame.decode();
}

function schedule() {
  clearTimeout(timer);
  if (!document.hidden && photos.length > 1) {
    timer = setTimeout(advance, 3000);
  }
}

async function advance() {
  if (await nextReady === false) {
    return;
  }
  if (document.hidden) return;
  const previous = frames[active];
  active = 1 - active;
  const incoming = frames[active];
  // Commit the offscreen starting position before animating it into view.
  void incoming.offsetWidth;
  previous.className = 'slideshow__image is-moving is-leaving';
  previous.setAttribute('aria-hidden', 'true');
  incoming.className = 'slideshow__image is-moving is-active';
  incoming.removeAttribute('aria-hidden');
  schedule();
  // Reuse the outgoing frame only after its transition finishes.
  nextReady = new Promise((resolve) => setTimeout(resolve, 500))
    .then(() => prepare(previous))
    .catch(() => false);
}

document.addEventListener('visibilitychange', schedule);

if (photos.length > 0) {
  try {
    await prepare(frames[0]);
    frames[0].classList.add('is-active');
    frames[0].removeAttribute('aria-hidden');
    slideshow.hidden = false;
    if (photos.length > 1) {
      nextReady = prepare(frames[1]);
      await nextReady;
      schedule();
    }
  } catch {
    // Keep the current photo if another image cannot be loaded.
  }
}
