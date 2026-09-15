import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { ActionIcon, Box, Group, Progress, Slider, Text, rem } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { prepareAudioForPlayback } from "../services/audio";
import { useBibleStore } from "../store";

const Audio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<Howl | null>(null);
  const positionTimer = useRef<number | null>(null);
  const activeBook = useParams().activeBook;
  const activeChapter = Number(useParams().activeChapter);
  const playbackRate = useBibleStore(state => state.playbackRate);

  useEffect(() => {
    audioRef.current?.unload();
    audioRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setHasError(false);
  }, [activeBook, activeChapter]);

  useEffect(() => {
    audioRef.current?.rate(playbackRate);
  }, [playbackRate]);

  useEffect(() => {
    if (!isPlaying) {
      if (positionTimer.current !== null) window.clearInterval(positionTimer.current);
      positionTimer.current = null;
      return;
    }

    positionTimer.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio) setPosition(Number(audio.seek()) || 0);
    }, 250);

    return () => {
      if (positionTimer.current !== null) window.clearInterval(positionTimer.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      audioRef.current?.unload();
    };
  }, []);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.playing()) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }

    setIsLoading(true);
    setLoadProgress(0);
    setHasError(false);
    try {
      const source = await prepareAudioForPlayback(
        activeBook || "",
        activeChapter,
        setLoadProgress,
      );
      if (!source) throw new Error("Audio file is unavailable");

      const audioHowl = new Howl({
        src: [source],
        html5: true,
        pool: 1,
        rate: playbackRate,
        onload: () => {
          setIsLoading(false);
          setDuration(audioHowl.duration());
        },
        onloaderror: () => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
        },
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onend: () => {
          setIsPlaying(false);
          setPosition(0);
        },
      });
      audioRef.current = audioHowl;
      audioHowl.play();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    }
  };

  const handleSeek = (value: number) => {
    audioRef.current?.seek(value);
    setPosition(value);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <Box style={{ position: "relative", minWidth: rem(150), flex: 1, maxWidth: rem(260) }}>
      {isLoading && (
        <Progress
          value={loadProgress ? loadProgress * 100 : 100}
          size={2}
          animate
          style={{ position: "absolute", top: -4, left: 0, right: 0 }}
          aria-label="در حال بارگذاری صوت"
        />
      )}
      <Group spacing={6} noWrap>
        <ActionIcon
          variant="default"
          onClick={handlePlayPause}
          disabled={activeBook === "قرآن" || isLoading}
          aria-label={hasError ? "خطا در پخش صوت" : isPlaying ? "مکث صوت" : "پخش صوت"}
        title={activeBook === "قرآن" ? "صوت قرآن هنوز اضافه نشده است" : hasError ? "فایل صوتی در دسترس نیست" : undefined}
        >
          {isPlaying ? <IconPlayerPause size={rem(20)} /> : <IconPlayerPlay size={rem(20)} />}
        </ActionIcon>
      </Group>
      <Slider
        aria-label="موقعیت پخش صوت"
        value={position}
        min={0}
        max={duration || 1}
        onChange={handleSeek}
        disabled={!duration || activeBook === "قرآن"}
        size="xs"
        mt={4}
      />
      <Text size="xs" color="dimmed" align="center" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </Box>
  );
};

export default Audio;
