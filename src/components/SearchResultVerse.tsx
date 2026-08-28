import { Box, Text, Title, createStyles } from "@mantine/core";
import { IconDotsCircleHorizontal } from "@tabler/icons-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import reactStringReplace from "react-string-replace";
import { createVerseSelectionKey } from "../helpers/utils";
import useLongPress from "../hooks/useLongPress";
import { useBibleStore } from "../store";

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

const SearchResultVerse = ({
  selectedVerses,
  addUniqueSelectedVerse,
  verse,
  text,
  originalText: _originalText,
  transliteration,
  hasContent,
  book_name,
  chapter,
}: {
  selectedVerses: string[];
  addUniqueSelectedVerse: (verse: string) => void;
  verse: number;
  text: string;
  originalText: string;
  transliteration: string;
  hasContent: boolean;
  book_name: string;
  chapter: string;
}) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { classes, cx } = useStyles();
  const searchedVerse = useBibleStore(state => state.searchedVerse);
  const setSearchedVerse = useBibleStore(state => state.setSearchedVerse);

  if (!!searchedVerse)
    setTimeout(() => {
      ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);

  const verseKey = createVerseSelectionKey(book_name, Number(chapter), verse);

  const onLongPress = () => {
    setSearchedVerse(`/${book_name}/${chapter}/${verse}`);
    addUniqueSelectedVerse(verseKey);
  };

  const onClick = () => {
    if (!selectedVerses.length) {
      navigate(`/${book_name}/${chapter}/${verse}`);
      setSearchedVerse(`/${book_name}/${chapter}/${verse}`);
    } else {
      setSearchedVerse(`/${book_name}/${chapter}/${verse}`);
      addUniqueSelectedVerse(verseKey);
    }
  };

  const defaultOptions = {
    shouldPreventDefault: true,
    delay: 500,
  };
  const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

  return (
    <Box
      component="div"
      dir="rtl"
      ta={"right"}
      className={cx(classes.link, {
        [classes.linkActive]: !selectedVerses.length
          ? searchedVerse === `/${book_name}/${chapter}/${verse}`
          : selectedVerses.includes(verseKey),
      })}
      py={7}
      px={10}
      {...longPressEvent}
      ref={searchedVerse === `/${book_name}/${chapter}/${verse}` ? ref : null}
    >
      <Title order={5} weight={400}>
        {reactStringReplace(transliteration, /\{(.*?)\}/, (match, i) => (
          <span
            key={i}
            style={{
              textDecoration: "underline ",
              textUnderlinePosition: "under",
              fontWeight: "bold",
            }}
          >
            {match}
          </span>
        ))}
      </Title>
      <Title order={4} weight={400}>
        {reactStringReplace(text, /\{(.*?)\}/, (match, i) => (
          <span
            key={i}
            style={{
              textDecoration: "underline ",
              textUnderlinePosition: "under",
              fontWeight: "bold",
            }}
          >
            {match}
          </span>
        ))}
        {hasContent && <IconDotsCircleHorizontal height={"1em"} width={"1em"} />}
      </Title>
      <Text ta={"right"} size="xs" color="dimmed" sx={{ lineHeight: 1 }}>
        {book_name + " " + chapter + ":" + verse}
      </Text>
    </Box>
  );
};

export default SearchResultVerse;
