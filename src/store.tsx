import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const SEARCH_BOOKS = ["عهد قدیم", "انجیل", "قرآن", "کل کتاب"];
export const SEARCH_TEXT = ["اصل متن", "ترجمه"];

export interface ReadingSession {
  id: string;
  name: string;
  bookName: string;
  chapter: number;
  verse: number;
  hasProgress: boolean;
}

interface BibleState {
  activeBook: string;
  activeBookShort: string;
  activeChapter: number;
  activeVerse: number;
  searchBook: string;
  searchText: string;
  searchKey: string;
  showOriginalTextSetting: boolean;
  copyIncludeOriginalText: boolean;
  copyIncludeTransliteration: boolean;
  copyIncludeTranslation: boolean;
  searchedVerse: string;
  savedVerses: any[];
  readings: ReadingSession[];
  activeReadingId: string | null;
  setActiveBook: (activeBook: string) => void;
  setActiveBookOnly: (activeBook: string) => void;
  setActiveBookShort: (activeBookShort: string) => void;
  setActiveChapter: (activeChapter: number) => void;
  setActiveVerse: (activeVerse: number) => void;
  setSearchBook: (book: string) => void;
  setSearchText: (text: string) => void;
  setSearchKey: (key: string) => void;
  setShowOriginalTextSetting: (key: boolean) => void;
  setCopyIncludeOriginalText: (value: boolean) => void;
  setCopyIncludeTransliteration: (value: boolean) => void;
  setCopyIncludeTranslation: (value: boolean) => void;
  setSearchedVerse: (key: string) => void;
  setSavedVerses: (key: any[]) => void;
  addReading: (name: string, bookName: string) => void;
  renameReading: (id: string, name: string) => void;
  deleteReading: (id: string) => void;
  continueReading: (id: string) => void;
  updateActiveReadingProgress: (chapter: number, verse: number) => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    set => ({
      activeBook: "پیدایش",
      activeBookShort: "Gen",
      activeChapter: 1,
      activeVerse: 1,
      searchBook: SEARCH_BOOKS[3],
      searchText: SEARCH_TEXT[1],
      searchKey: "",
      showOriginalTextSetting: true,
      copyIncludeOriginalText: true,
      copyIncludeTransliteration: true,
      copyIncludeTranslation: true,
      searchedVerse: "",
      savedVerses: [],
      readings: [],
      activeReadingId: null,
      setActiveBook: activeBook => set({ activeBook, activeChapter: 1 }),
      setActiveBookOnly: activeBook => set({ activeBook }),
      setActiveBookShort: activeBookShort => set({ activeBookShort }),
      setActiveChapter: activeChapter => set({ activeChapter }),
      setSearchBook: book => set({ searchBook: book }),
      setSearchText: text => set({ searchText: text }),
      setSearchKey: key => set({ searchKey: key }),
      setShowOriginalTextSetting: key => set({ showOriginalTextSetting: key }),
      setCopyIncludeOriginalText: copyIncludeOriginalText => set({ copyIncludeOriginalText }),
      setCopyIncludeTransliteration: copyIncludeTransliteration => set({ copyIncludeTransliteration }),
      setCopyIncludeTranslation: copyIncludeTranslation => set({ copyIncludeTranslation }),
      setActiveVerse: activeVerse => set({ activeVerse }),
      setSearchedVerse: searchedVerse => set({ searchedVerse }),
      setSavedVerses: (savedVerses: any[]) => set({ savedVerses }),
      addReading: (name, bookName) =>
        set(state => ({
          readings: [
            ...state.readings,
            {
              id: crypto.randomUUID(),
              name,
              bookName,
              chapter: 1,
              verse: 1,
              hasProgress: false,
            },
          ],
        })),
      renameReading: (id, name) =>
        set(state => ({
          readings: state.readings.map(reading =>
            reading.id === id ? { ...reading, name } : reading,
          ),
        })),
      deleteReading: id =>
        set(state => ({
          readings: state.readings.filter(reading => reading.id !== id),
          activeReadingId: state.activeReadingId === id ? null : state.activeReadingId,
        })),
      continueReading: id =>
        set(state => {
          const reading = state.readings.find(item => item.id === id);
          if (!reading) return state;

          return {
            activeReadingId: id,
            activeBook: reading.bookName,
            activeChapter: reading.chapter,
            activeVerse: reading.verse,
          };
        }),
      updateActiveReadingProgress: (chapter, verse) =>
        set(state => {
          if (!state.activeReadingId) return state;

          const readingIndex = state.readings.findIndex(
            reading => reading.id === state.activeReadingId,
          );
          if (readingIndex === -1) return state;

          const reading = state.readings[readingIndex];
          if (reading.bookName !== state.activeBook) return state;

          if (reading.chapter === chapter && reading.verse === verse && reading.hasProgress) {
            return state;
          }

          const readings = [...state.readings];
          readings[readingIndex] = {
            ...reading,
            chapter,
            verse,
            hasProgress: true,
          };

          return { readings };
        }),
    }),
    {
      name: "bible-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
