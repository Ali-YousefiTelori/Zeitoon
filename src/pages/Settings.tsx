import { Checkbox, Divider, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useBibleStore } from "../store";

export function Settings() {
  const copyIncludeOriginalText = useBibleStore(state => state.copyIncludeOriginalText);
  const copyIncludeTransliteration = useBibleStore(state => state.copyIncludeTransliteration);
  const copyIncludeTranslation = useBibleStore(state => state.copyIncludeTranslation);
  const setCopyIncludeOriginalText = useBibleStore(state => state.setCopyIncludeOriginalText);
  const setCopyIncludeTransliteration = useBibleStore(state => state.setCopyIncludeTransliteration);
  const setCopyIncludeTranslation = useBibleStore(state => state.setCopyIncludeTranslation);

  return (
    <ScrollArea dir="rtl" h="85vh">
      <Stack spacing="md" p="md">
        <Title order={3}>تنظیمات</Title>

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
