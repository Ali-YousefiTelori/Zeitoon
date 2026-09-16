import {
  Button,
  Checkbox,
  Divider,
  Group,
  NumberInput,
  Progress,
  Select,
  ScrollArea,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks } from "../api";
import { deleteBookAudio, downloadBookAudio, getBookAudioStatus } from "../services/audio";
import { useBibleStore } from "../store";

export function Settings() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<string[]>([]);
  const [downloadBook, setDownloadBook] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completedBooks, setCompletedBooks] = useState<Record<string, boolean>>({});
  const downloadController = useRef<AbortController | null>(null);
  const activeBook = useBibleStore(state => state.activeBook);
  const activeChapter = useBibleStore(state => state.activeChapter);
  const activeVerse = useBibleStore(state => state.activeVerse);
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);
  const setCopyIncludeOriginalText = useBibleStore(state => state.setCopyIncludeOriginalText);
  const setCopyIncludeTransliteration = useBibleStore(state => state.setCopyIncludeTransliteration);
  const setCopyIncludeTranslation = useBibleStore(state => state.setCopyIncludeTranslation);
  const fontSize = useBibleStore(state => state.fontSize);
  const setFontSize = useBibleStore(state => state.setFontSize);
  const playbackRate = useBibleStore(state => state.playbackRate);
  const setPlaybackRate = useBibleStore(state => state.setPlaybackRate);
  const textDisplayMode = useBibleStore(state => state.textDisplayMode);
  const setTextDisplayMode = useBibleStore(state => state.setTextDisplayMode);
  const notificationsEnabled = useBibleStore(state => state.notificationsEnabled);
  const notificationIntervalHours = useBibleStore(state => state.notificationIntervalHours);
  const setNotificationsEnabled = useBibleStore(state => state.setNotificationsEnabled);
  const setNotificationIntervalHours = useBibleStore(state => state.setNotificationIntervalHours);

  useEffect(() => {
    getBooks().then(async loadedBooks => {
      const availableBooks = loadedBooks;
      setBooks(availableBooks);
      const statuses = await Promise.all(
        availableBooks.map(
          async book => [book, (await getBookAudioStatus(book)).isComplete] as const,
        ),
      );
      setCompletedBooks(Object.fromEntries(statuses));
    });
  }, []);

  const refreshBookStatus = async (bookName: string) => {
    const status = await getBookAudioStatus(bookName);
    setCompletedBooks(current => ({ ...current, [bookName]: status.isComplete }));
  };

  const handleDownload = async () => {
    if (isDownloading) {
      setIsStopping(true);
      downloadController.current?.abort();
      return;
    }
    if (!downloadBook) return;
    setDownloadError(null);
    if (downloadProgress >= 1) setDownloadProgress(0);
    setIsDownloading(true);
    const controller = new AbortController();
    downloadController.current = controller;
    try {
      await downloadBookAudio(downloadBook, setDownloadProgress, controller.signal);
      await refreshBookStatus(downloadBook);
    } catch (error) {
      if (!controller.signal.aborted) {
        setDownloadError(error instanceof Error ? error.message : "دانلود صوت انجام نشد");
      }
    } finally {
      if (downloadController.current === controller) downloadController.current = null;
      setIsDownloading(false);
      setIsStopping(false);
    }
  };

  const handleDelete = async () => {
    if (!downloadBook || isDownloading || isDeleting) return;
    setDownloadError(null);
    setIsDeleting(true);
    try {
      await deleteBookAudio(downloadBook);
      setDownloadProgress(0);
      await refreshBookStatus(downloadBook);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "حذف فایل‌های صوتی انجام نشد");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollArea dir="rtl" h="85vh">
      <Stack spacing="md" p="md">
        <Group position="apart" noWrap>
          <Button
            variant="light"
            leftIcon={<IconArrowRight size={16} />}
            onClick={() =>
              navigate(`/${activeBook}/${activeChapter}/${activeVerse}`, { replace: true })
            }
          >
            بازگشت به مطالعه
          </Button>
          <Title order={3}>تنظیمات</Title>
        </Group>

        <Divider
          label={
            <Text size="sm" fw={500}>
              اندازه فونت
            </Text>
          }
          labelPosition="center"
        />

        <SegmentedControl
          fullWidth
          value={String(fontSize)}
          onChange={value => setFontSize(Number(value))}
          data={[
            { label: "کوچک", value: "14" },
            { label: "متوسط", value: "16" },
            { label: "بزرگ", value: "18" },
          ]}
        />

        <Divider
          label={
            <Text size="sm" fw={500}>
              نمایش متن آیات
            </Text>
          }
          labelPosition="center"
        />

        <SegmentedControl
          fullWidth
          value={textDisplayMode}
          onChange={value => setTextDisplayMode(value as typeof textDisplayMode)}
          data={[
            { label: "اصل متن", value: "original" },
            { label: "ترجمه", value: "translation" },
            { label: "اصل متن و ترجمه", value: "both" },
          ]}
        />

        <Select
          label="سرعت پخش صوت"
          data={[
            { label: "1x", value: "1" },
            { label: "1.25x", value: "1.25" },
            { label: "1.5x", value: "1.5" },
            { label: "1.75x", value: "1.75" },
            { label: "2x", value: "2" },
          ]}
          value={String(playbackRate)}
          onChange={value => {
            if (value) setPlaybackRate(Number(value));
          }}
        />

        <Divider
          label={
            <Text size="sm" fw={500}>
              دانلود آفلاین صوت
            </Text>
          }
          labelPosition="center"
        />

        <Text size="sm" color="dimmed">
          یک کتاب را انتخاب کنید تا همه فصل‌های آن برای پخش بدون اینترنت ذخیره شود.
        </Text>

        <Select
          label="کتاب"
          placeholder="انتخاب کتاب"
          searchable
          data={books.map(book => ({
            value: book,
            label: completedBooks[book] ? `✓ ${book}` : book,
          }))}
          value={downloadBook}
          onChange={setDownloadBook}
          disabled={isDownloading}
        />

        <Group grow>
          <Button
            onClick={handleDownload}
            loading={isStopping}
            disabled={!downloadBook || isStopping || isDeleting}
          >
            {isDownloading
              ? "توقف دانلود"
              : downloadProgress > 0 && downloadProgress < 1
                ? "ادامه دانلود"
                : "دانلود کامل کتاب"}
          </Button>
          <Button
            color="red"
            variant="light"
            leftIcon={<IconTrash size={16} />}
            onClick={handleDelete}
            loading={isDeleting}
            disabled={!downloadBook || isDownloading || isStopping}
          >
            حذف فایل‌ها
          </Button>
        </Group>

        {(isDownloading || downloadProgress > 0) && (
          <Stack spacing={4}>
            <Progress value={downloadProgress * 100} size="sm" />
            <Text size="xs" color="dimmed" align="center">
              {Math.round(downloadProgress * 100)}٪
            </Text>
          </Stack>
        )}

        {downloadError && (
          <Text size="sm" color="red">
            {downloadError}
          </Text>
        )}

        <Divider
          label={
            <Text size="sm" fw={500}>
              یادآوری آیه
            </Text>
          }
          labelPosition="center"
        />

        <Switch
          label="ارسال نوتیفیکیشن آیه تصادفی"
          checked={notificationsEnabled}
          onChange={event => {
            setNotificationsEnabled(event.currentTarget.checked);
          }}
        />

        <NumberInput
          label="فاصله ارسال (ساعت)"
          description="از زمان فعال‌سازی، هر چند ساعت یک آیه ارسال شود"
          min={1}
          max={168}
          step={1}
          value={notificationIntervalHours}
          onChange={value => {
            if (typeof value === "number") setNotificationIntervalHours(value);
          }}
          disabled={!notificationsEnabled}
        />

        <Divider
          label={
            <Text size="sm" fw={500}>
              محتوای کپی آیات
            </Text>
          }
          labelPosition="center"
        />

        <Text size="sm" color="dimmed">
          مشخص کنید هنگام کپی آیات، کدام بخش‌ها در متن کپی‌شده قرار بگیرند.
        </Text>

        <Checkbox
          label="اصل متن"
          description="متن اصلی آیه به زبان عبری یا عربی"
          checked={copyIncludeOriginalText}
          onChange={event => setCopyIncludeOriginalText(event.currentTarget.checked)}
        />

        <Checkbox
          label="آوانویسی اصل متن"
          description="نحوه تلفظ و خواندن اصل متن"
          checked={copyIncludeTransliteration}
          onChange={event => setCopyIncludeTransliteration(event.currentTarget.checked)}
        />

        <Checkbox
          label="ترجمه"
          description="ترجمه فارسی آیه"
          checked={copyIncludeTranslation}
          onChange={event => setCopyIncludeTranslation(event.currentTarget.checked)}
        />
      </Stack>
    </ScrollArea>
  );
}
