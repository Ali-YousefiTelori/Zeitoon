import { getBooks, getChapters } from "../api";

const AUDIO_BASE_URL = "https://www.wordproaudio.net/bibles/app/audio/20";
const UNSUPPORTED_AUDIO_BOOKS = new Set(["قرآن"]);
const AUDIO_DB_NAME = "zeitoon-audio";
const AUDIO_STORE_NAME = "files";

type ProgressHandler = (progress: number) => void;

interface ElectronAudioBridge {
  download: (url: string, key: string, jobId: string) => Promise<void>;
  cancelDownload: (jobId: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
  onProgress: (jobId: string, callback: (progress: number) => void) => () => void;
  getLocalUrl: (key: string) => Promise<string | null>;
}

declare global {
  interface Window {
    electronAudio?: ElectronAudioBridge;
  }
}

const getBookIndex = async (bookName: string) => {
  const books = await getBooks();
  const index = books.findIndex(book => book === bookName);
  if (index === -1) throw new Error(`Audio book not found: ${bookName}`);
  return index + 1;
};

export const getAudioUrl = async (bookName: string, chapter: number) => {
  if (UNSUPPORTED_AUDIO_BOOKS.has(bookName)) {
    throw new Error(`Audio is not available for ${bookName}`);
  }
  const bookIndex = await getBookIndex(bookName);
  return `${AUDIO_BASE_URL}/${bookIndex}/${chapter}.mp3`;
};

const getAudioKey = (bookName: string, chapter: number) => `${bookName}:${chapter}`;

const openAudioDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(AUDIO_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getStoredAudio = async (key: string) => {
  if (window.electronAudio) return window.electronAudio.getLocalUrl(key);
  if (!window.indexedDB) return null;

  const db = await openAudioDb();
  return new Promise<string | null>((resolve, reject) => {
    const request = db.transaction(AUDIO_STORE_NAME, "readonly").objectStore(AUDIO_STORE_NAME).get(key);
    request.onsuccess = () => {
      const blob = request.result as Blob | undefined;
      resolve(blob ? URL.createObjectURL(blob) : null);
    };
    request.onerror = () => reject(request.error);
  });
};

const hasStoredAudio = async (key: string) => {
  if (window.electronAudio) return Boolean(await window.electronAudio.getLocalUrl(key));
  if (!window.indexedDB) return false;

  const db = await openAudioDb();
  return new Promise<boolean>((resolve, reject) => {
    const request = db.transaction(AUDIO_STORE_NAME, "readonly").objectStore(AUDIO_STORE_NAME).get(key);
    request.onsuccess = () => resolve(Boolean(request.result));
    request.onerror = () => reject(request.error);
  });
};

const saveStoredAudio = async (key: string, blob: Blob) => {
  const db = await openAudioDb();
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(AUDIO_STORE_NAME, "readwrite").objectStore(AUDIO_STORE_NAME).put(blob, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const downloadInBrowser = async (
  url: string,
  key: string,
  onProgress: ProgressHandler,
  signal: AbortSignal,
) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Audio download failed (${response.status})`);
  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) {
    await saveStoredAudio(key, await response.blob());
    onProgress(1);
    return;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.length;
      onProgress(total ? loaded / total : 0);
    }
  }
  await saveStoredAudio(key, new Blob(chunks, { type: "audio/mpeg" }));
  onProgress(1);
};

const downloadOne = async (
  bookName: string,
  chapter: number,
  onProgress: ProgressHandler,
  signal: AbortSignal,
) => {
  if (signal.aborted) throw new DOMException("Download paused", "AbortError");
  const key = getAudioKey(bookName, chapter);
  if (await getStoredAudio(key)) {
    onProgress(1);
    return;
  }
  const url = await getAudioUrl(bookName, chapter);

  if (window.electronAudio) {
    const jobId = crypto.randomUUID();
    const removeListener = window.electronAudio.onProgress(jobId, onProgress);
    const cancelDownload = () => window.electronAudio?.cancelDownload(jobId);
    signal.addEventListener("abort", cancelDownload, { once: true });
    try {
      await window.electronAudio.download(url, key, jobId);
      onProgress(1);
    } finally {
      signal.removeEventListener("abort", cancelDownload);
      removeListener();
    }
    return;
  }

  await downloadInBrowser(url, key, onProgress, signal);
};

export const prepareAudioForPlayback = async (
  bookName: string,
  chapter: number,
  onProgress: ProgressHandler,
) => {
  if (window.electronAudio) {
    await downloadOne(bookName, chapter, onProgress, new AbortController().signal);
    return getStoredAudio(getAudioKey(bookName, chapter));
  }
  return getPlayableAudioUrl(bookName, chapter);
};

export const getPlayableAudioUrl = async (bookName: string, chapter: number) => {
  const key = getAudioKey(bookName, chapter);
  return (await getStoredAudio(key)) || getAudioUrl(bookName, chapter);
};

export const downloadBookAudio = async (
  bookName: string,
  onProgress: ProgressHandler,
  signal: AbortSignal,
) => {
  const chapters = await getChapters(bookName);
  if (!chapters.length) throw new Error("No chapters found for this book");

  for (let index = 0; index < chapters.length; index += 1) {
    const chapter = chapters[index];
    await downloadOne(bookName, chapter, chapterProgress => {
      onProgress((index + chapterProgress) / chapters.length);
    }, signal);
  }
  onProgress(1);
};

export const getBookAudioStatus = async (bookName: string) => {
  const chapters = await getChapters(bookName);
  const downloaded = await Promise.all(
    chapters.map(chapter => hasStoredAudio(getAudioKey(bookName, chapter))),
  );
  return {
    downloaded: downloaded.filter(Boolean).length,
    total: chapters.length,
    isComplete: chapters.length > 0 && downloaded.every(Boolean),
  };
};

export const deleteBookAudio = async (bookName: string) => {
  const chapters = await getChapters(bookName);
  await Promise.all(
    chapters.map(async chapter => {
      const key = getAudioKey(bookName, chapter);
      if (window.electronAudio) {
        await window.electronAudio.delete(key);
        return;
      }
      if (!window.indexedDB) return;
      const db = await openAudioDb();
      await new Promise<void>((resolve, reject) => {
        const request = db
          .transaction(AUDIO_STORE_NAME, "readwrite")
          .objectStore(AUDIO_STORE_NAME)
          .delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }),
  );
};
