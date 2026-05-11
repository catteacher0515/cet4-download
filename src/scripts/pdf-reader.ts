import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type ReaderState = {
  root: HTMLElement;
  pages: HTMLElement;
  status: HTMLElement | null;
  pdfUrl: string;
  title: string;
};

GlobalWorkerOptions.workerSrc = workerUrl;

function updateStatus(state: ReaderState, message: string) {
  if (state.status) {
    state.status.textContent = message;
  }
}

function createCanvasShell(pageNumber: number) {
  const shell = document.createElement("section");
  shell.className = "reader-pdfjs__page";
  shell.setAttribute("aria-label", `第 ${pageNumber} 页`);

  const canvas = document.createElement("canvas");
  canvas.className = "reader-pdfjs__canvas";

  shell.appendChild(canvas);

  return { shell, canvas };
}

function getScale(container: HTMLElement, viewportWidth: number) {
  const horizontalPadding = 120;
  const availableWidth = Math.max(container.clientWidth - horizontalPadding, 320);
  return (availableWidth / viewportWidth) * 0.84;
}

function applyDarkTheme(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const isPaper = luminance > 0.84;
    const isInk = luminance < 0.38;

    if (isPaper) {
      pixels[index] = 43;
      pixels[index + 1] = 43;
      pixels[index + 2] = 43;
      continue;
    }

    if (isInk) {
      pixels[index] = 232;
      pixels[index + 1] = 228;
      pixels[index + 2] = 220;
      continue;
    }

    const mapped = Math.round(52 + luminance * 120);
    pixels[index] = mapped;
    pixels[index + 1] = mapped;
    pixels[index + 2] = mapped;
  }

  context.putImageData(imageData, 0, 0);
}

async function renderPage(
  pdf: Awaited<ReturnType<typeof getDocument>["promise"]>,
  state: ReaderState,
  pageNumber: number,
  scaleHint?: number
) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = scaleHint ?? getScale(state.pages, baseViewport.width);
  const viewport = page.getViewport({ scale });
  const { shell, canvas } = createCanvasShell(pageNumber);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("无法初始化 PDF 渲染上下文");
  }

  const outputScale = window.devicePixelRatio || 1;

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

  state.pages.appendChild(shell);

  await page.render({
    canvasContext: context,
    viewport
  }).promise;

  applyDarkTheme(canvas);
}

async function renderDocument(state: ReaderState) {
  updateStatus(state, "正在加载试卷...");
  state.pages.innerHTML = "";

  const pdf = await getDocument(state.pdfUrl).promise;
  const firstPage = await pdf.getPage(1);
  const firstViewport = firstPage.getViewport({ scale: 1 });
  const scale = getScale(state.pages, firstViewport.width);

  // First page already loaded only for computing stable width; render again through common pipeline.
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    await renderPage(pdf, state, pageNumber, scale);
  }

  updateStatus(state, `${state.title} · 共 ${pdf.numPages} 页`);
}

function initReader(root: HTMLElement) {
  const pdfUrl = root.dataset.pdfUrl;
  const title = root.dataset.pdfTitle ?? "试卷预览";
  const pages = root.querySelector<HTMLElement>("[data-reader-pages]");
  const status = root.querySelector<HTMLElement>("[data-reader-status]");

  if (!pdfUrl || !pages) {
    return;
  }

  const state: ReaderState = {
    root,
    pages,
    status,
    pdfUrl,
    title
  };

  let resizeTimer: number | undefined;

  const rerender = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      void renderDocument(state).catch((error) => {
        console.error(error);
        updateStatus(state, "加载失败，请直接下载 PDF");
      });
    }, 120);
  };

  void renderDocument(state).catch((error) => {
    console.error(error);
    updateStatus(state, "加载失败，请直接下载 PDF");
  });

  window.addEventListener("resize", rerender);
}

document.querySelectorAll<HTMLElement>("[data-reader-pdfjs]").forEach(initReader);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function initAudioBar(root: HTMLElement) {
  const media = root.querySelector<HTMLAudioElement>("[data-audio-media]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-audio-toggle]");
  const seek = root.querySelector<HTMLInputElement>("[data-audio-seek]");
  const current = root.querySelector<HTMLElement>("[data-audio-current]");
  const total = root.querySelector<HTMLElement>("[data-audio-total]");

  if (!media || !toggle || !seek || !current || !total) {
    return;
  }

  const syncToggle = () => {
    toggle.textContent = media.paused ? "▶" : "❚❚";
  };

  toggle.addEventListener("click", async () => {
    if (media.paused) {
      await media.play();
    } else {
      media.pause();
    }

    syncToggle();
  });

  media.addEventListener("loadedmetadata", () => {
    seek.max = String(media.duration || 0);
    total.textContent = formatTime(media.duration);
  });

  media.addEventListener("timeupdate", () => {
    seek.value = String(media.currentTime);
    current.textContent = formatTime(media.currentTime);
    syncToggle();
  });

  media.addEventListener("ended", syncToggle);
  media.addEventListener("pause", syncToggle);
  media.addEventListener("play", syncToggle);

  seek.addEventListener("input", () => {
    media.currentTime = Number(seek.value);
    current.textContent = formatTime(media.currentTime);
  });

  syncToggle();
}

document.querySelectorAll<HTMLElement>(".reader-audio-bar").forEach(initAudioBar);
