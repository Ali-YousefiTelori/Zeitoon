import {
  Checkbox,
  Divider,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { notifyRandomVerse } from "../services/notifications";
import { useBibleStore } from "../store";

export function Settings() {
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);
  const setCopyIncludeOriginalText = useBibleStore(state => state.setCopyIncludeOriginalText);
  const setCopyIncludeTransliteration = useBibleStore(state => state.setCopyIncludeTransliteration);
  const setCopyIncludeTranslation = useBibleStore(state => state.setCopyIncludeTranslation);
  const fontSize = useBibleStore(state => state.fontSize);
  const setFontSize = useBibleStore(state => state.setFontSize);
  const notificationsEnabled = useBibleStore(state => state.notificationsEnabled);
  const notificationIntervalHours = useBibleStore(state => state.notificationIntervalHours);
  const setNotificationsEnabled = useBibleStore(state => state.setNotificationsEnabled);
  const setNotificationIntervalHours = useBibleStore(state => state.setNotificationIntervalHours);

  return (
    <ScrollArea dir="rtl" h="85vh">
      <Stack spacing="md" p="md">
        <Title order={3}>تنظیمات</Title>

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
              یادآوری آیه
            </Text>
          }
          labelPosition="center"
        />

        <Switch
          label="ارسال نوتیفیکیشن آیه تصادفی"
          checked={notificationsEnabled}
          onChange={event => {
            const enabled = event.currentTarget.checked;
            setNotificationsEnabled(enabled);
            if (enabled) void notifyRandomVerse();
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
