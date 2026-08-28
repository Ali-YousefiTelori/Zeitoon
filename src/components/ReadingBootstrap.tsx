import { useEffect } from "react";
import useReadingProgressSync from "../hooks/useReadingProgressSync";
import { useBibleStore } from "../store";

const ReadingBootstrap = ({ children }: { children: React.ReactNode }) => {
  useReadingProgressSync();

  useEffect(() => {
    const restoreFromActiveReading = () => {
      const state = useBibleStore.getState();
      if (!state.activeReadingId) return;

      const reading = state.readings.find(item => item.id === state.activeReadingId);
      if (!reading) return;

      useBibleStore.setState({
        activeBook: reading.bookName,
        activeChapter: reading.chapter,
        activeVerse: reading.verse,
      });
    };

    if (useBibleStore.persist.hasHydrated()) {
      restoreFromActiveReading();
      return;
    }

    return useBibleStore.persist.onFinishHydration(restoreFromActiveReading);
  }, []);

  return <>{children}</>;
};

export default ReadingBootstrap;
