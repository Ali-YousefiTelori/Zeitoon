import { Box, Flex, Text, createStyles } from "@mantine/core";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createVerseSelectionKey } from "../helpers/utils";
import useLongPress from "../hooks/useLongPress";
import { useBibleStore } from "../store";
import { VerseDetails } from "./VerseDetails";

const useStyles = createStyles(theme => ({
  link: {
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
}));

const Verse = ({
  selectedVerses,
  addUniqueSelectedVerse,
  setDrawerContent,
  verse,
  text,
  originalText,
  informationDrawerOpen,
  content,
  transliteration,
}: {
  selectedVerses: string[];
  addUniqueSelectedVerse: (verse: string) => void;
  setDrawerContent: any;
  informationDrawerOpen: () => void;
  verse: number;
  text: string;
  originalText: string;
  transliteration: string;
  content: string[];
}) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { classes, cx } = useStyles();
  const activeChapterFromParams = Number(useParams().activeChapter);
  const activeVerseFromParams = Number(useParams().activeVerse);
  const activeBookFromParams = useParams().activeBook as string;
  const showOriginalTextSetting = useBibleStore(state => state.showOriginalTextSetting);
  const setActiveVerse = useBibleStore(state => state.setActiveVerse);

  const verseKey = createVerseSelectionKey(
    activeBookFromParams,
    activeChapterFromParams,
    verse,
  );

  const onLongPress = () => {
    navigate(`/${activeBookFromParams}/${activeChapterFromParams}/${verse}`, { replace: true });
    setActiveVerse(verse);
    addUniqueSelectedVerse(verseKey);
  };

  const onClick = () => {
    if (!selectedVerses.length) {
      navigate(`/${activeBookFromParams}/${activeChapterFromParams}/${verse}`, { replace: true });
      setActiveVerse(verse);
      setDrawerContent({ text, originalText, transliteration, content });
      informationDrawerOpen();
    } else {
      navigate(`/${activeBookFromParams}/${activeChapterFromParams}/${verse}`, { replace: true });
      setActiveVerse(verse);
      addUniqueSelectedVerse(verseKey);
    }
  };

  // const onTouchStart = () => {
  //   navigate(`/${activeBookFromParams}/${activeChapterFromParams}/${verse}`, { replace: true });
  //   setActiveVerse(verse);
  // };

  const defaultOptions = {
    shouldPreventDefault: true,
    delay: 500,
  };
  const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

  setTimeout(() => {
    ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
  return (
    <>
      <Box
        component="div"
        display="flex"
        dir="rtl"
        ta={"right"}
        className={cx(classes.link, {
          [classes.linkActive]: !selectedVerses.length
            ? activeVerseFromParams === verse
            : selectedVerses.includes(verseKey),
        })}
        py={7}
        px={10}
        {...longPressEvent}
        ref={activeVerseFromParams === verse ? ref : null}
      >
        <Flex direction="row">
          <Text fz="sm" fw="bold" ml={3}>
            {verse}
          </Text>
          <Flex direction={"column"}>
            <VerseDetails
              activeBookFromParams={activeBookFromParams}
              originalText={originalText}
              transliteration={transliteration}
              verse={text}
              showOriginalText={showOriginalTextSetting}
              showMoreInformationIcon={!!content?.length}
            />
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Verse;
