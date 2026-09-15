import { useState, useEffect } from "react";
import { Howl } from "howler";
import { ActionIcon, Box, Progress, rem } from "@mantine/core";
import { IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { prepareAudioForPlayback } from "../services/audio";

const Audio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [audio, setAudio] = useState<Howl | null>(null);
  const activeBook = useParams().activeBook;
  const activeChapter = Number(useParams().activeChapter);

  useEffect(() => {
    async function handleOnPlay() {
      if (isPlaying) {
        if (audio !== null) audio.stop();
        setIsLoading(true);
        setLoadProgress(0);
        setHasError(false);
        let source: string;
        try {
          source = (await prepareAudioForPlayback(activeBook || "", activeChapter, setLoadProgress)) || "";
          if (!source) throw new Error("Audio file is unavailable");
        } catch {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
          return;
        }
        const audioHowl = new Howl({
          src: [source],
          html5: true,
          pool: 1,
          onload: () => setIsLoading(false),
          onloaderror: () => {
            setIsLoading(false);
            setIsPlaying(false);
            setHasError(true);
          },
          onplay: () => setIsPlaying(true),
          onpause: () => setIsPlaying(false),
          onend: () => setIsPlaying(false),
        });
        setAudio(audioHowl);
        audioHowl.play();
      } else {
        audio?.stop();
        setIsLoading(false);
      }

      return () => {
        audio?.unload();
      };
    }
    handleOnPlay();
  }, [activeBook, activeChapter, isPlaying]);

  return (
    <Box style={{ position: "relative" }}>
      {isLoading && (
        <Progress
          value={loadProgress ? loadProgress * 100 : 100}
          size={2}
          animate
          style={{ position: "absolute", top: -4, left: 0, right: 0 }}
          aria-label="در حال بارگذاری صوت"
        />
      )}
      <ActionIcon
        variant="default"
        onClick={() => setIsPlaying(value => !value)}
        disabled={isLoading}
        aria-label={hasError ? "خطا در پخش صوت" : isPlaying ? "توقف صوت" : "پخش صوت"}
        title={hasError ? "فایل صوتی در دسترس نیست" : undefined}
      >
        {isPlaying ? <IconPlayerStop size={rem(20)} /> : <IconPlayerPlay size={rem(20)} />}
      </ActionIcon>
    </Box>
  );
};

export default Audio;
