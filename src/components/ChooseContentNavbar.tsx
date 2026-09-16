import { Box, Navbar, ScrollArea, createStyles, rem } from "@mantine/core";
import { useEffect, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { getBooks, getChapters, getQuranSurahNames, getVerses } from "../api";
import { useBibleStore } from "../store";

const useStyles = createStyles(theme => ({
  border: {
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
  },

  link: {
    boxSizing: "border-box",
    display: "block",
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
    padding: `0 ${theme.spacing.xs}`,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    fontWeight: 500,
    height: rem(30),
    lineHeight: rem(30),

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
}));

const ChooseContentNavbar = ({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const location: any = matchPath("/:activeBook/:activeChapter/:activeVerse", pathname);
  const surahNames = getQuranSurahNames();

  const { classes, cx } = useStyles();

  const activeBook = location?.params?.activeBook;
  const activeChapter = Number(location?.params?.activeChapter);
  const activeVerse = Number(location?.params?.activeVerse);

  const setActiveBook = useBibleStore(state => state.setActiveBook);
  const setActiveChapter = useBibleStore(state => state.setActiveChapter);
  const setActiveVerse = useBibleStore(state => state.setActiveVerse);

  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [verses, setVerse] = useState<any[]>([]);

  useEffect(() => {
    async function handleBooks() {
      const data = await getBooks();
      setBooks(data);
    }
    async function handleChapters() {
      const data = await getChapters(activeBook);
      setChapters(data);
    }
    async function handleVerses() {
      const data = await getVerses(activeBook, activeChapter);
      setVerse(data);
    }
    handleBooks();
    handleChapters();
    handleVerses();
  }, [activeBook, activeChapter]);

  return (
    <Navbar
      py="sm"
      right={0}
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 325, lg: 325, s: 325, md: 325 }}
      sx={{
        overflow: "hidden",
        transition: "width 1000ms ease, min-width 1000ms ease",
      }}
    >
      <Navbar.Section style={{ display: "flex" }}>
        <Box style={{ flex: "0 0 150px" }}>
          <ScrollArea h="91vh" className={classes.border} dir="rtl">
            {books.map(book => (
              <a
                className={cx(classes.link, {
                  [classes.linkActive]: activeBook === book,
                })}
                href="/"
                onClick={event => {
                  event.preventDefault();
                  setActiveBook(book);
                  setActiveChapter(1);
                  setActiveVerse(1);
                  navigate(`/${book}/1/1`, { replace: true });
                }}
                key={book}
                title={"nav-book-" + book}
              >
                {book}
              </a>
            ))}
          </ScrollArea>
        </Box>
        <Box style={{ flex: "1 0 60px" }}>
          <ScrollArea h="91vh" className={classes.border} dir="rtl">
            {chapters.map(chapter => (
              <a
                className={cx(classes.link, {
                  [classes.linkActive]: activeChapter === chapter,
                })}
                href="/"
                onClick={event => {
                  event.preventDefault();
                  setActiveChapter(chapter);
                  setActiveVerse(1);
                  navigate(`/${activeBook}/${chapter}/1`, { replace: true });
                }}
                key={chapter}
                title={"nav-chapter-" + chapter}
              >
                {chapter} {activeBook === "قرآن" ? surahNames[chapter - 1] : ""}
              </a>
            ))}
          </ScrollArea>
        </Box>
        <Box style={{ flex: "1 0 20px" }}>
          <ScrollArea h="91vh" dir="rtl">
            {verses.map(verse => (
              <a
                className={cx(classes.link, {
                  [classes.linkActive]: activeVerse === verse,
                })}
                href="/"
                onClick={event => {
                  event.preventDefault();
                  setActiveVerse(verse);
                  window.dispatchEvent(
                    new CustomEvent("bible-audio-seek", {
                      detail: { book: activeBook, chapter: activeChapter, verse },
                    }),
                  );
                  navigate(`/${activeBook}/${activeChapter}/${verse}`);
                  setOpened(false);
                }}
                key={verse}
              >
                {verse}
              </a>
            ))}
          </ScrollArea>
        </Box>
      </Navbar.Section>
    </Navbar>
  );
};

export default ChooseContentNavbar;
