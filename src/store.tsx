import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const SEARCH_BOOKS = ["عهد قدیم", "انجیل", "قرآن", "کل کتاب"];
export const SEARCH_TEXT = ["اصل متن", "ترجمه"];

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
    }),
    {
      name: "bible-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
