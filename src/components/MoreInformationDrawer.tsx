import {
  ActionIcon,
  Button,
  CopyButton,
  Divider,
  Drawer,
  Input,
  Popover,
  Text,
  Tooltip,
  createStyles,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { IconBookmark, IconBookmarkFilled, IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatVerseForCopy } from "../helpers/utils";
import { useBibleStore } from "../store";
import { ContentSpoiler } from "./ContentSpoiler";
import { VerseDetails } from "./VerseDetails";

const useStyles = createStyles(() => ({
  input: {
    direction: "rtl",
    textAlign: "right",
  },
}));

function MoreInformationDrawer({
  opened,
  close,
  originalText,
  transliteration,
  text,
  content,
}: {
  opened: boolean;
  close: () => void;
  originalText: string;
  transliteration: string;
  text: string;
  content: string[];
}) {
  const { classes } = useStyles();

  const activeBook = useParams().activeBook as string;
  const activeChapter = Number(useParams().activeChapter);
  const activeVerse = Number(useParams().activeVerse);
  const setSavedVerses = useBibleStore(state => state.setSavedVerses);
  const savedVerses = useBibleStore(state => state.savedVerses);
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);

  const [savedKeyValue, setSavedKeyValue] = useInputState("");
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [isVerseSaved, setIsVerseSaved] = useState(false);
  const theme = useMantineTheme();

  useEffect(() => {
    setIsVerseSaved(
      savedVerses.some(
        item =>
          item.book === activeBook && item.chapter === activeChapter && item.verse === activeVerse,
      ),
    );
  }, [activeBook, activeChapter, activeVerse]);

  const removeTheVerse = () => {
    const verseIndex = savedVerses.findIndex(
      item =>
        item.book === activeBook && item.chapter === activeChapter && item.verse === activeVerse,
    );
    savedVerses.splice(verseIndex, 1);
    setSavedVerses(savedVerses);
    setIsVerseSaved(false);
  };

  const saveTheVerse = () => {
    savedVerses.push({
      originalText,
      transliteration,
      text,
      book: activeBook,
      chapter: activeChapter,
      verse: activeVerse,
      key: savedKeyValue,
    });
    setSavedVerses(savedVerses);
    setIsVerseSaved(true);
  };
  return (
    <>
      <Drawer.Root position="bottom" opened={opened} onClose={close} dir="rtl">
        <Drawer.Overlay blur={3} />
        <Drawer.Content
          style={{
            height: content?.length ? "55rem" : "20rem",
            borderTopRightRadius: "10px",
            borderTopLeftRadius: "10px",
          }}
        >
          <Drawer.Header display={"block"} pb={0}>
            <>
              <Drawer.CloseButton />
              <Text
                dir="rtl"
                ta={"center"}
                display={"flex"}
                style={{ justifyContent: "center" }}
                size="lg"
              >
                {activeBook}, {activeChapter}, {activeVerse}
                <CopyButton
                  value={formatVerseForCopy(
                    {
                      originalText,
                      transliteration,
                      text,
                      bookName: activeBook,
                      chapter: activeChapter,
                      verse: activeVerse,
                    },
                    {
                      includeOriginalText: copyIncludeOriginalText,
                      includeTransliteration: copyIncludeTransliteration,
                      includeTranslation: copyIncludeTranslation,
                    },
                  )}
                  timeout={2000}
                >
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "کپی شد" : "کپی کردن"} withArrow position="right">
                      <ActionIcon
                        style={{ color: copied ? theme.colors.teal[6] : theme.colors.gray[6] }}
                        mr={"1rem"}
                        onClick={copy}
                      >
                        {copied ? <IconCheck size="1.4rem" /> : <IconCopy size="1.4rem" />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Popover opened={popoverOpened} width={300} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <ActionIcon
                      style={{ color: theme.colors.gray[6] }}
                      mr={"1rem"}
                      onClick={() => {
                        if (!isVerseSaved) setPopoverOpened(true);
                        else removeTheVerse();
                      }}
                    >
                      {isVerseSaved ? (
                        <IconBookmarkFilled size="1.4rem" />
                      ) : (
                        <IconBookmark size="1.4rem" />
                      )}
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Input
                      value={savedKeyValue}
                      onChange={setSavedKeyValue}
                      classNames={{ input: classes.input }}
                      placeholder="توضیحاتی برای جست و جو اضافه کنید"
                    />
                    <Button
                      mt={"xs"}
                      variant="default"
                      onClick={() => {
                        saveTheVerse();
                        setPopoverOpened(false);
                      }}
                    >
                      ذخیره
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Text>
            </>
          </Drawer.Header>
          <Drawer.Body mb={rem(20)}>
            <Divider
              size="sm"
              labelPosition="center"
              label={
                <Text lineClamp={1} size={"md"} m="1em">
                  متن آیه
                </Text>
              }
            />

            <VerseDetails
              activeBookFromParams={activeBook}
              originalText={originalText}
              transliteration={transliteration}
              verse={text}
              showOriginalText={true}
              showMoreInformationIcon={false}
            />
            {content?.length ? (
              <>
                <Divider
                  size="sm"
                  labelPosition="center"
                  label={
                    <Text lineClamp={1} size={"md"} m="1em">
                      سوالات مرتبط
                    </Text>
                  }
                />
              </>
            ) : null}
            <div>
              {content?.map((item, index) => (
                <div key={index}>
                  <Divider
                    variant="dashed"
                    size="xs"
                    label={
                      <Text size={"sm"} opacity={"60%"}>
                        {`(سوال ${index + 1})`}
                      </Text>
                    }
                  />
                  <ContentSpoiler text={item} />
                  <br />
                </div>
              ))}
            </div>
          </Drawer.Body>
        </Drawer.Content>
        {content?.length ? (
          <Button
            pos={"absolute"}
            bottom={0}
            display={opened ? "flex" : "none"}
            w={"100%"}
            dir="rtl"
            onClick={close}
            style={{
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            بستن
          </Button>
        ) : null}
      </Drawer.Root>
    </>
  );
}

export default MoreInformationDrawer;
