import { useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { ActionIcon, Box, Group, Progress, Slider, Text, rem } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { getVerses, getVersesInChapter } from "../api";
import { AudioSegment, getAudioSegments, prepareAudioSegmentForPlayback } from "../services/audio";
import { useBibleStore } from "../store";
import usePreviousAndNextHandlers from "../hooks/usePreviousAndNext";

let autoplayRequested = false;
let activePlayerToken = 0;

const Audio = () => {
  const { activeBook, activeChapter: chapterParam, activeVerse: verseParam } = useParams();
  const activeChapter = Number(chapterParam);
  const activeVerse = Number(verseParam);
  const navigate = useNavigate();
  const { nextHandler } = usePreviousAndNextHandlers();
  const playbackRate = useBibleStore(state => state.playbackRate);
  const textDisplayMode = useBibleStore(state => state.textDisplayMode);
  const setActiveVerse = useBibleStore(state => state.setActiveVerse);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const howlsRef = useRef<Howl[]>([]);
  const segmentsRef = useRef<AudioSegment[]>([]);
  const currentIndexRef = useRef(0);
  const positionTimer = useRef<number | null>(null);
  const autoStartedRef = useRef(false);
  const playbackGenerationRef = useRef(0);
  const playerTokenRef = useRef(0);
  const loadingGenerationRef = useRef<number | null>(null);
  const bibleBoundariesRef = useRef<{ verse: number; start: number; end: number }[]>([]);
  const lastSyncedVerseRef = useRef<number | null>(null);

  const unload = () => {
    howlsRef.current.forEach(howl => howl.unload());
    if (playerTokenRef.current === activePlayerToken) {
      Howler.stop();
      activePlayerToken += 1;
    }
    howlsRef.current = [];
    segmentsRef.current = [];
    currentIndexRef.current = 0;
  };

  useEffect(() => {
    playbackGenerationRef.current += 1;
    unload();
    bibleBoundariesRef.current = [];
    lastSyncedVerseRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setHasError(false);
    autoStartedRef.current = false;
    return () => {
      playbackGenerationRef.current += 1;
      unload();
    };
  }, [
    activeBook,
    activeChapter,
    activeBook === "قرآن" ? activeVerse : 0,
    activeBook === "قرآن" ? textDisplayMode : "both",
  ]);

  useEffect(() => {
    howlsRef.current.forEach(howl => howl.rate(playbackRate));
  }, [playbackRate]);

  useEffect(() => {
    if (!isPlaying) {
      if (positionTimer.current !== null) window.clearInterval(positionTimer.current);
      positionTimer.current = null;
      return;
    }
    positionTimer.current = window.setInterval(() => {
      const howl = howlsRef.current[currentIndexRef.current];
      if (!howl) return;
      const priorDuration = howlsRef.current
        .slice(0, currentIndexRef.current)
        .reduce((total, item) => total + item.duration(), 0);
      const currentPosition = priorDuration + (Number(howl.seek()) || 0);
      setPosition(currentPosition);

      if (activeBook !== "قرآن") {
        const activeBoundary = bibleBoundariesRef.current.find(
          boundary => currentPosition >= boundary.start && currentPosition < boundary.end,
        );
        if (activeBoundary && activeBoundary.verse !== lastSyncedVerseRef.current) {
          lastSyncedVerseRef.current = activeBoundary.verse;
          setActiveVerse(activeBoundary.verse);
          navigate(`/${activeBook}/${activeChapter}/${activeBoundary.verse}`, { replace: true });
        }
      }
    }, 250);
    return () => {
      if (positionTimer.current !== null) window.clearInterval(positionTimer.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (activeBook === "قرآن" || !isPlaying || !howlsRef.current.length) return;
    if (lastSyncedVerseRef.current === activeVerse) return;
    const boundary = bibleBoundariesRef.current.find(item => item.verse === activeVerse);
    if (!boundary) return;

    howlsRef.current[0].seek(boundary.start);
    setPosition(boundary.start);
    lastSyncedVerseRef.current = activeVerse;
  }, [activeBook, activeVerse, isPlaying]);

  const advance = async () => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < howlsRef.current.length) {
      currentIndexRef.current = nextIndex;
      setPosition(
        howlsRef.current.slice(0, nextIndex).reduce((total, item) => total + item.duration(), 0),
      );
      howlsRef.current[nextIndex].play();
      return;
    }

    setIsPlaying(false);
    setPosition(0);
    unload();
    bibleBoundariesRef.current = [];
    lastSyncedVerseRef.current = null;
    autoplayRequested = true;
    if (activeBook === "قرآن") {
      const verses = await getVerses(activeBook, activeChapter);
      const lastVerse = verses[verses.length - 1];
      if (activeVerse < lastVerse) {
        const nextVerse = activeVerse + 1;
        setActiveVerse(nextVerse);
        navigate(`/${activeBook}/${activeChapter}/${nextVerse}`, { replace: true });
        return;
      }
    }
    nextHandler();
  };

  const startPlayback = async () => {
    if (!activeBook || !activeChapter || !activeVerse) return;
    const playbackGeneration = playbackGenerationRef.current;
    if (loadingGenerationRef.current === playbackGeneration) return;
    loadingGenerationRef.current = playbackGeneration;
    const playerToken = ++activePlayerToken;
    playerTokenRef.current = playerToken;
    Howler.stop();
    setIsLoading(true);
    setLoadProgress(0);
    setHasError(false);
    try {
      const segments = await getAudioSegments(
        activeBook,
        activeChapter,
        activeVerse,
        textDisplayMode,
      );
      const howls: Howl[] = [];
      for (let index = 0; index < segments.length; index += 1) {
        const source = await prepareAudioSegmentForPlayback(segments[index], progress =>
          setLoadProgress((index + progress) / segments.length),
        );
        if (
          playbackGeneration !== playbackGenerationRef.current ||
          playerToken !== activePlayerToken
        ) {
          howls.forEach(howl => howl.unload());
          return;
        }
        if (!source) throw new Error("Audio file is unavailable");
        const howl = await new Promise<Howl>((resolve, reject) => {
          let created: Howl;
          created = new Howl({
            src: [source],
            html5: true,
            pool: 1,
            rate: playbackRate,
            onload: () => resolve(created),
            onloaderror: () => reject(new Error("Audio file is unavailable")),
          });
        });
        howls.push(howl);
      }
      if (
        playbackGeneration !== playbackGenerationRef.current ||
        playerToken !== activePlayerToken
      ) {
        howls.forEach(howl => howl.unload());
        return;
      }
      segmentsRef.current = segments;
      howlsRef.current = howls;
      currentIndexRef.current = 0;
      const totalDuration = howls.reduce((total, howl) => total + howl.duration(), 0);
      setDuration(totalDuration);
      if (activeBook !== "قرآن") {
        const verses = await getVersesInChapter(activeBook, activeChapter);
        const weights = verses.map(verse => ({
          verse: verse.verse,
          weight: Math.max(1, verse.text.replace(/\s/g, "").length),
        }));
        const totalWeight = weights.reduce((total, item) => total + item.weight, 0);
        let elapsed = 0;
        bibleBoundariesRef.current = weights.map(item => {
          const start = elapsed;
          elapsed += (totalDuration * item.weight) / totalWeight;
          return { verse: item.verse, start, end: elapsed };
        });
        lastSyncedVerseRef.current = activeVerse;
      }
      howls.forEach((howl, index) =>
        howl.on("end", () => {
          if (playerToken === activePlayerToken && index === currentIndexRef.current) {
            void advance();
          }
        }),
      );
      setIsLoading(false);
      setIsPlaying(true);
      if (playerToken === activePlayerToken) howls[0].play();
    } catch {
      if (playbackGeneration !== playbackGenerationRef.current || playerToken !== activePlayerToken)
        return;
      unload();
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
      autoplayRequested = false;
    } finally {
      if (loadingGenerationRef.current === playbackGeneration) {
        loadingGenerationRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (autoplayRequested && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void startPlayback();
    }
  }, [activeBook, activeChapter, activeVerse, activeBook === "قرآن" ? textDisplayMode : "both"]);

  const handlePlayPause = () => {
    const howl = howlsRef.current[currentIndexRef.current];
    if (howl) {
      if (howl.playing()) {
        howl.pause();
        setIsPlaying(false);
        autoplayRequested = false;
      } else {
        howl.play();
        setIsPlaying(true);
        autoplayRequested = true;
      }
      return;
    }
    autoplayRequested = true;
    void startPlayback();
  };

  const handleSeek = (value: number) => {
    let remaining = value;
    for (let index = 0; index < howlsRef.current.length; index += 1) {
      const itemDuration = howlsRef.current[index].duration();
      if (remaining <= itemDuration || index === howlsRef.current.length - 1) {
        currentIndexRef.current = index;
        howlsRef.current.forEach((item, itemIndex) => {
          if (itemIndex !== index) item.pause();
        });
        howlsRef.current[index].seek(Math.max(0, remaining));
        if (isPlaying) howlsRef.current[index].play();
        setPosition(value);
        return;
      }
      remaining -= itemDuration;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <Box style={{ position: "relative", minWidth: rem(150), flex: 1, maxWidth: rem(260) }}>
      {isLoading && (
        <Progress
          value={loadProgress * 100 || 100}
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
          disabled={isLoading}
          aria-label={hasError ? "خطا در پخش صوت" : isPlaying ? "مکث صوت" : "پخش صوت"}
          title={hasError ? "فایل صوتی در دسترس نیست" : undefined}
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
        disabled={!duration}
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
