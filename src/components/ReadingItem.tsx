import { Box, Button, Group, Menu, Modal, Text, TextInput, Title, createStyles } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReadingSession, useBibleStore } from "../store";

const useStyles = createStyles(theme => ({
  item: {
    cursor: "pointer",
    borderRadius: theme.radius.sm,
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
    },
  },
}));

const ReadingItem = ({ reading }: { reading: ReadingSession }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const continueReading = useBibleStore(state => state.continueReading);
  const renameReading = useBibleStore(state => state.renameReading);
  const deleteReading = useBibleStore(state => state.deleteReading);
  const activeReadingId = useBibleStore(state => state.activeReadingId);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [editedName, setEditedName] = useState(reading.name);

  const subtitle = reading.hasProgress
    ? `${reading.bookName}، باب ${reading.chapter}`
    : reading.bookName;

  const handleContinue = () => {
    continueReading(reading.id);
    navigate(`/${reading.bookName}/${reading.chapter}/${reading.verse}`, { replace: true });
  };

  const handleRename = () => {
    const trimmedName = editedName.trim();
    if (!trimmedName) return;
    renameReading(reading.id, trimmedName);
    closeRename();
  };

  const handleDelete = () => {
    deleteReading(reading.id);
    closeDelete();
  };

  return (
    <>
      <Menu shadow="md" width={200} position="bottom-start">
        <Menu.Target>
          <Box className={classes.item} py={10} px={12} dir="rtl">
            <Title order={5} weight={500}>
              {reading.name}
              {activeReadingId === reading.id ? (
                <Text component="span" size="xs" color="blue" mr={8}>
                  (جاری)
                </Text>
              ) : null}
            </Title>
            <Text size="xs" color="dimmed" mt={4}>
              {subtitle}
            </Text>
          </Box>
        </Menu.Target>

        <Menu.Dropdown dir="rtl">
          <Menu.Item onClick={handleContinue}>برو به خوانش</Menu.Item>
          <Menu.Item
            onClick={() => {
              setEditedName(reading.name);
              openRename();
            }}
          >
            ویرایش نام
          </Menu.Item>
          <Menu.Item color="red" onClick={openDelete}>
            حذف
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={renameOpened} onClose={closeRename} title="ویرایش نام خوانش" centered dir="rtl">
        <TextInput
          label="نام خوانش"
          value={editedName}
          onChange={event => setEditedName(event.currentTarget.value)}
          mb="md"
          dir="rtl"
        />
        <Text size="sm" color="dimmed" mb="lg">
          کتاب: {reading.bookName}
        </Text>
        <Button fullWidth onClick={handleRename} disabled={!editedName.trim()}>
          ذخیره
        </Button>
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title="حذف خوانش" centered dir="rtl">
        <Text size="sm" mb="md">
          آیا از حذف خوانش «{reading.name}» مطمئن هستید؟
        </Text>
        <Group position="left" spacing="sm">
          <Button variant="default" onClick={closeDelete}>
            انصراف
          </Button>
          <Button color="red" onClick={handleDelete}>
            حذف
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default ReadingItem;
