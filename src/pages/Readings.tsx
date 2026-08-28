import { Box, Button, Divider, Modal, NativeSelect, ScrollArea, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMemo, useState } from "react";
import books from "../assets/books.json";
import ReadingItem from "../components/ReadingItem";
import { useBibleStore } from "../store";

export function Readings() {
  const readings = useBibleStore(state => state.readings);
  const activeBook = useBibleStore(state => state.activeBook);
  const addReading = useBibleStore(state => state.addReading);
  const [opened, { open, close }] = useDisclosure(false);
  const [readingName, setReadingName] = useState("");
  const [selectedBook, setSelectedBook] = useState(activeBook);
  const bookOptions = useMemo(() => books.map(item => item.book_name), []);

  const handleOpen = () => {
    setReadingName("");
    setSelectedBook(activeBook);
    open();
  };

  const handleAddReading = () => {
    const trimmedName = readingName.trim();
    if (!trimmedName || !selectedBook) return;

    addReading(trimmedName, selectedBook);
    setReadingName("");
    close();
  };

  return (
    <Box dir="rtl">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} mb="md">
        <Title order={4}>خوانش‌ها</Title>
        <Button onClick={handleOpen}>افزودن خوانش</Button>
      </Box>

      {readings.length ? (
        <ScrollArea h="80vh">
          {readings.map((reading, index) => (
            <Box key={reading.id}>
              <ReadingItem reading={reading} />
              {index < readings.length - 1 ? <Divider my="xs" /> : null}
            </Box>
          ))}
        </ScrollArea>
      ) : (
        <Text color="dimmed" ta="center" mt="xl">
          هنوز خوانشی اضافه نشده است.
        </Text>
      )}

      <Modal opened={opened} onClose={close} title="افزودن خوانش" centered dir="rtl">
        <TextInput
          label="نام خوانش"
          placeholder="مثال: مطالعه پیدایش"
          value={readingName}
          onChange={event => setReadingName(event.currentTarget.value)}
          mb="md"
          dir="rtl"
        />
        <NativeSelect
          label="کتاب"
          description="کتاب بعد از ایجاد قابل تغییر نیست"
          data={bookOptions}
          value={selectedBook}
          onChange={event => setSelectedBook(event.currentTarget.value)}
          mb="lg"
        />
        <Button fullWidth onClick={handleAddReading} disabled={!readingName.trim() || !selectedBook}>
          ذخیره
        </Button>
      </Modal>
    </Box>
  );
}
