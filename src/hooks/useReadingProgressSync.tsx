import { useEffect } from "react";
import { useBibleStore } from "../store";

const useReadingProgressSync = () => {
  const activeBook = useBibleStore(state => state.activeBook);
  const activeChapter = useBibleStore(state => state.activeChapter);
  const activeVerse = useBibleStore(state => state.activeVerse);
  const activeReadingId = useBibleStore(state => state.activeReadingId);
  const updateActiveReadingProgress = useBibleStore(state => state.updateActiveReadingProgress);

  useEffect(() => {
    if (!activeReadingId) return;

    const { readings, activeBook: currentBook } = useBibleStore.getState();
    const reading = readings.find(item => item.id === activeReadingId);
    if (!reading || reading.bookName !== currentBook) return;

    updateActiveReadingProgress(activeChapter, activeVerse);
  }, [activeBook, activeChapter, activeVerse, activeReadingId, updateActiveReadingProgress]);
};

export default useReadingProgressSync;
