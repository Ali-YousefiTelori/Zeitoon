import { Box, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVersesInChapter } from "../api";
import CopyVerseButton from "../components/CopyVerseButton";
import MoreInformationDrawer from "../components/MoreInformationDrawer";
import SubHeader from "../components/SubHeader";
import Verse from "../components/Verse";
import { formatVerseForCopy, parseVerseSelectionKey } from "../helpers/utils";
import { useBibleStore } from "../store";

const Passage = () => {
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const activeBook: string = useParams().activeBook as string;
  const activeChapter = Number(useParams().activeChapter);
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);
  const [versesInChaper, setVersesInChaper] = useState<
    {
      verse: number;
      text: string;
      transliteration: string;
      originalText: string;
      content: string[];
    }[]
  >([]);
  const [informationDrawerOpened, { open: informationDrawerOpen, close: informationDrawerClose }] =
    useDisclosure(false);
  const [drawerContent, setDrawerContent] = useState<{
    text: string;
    originalText: string;
    transliteration: string;
    content: string[];
  }>({
    text: "",
    originalText: "",
    transliteration: "",
    content: [],
  });

  const addUniqueSelectedVerse = (verse: string) => {
    if (!selectedVerses.includes(verse)) {
      setSelectedVerses([...selectedVerses, verse]);
    } else {
      setSelectedVerses(selectedVerses.filter(item => item !== verse));
    }
  };

  // const { nextHandler, prevHandler } = usePreviousAndNextHandlers();

  // const swipeHandlers = useSwipe(prevHandler, nextHandler);

  useEffect(() => {
    async function handleVersesInChaper() {
      const data = await getVersesInChapter(activeBook, activeChapter);
      setVersesInChaper(data);
    }
    handleVersesInChaper();
  }, [activeBook, activeChapter]);

  const handleOnMultipleCopy = () => {
    const copyOptions = {
      includeOriginalText: copyIncludeOriginalText,
      includeTransliteration: copyIncludeTransliteration,
      includeTranslation: copyIncludeTranslation,
    };

    const copiedText = selectedVerses
      .map(key => {
        const { verse } = parseVerseSelectionKey(key);
        const verseData = versesInChaper.find(item => item.verse === verse);
        if (!verseData) return "";

        return formatVerseForCopy(
          {
            originalText: verseData.originalText,
            transliteration: verseData.transliteration,
            text: verseData.text,
            bookName: activeBook,
            chapter: activeChapter,
            verse,
          },
          copyOptions,
        );
      })
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(copiedText);
    setSelectedVerses([]);
  };

  const clearVerseSelection = () => {
    setSelectedVerses([]);
  };

  return (
    <Box style={{ flex: "1 0 100%" }}>
      <SubHeader />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        h="85vh"
      >
        <ScrollArea dir="rtl" h="85vh" w={"100%"}>
          {versesInChaper.map(({ verse, text, transliteration, originalText, content }) => (
            <Verse
              selectedVerses={selectedVerses}
              addUniqueSelectedVerse={addUniqueSelectedVerse}
              setDrawerContent={setDrawerContent}
              informationDrawerOpen={informationDrawerOpen}
              verse={verse}
              key={verse}
              text={text}
              transliteration={transliteration}
              originalText={originalText}
              content={content}
            />
          ))}
        </ScrollArea>
        <MoreInformationDrawer
          opened={informationDrawerOpened}
          close={informationDrawerClose}
          text={drawerContent.text}
          originalText={drawerContent.originalText}
          transliteration={drawerContent.transliteration}
          content={drawerContent.content}
        />
        {selectedVerses.length ? (
          <CopyVerseButton
            handleOnMultipleCopy={handleOnMultipleCopy}
            clearVerseSelection={clearVerseSelection}
          />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default Passage;
