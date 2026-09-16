import {
  ActionIcon,
  Burger,
  Center,
  ColorScheme,
  Flex,
  Group,
  Header,
  Image,
  MediaQuery,
  Menu,
  Switch,
  Text,
  Title,
  UnstyledButton,
  createStyles,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBooks,
  IconChevronDown,
  IconFolders,
  IconInfoCircle,
  IconMoonStars,
  IconSettings,
  IconSettings2,
  IconSun,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Icon from "../assets/icon.png";
import { useBibleStore } from "../store";

const useStyles = createStyles(theme => ({
  icons: { color: theme.colors.gray[6] },
  readingButton: {
    maxWidth: rem(220),
    padding: "4px 8px",
    borderRadius: theme.radius.sm,
    display: "flex",
    alignItems: "center",
    gap: 4,
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
    },
  },
}));

const MyHeader = ({
  colorScheme,
  toggleColorScheme,
  opened,
  setOpened,
}: {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const readings = useBibleStore(state => state.readings);
  const activeReadingId = useBibleStore(state => state.activeReadingId);
  const continueReading = useBibleStore(state => state.continueReading);
  const activeReading = readings.find(reading => reading.id === activeReadingId);

  return (
    <Header height={56} sx={{ overflow: "visible", zIndex: 200 }}>
      <Center h={56} px={10} mx="auto" sx={{ display: "flex", justifyContent: "space-between" }}>
        <Flex sx={{ justifyContent: "start", alignItems: "center" }}>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => setOpened(!opened)}
              size="sm"
              color={theme.colors.gray[6]}
              ml="xs"
            />
          </MediaQuery>
          <Title
            order={3}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              height={30}
              width="auto"
              fit="contain"
              radius="md"
              src={Icon}
              alt="Logo"
              children
            />
            زیتون
          </Title>
          <Menu withinPortal zIndex={400} shadow="md" width={260} position="bottom-start">
            <Menu.Target>
              <UnstyledButton className={classes.readingButton} mr="sm">
                <Text size="sm" lineClamp={1} dir="rtl">
                  {activeReading ? activeReading.name : "خوانش"}
                </Text>
                <IconChevronDown size={14} color={theme.colors.gray[6]} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown dir="rtl">
              {readings.length ? (
                readings.map(reading => (
                  <Menu.Item
                    key={reading.id}
                    onClick={() => {
                      continueReading(reading.id);
                      navigate(`/${reading.bookName}/${reading.chapter}/${reading.verse}`, {
                        replace: true,
                      });
                    }}
                  >
                    <Text size="sm" fw={reading.id === activeReadingId ? 700 : 400}>
                      {reading.name}
                      {reading.id === activeReadingId ? " (جاری)" : ""}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {reading.hasProgress
                        ? `${reading.bookName}، باب ${reading.chapter}`
                        : reading.bookName}
                    </Text>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>هنوز خوانشی وجود ندارد</Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item onClick={() => navigate("/readings")}>مدیریت خوانش‌ها</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
        <Group position="center" my={30}>
          <Menu withinPortal zIndex={400} width={200} shadow="md">
            <Menu.Target>
              <ActionIcon variant="transparent" style={{ color: theme.colors.gray[6] }}>
                <IconSettings2 />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={toggleColorScheme}
                icon={
                  <Switch
                    checked={colorScheme === "dark"}
                    onChange={toggleColorScheme}
                    size="lg"
                    onLabel={<IconSun color={theme.white} size="1.25rem" stroke={1.5} />}
                    offLabel={
                      <IconMoonStars color={theme.colors.gray[6]} size="1.25rem" stroke={1.5} />
                    }
                  />
                }
              >
                حالت شب
              </Menu.Item>

              <Menu.Item
                onClick={() => navigate("/readings")}
                icon={<IconBooks className={classes.icons} />}
              >
                خوانش‌ها
              </Menu.Item>

              <Menu.Item
                onClick={() => navigate("/settings")}
                icon={<IconSettings className={classes.icons} />}
              >
                تنظیمات
              </Menu.Item>

              <Menu.Item
                onClick={() => navigate("/saved")}
                icon={<IconFolders className={classes.icons} />}
              >
                آیات ذخیره شده
              </Menu.Item>
              <Menu.Item
                onClick={() => navigate("/about")}
                icon={<IconInfoCircle className={classes.icons} />}
              >
                درباره ما
              </Menu.Item>
              {/* <Menu.Item onClick={() => navigate('/content')} icon={<IconQuestionMark className={classes.icons}/>}>
                جست و جو در سوالات
              </Menu.Item> */}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Center>
    </Header>
  );
};

export default MyHeader;
