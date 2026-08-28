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
  Title,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBook,
  IconCheck,
  IconFolders,
  IconMoonStars,
  IconSettings,
  IconSettings2,
  IconSun,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Icon from "../assets/icon.png";
import { useBibleStore } from "../store";

const useStyles = createStyles(theme => ({
  icons: { color: theme.colors.gray[6] },
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
  const showOriginalTextSetting = useBibleStore(state => state.showOriginalTextSetting);
  const setShowOriginalTextSetting = useBibleStore(state => state.setShowOriginalTextSetting);

  return (
    <Header height={56}>
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
        </Flex>
        <Group position="center" my={30}>
          <Menu width={200} shadow="md">
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
                onClick={event => {
                  event.preventDefault();
                  setShowOriginalTextSetting(!showOriginalTextSetting);
                }}
                icon={
                  <Switch
                    checked={showOriginalTextSetting}
                    onChange={event => {
                      event.preventDefault();
                      setShowOriginalTextSetting(!showOriginalTextSetting);
                    }}
                    size="lg"
                    onLabel={<IconCheck color={theme.white} size="1.25rem" stroke={1.5} />}
                    offLabel={<IconX color={theme.colors.gray[6]} size="1.25rem" stroke={1.5} />}
                  />
                }
              >
                اصل متن
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
              {/* <Menu.Item onClick={() => navigate('/content')} icon={<IconQuestionMark className={classes.icons}/>}>
                جست و جو در سوالات
              </Menu.Item> */}
              <Menu.Item
                onClick={() => navigate("/about")}
                icon={<IconBook className={classes.icons} />}
              >
                مبانی ایمان
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Center>
    </Header>
  );
};

export default MyHeader;
