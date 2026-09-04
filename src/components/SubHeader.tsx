import { ActionIcon, Box, Title, rem } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { getChapters, getQuranSurahNames } from "../api";
import usePreviousAndNextHandlers from "../hooks/usePreviousAndNext";
import GoToVerseModal from "./GoToVerseModal";
import { useEffect, useState } from "react";

const SubHeader = () => {
  const navigate = useNavigate();
  const surahNames = getQuranSurahNames();
  const { activeBook, activeChapter, checkNext, checkPrev, nextHandler, prevHandler } =
    usePreviousAndNextHandlers();
  const [totalChapters, setTotalChapters] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!activeBook) return;

    getChapters(activeBook).then(chapters => {
      if (isActive) setTotalChapters(chapters.length || null);
    });

    return () => {
      isActive = false;
    };
  }, [activeBook]);

  const title =
    activeBook +
    " " +
    activeChapter +
    (totalChapters ? `/${totalChapters}` : "") +
    " " +
    (activeBook === "قرآن" ? surahNames[activeChapter - 1] : "");

  return (
    <Box
      sx={{
        marginTop: 10,
        minHeight: rem(40),
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      mb={20}
    >
      <ActionIcon
        variant="default"
        onClick={() => {
          navigate("/search");
        }}
      >
        <IconSearch size={rem(20)} />
      </ActionIcon>

      <ActionIcon
        variant="transparent"
        onClick={prevHandler}
        disabled={checkPrev() === null}
        title="prev-passage-button"
      >
        <IconArrowRight size={rem(20)} />
      </ActionIcon>

      <Title order={4}>{title}</Title>

      <ActionIcon
        variant="transparent"
        onClick={nextHandler}
        disabled={checkNext() === null}
        title="next-passage-button"
      >
        <IconArrowLeft size={rem(20)} />
      </ActionIcon>

      <GoToVerseModal />
    </Box>
  );
};

export default SubHeader;
