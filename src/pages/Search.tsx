import {
  Box,
  Divider,
  Input,
  ScrollArea,
  SegmentedControl,
  Text,
  createStyles,
  rem,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Book, data } from "../api";
import CopyVerseButton from "../components/CopyVerseButton";
import SearchResultVerse from "../components/SearchResultVerse";
import { formatVerseForCopy, parseVerseSelectionKey } from "../helpers/utils";
import { SEARCH_BOOKS, SEARCH_TEXT, useBibleStore } from "../store";

const useStyles = createStyles(() => ({
  input: {
    direction: "rtl",
    textAlign: "right",
  },
}));

export function Search() {
  const { classes } = useStyles();
  const searchBook = useBibleStore(state => state.searchBook);
  const searchText = useBibleStore(state => state.searchText);
  const searchKey = useBibleStore(state => state.searchKey);
  const setSearchBook = useBibleStore(state => state.setSearchBook);
  const setSearchText = useBibleStore(state => state.setSearchText);
  const setSearchKey = useBibleStore(state => state.setSearchKey);
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [debouncedSearchKey] = useDebouncedValue(searchKey, 200);
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);

  const addUniqueSelectedVerse = (verse: string) => {
    if (!selectedVerses.includes(verse)) {
      setSelectedVerses([...selectedVerses, verse]);
    } else {
      setSelectedVerses(selectedVerses.filter(item => item !== verse));
    }
  };

  const handleOnMultipleCopy = () => {
    const copyOptions = {
      includeOriginalText: copyIncludeOriginalText,
      includeTransliteration: copyIncludeTransliteration,
      includeTranslation: copyIncludeTranslation,
    };

    const copiedText = selectedVerses
      .map(key => {
        const { bookName, chapter, verse } = parseVerseSelectionKey(key);
        const verseData = searchResults.find(
          item =>
            item.book_name === bookName &&
            Number(item.chapter) === chapter &&
            item.verse === verse,
        );
        if (!verseData) return "";

        return formatVerseForCopy(
          {
            originalText: verseData.originalText,
            transliteration: verseData.transliteration,
            text: verseData.text,
            bookName,
            chapter: Number(chapter),
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

  useEffect(() => {
    if (debouncedSearchKey && debouncedSearchKey.length > 1) {
      let searchDataHelper: any[] = [];
      switch (searchBook) {
        // Tanakh
        case SEARCH_BOOKS[0]:
          searchDataHelper = data
            .filter(item => item.book_index <= 39)
            .map((book: Book) => ({
              ...book,
              value: searchText === SEARCH_TEXT[0] ? book.transliteration : book.text,
            }));
          break;

        // Gospel
        case SEARCH_BOOKS[1]:
          searchDataHelper = data
            .filter(item => item.book_index < 44 && item.book_index > 39)
            .map((book: Book) => ({
              ...book,
              value: searchText === SEARCH_TEXT[0] ? book.transliteration : book.text,
            }));
          break;

        // Qur
        case SEARCH_BOOKS[2]:
          searchDataHelper = data
            .filter(item => item.book_index === 44)
            .map((book: Book) => ({
              ...book,
              value: searchText === SEARCH_TEXT[0] ? book.transliteration : book.text,
            }));
          break;

        // All
        case SEARCH_BOOKS[3]:
          searchDataHelper = data.map((book: Book) => ({
            ...book,
            value: searchText === SEARCH_TEXT[0] ? book.transliteration : book.text,
          }));
          break;
      }
      setSearchResults(
        searchDataHelper
          .filter(item => item.value.includes(debouncedSearchKey))
          .map(item => {
            if (searchText === SEARCH_TEXT[0]) {
              item.transliteration = item.transliteration.replaceAll(
                debouncedSearchKey,
                "{" + debouncedSearchKey + "}",
              );
            } else {
              item.text = item.text.replaceAll(debouncedSearchKey, "{" + debouncedSearchKey + "}");
            }
            return item;
          }),
      );
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchKey, searchBook, searchText]);

  return (
    <Box dir="ltr">
      <Divider
        size="sm"
        labelPosition="center"
        label={
          <Text lineClamp={1} size={"sm"} m="1em">
            انتخاب کتاب
          </Text>
        }
      />
      <SegmentedControl
        fullWidth
        data={SEARCH_BOOKS}
        defaultValue={searchBook}
        onChange={setSearchBook}
      />
      <Divider
        size="sm"
        labelPosition="center"
        label={
          <Text lineClamp={1} size={"sm"} m="1em">
            جست و جو در
          </Text>
        }
      />
      <SegmentedControl
        fullWidth
        data={SEARCH_TEXT}
        defaultValue={searchText}
        onChange={setSearchText}
      />
      <br />
      <Input
        classNames={{ input: classes.input }}
        rightSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
        defaultValue={searchKey}
        onChange={e => {
          setSearchKey(e.target.value);
        }}
        placeholder="جست و جو کنید"
      />
      <Divider
        size="sm"
        labelPosition="center"
        label={
          <Text lineClamp={1} size={"sm"} m="1em" dir="rtl">
            {searchResults.length + " "}
            نتیجه در
            {" " + searchBook}
          </Text>
        }
      />
      {searchResults?.length ? (
        <ScrollArea mt={"1vh"} h="55vh" w={"100%"} dir="rtl">
          {searchResults
            .slice(0, 300)
            .map(
              ({ verse, text, transliteration, originalText, content, book_name, chapter }, i) => (
                <SearchResultVerse
                  selectedVerses={selectedVerses}
                  addUniqueSelectedVerse={addUniqueSelectedVerse}
                  verse={verse}
                  key={i}
                  text={text}
                  transliteration={transliteration}
                  originalText={originalText}
                  hasContent={!!content?.length}
                  book_name={book_name}
                  chapter={chapter}
                />
              ),
            )}
        </ScrollArea>
      ) : (
        <></>
      )}
      {selectedVerses.length ? (
        <CopyVerseButton
          handleOnMultipleCopy={handleOnMultipleCopy}
          clearVerseSelection={clearVerseSelection}
        />
      ) : (
        <></>
      )}
    </Box>
  );
}
