import { getOneQuranSurahNames } from "../api";

export interface CopyVerseOptions {
  includeOriginalText: boolean;
  includeTransliteration: boolean;
  includeTranslation: boolean;
}

export const createVerseSelectionKey = (
  bookName: string,
  chapter: number,
  verse: number,
): string => `${bookName}|${chapter}|${verse}`;

export const parseVerseSelectionKey = (key: string) => {
  const [bookName, chapter, verse] = key.split("|");
  return { bookName, chapter: Number(chapter), verse: Number(verse) };
};

export const formatVerseForCopy = (
  {
    originalText,
    transliteration,
    text,
    bookName,
    chapter,
    verse,
  }: {
    originalText: string;
    transliteration: string;
    text: string;
    bookName: string;
    chapter: number;
    verse: number;
  },
  options: CopyVerseOptions,
): string => {
  const parts: string[] = [];

  if (options.includeOriginalText && originalText) {
    parts.push(originalText);
  }
  if (options.includeTransliteration && transliteration) {
    parts.push(transliteration);
  }
  if (options.includeTranslation && text) {
    parts.push(text);
  }

  const reference = `(${bookName}${
    bookName === "قرآن" ? " " + getOneQuranSurahNames(chapter) : ""
  } ${chapter}: ${verse})`;
  parts.push(reference);

  return parts.join("\n");
};

/** @deprecated Use createVerseSelectionKey for selection and formatVerseForCopy for clipboard */
export const createVerseKey = (
  originalText: string,
  text: string,
  bookName: string,
  chapter: number,
  verse: number,
): string => {
  return formatVerseForCopy(
    { originalText, transliteration: "", text, bookName, chapter, verse },
    { includeOriginalText: true, includeTransliteration: false, includeTranslation: true },
  );
};
