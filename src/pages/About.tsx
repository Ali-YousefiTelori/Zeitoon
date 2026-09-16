import { Anchor, Box, Title } from "@mantine/core";

export function About() {
  return (
    <Box dir="rtl" p="md">
      <Title order={4} mb="md">
        درباره ما
      </Title>
      <Anchor href="https://t.me/+Op9g1ZDE2Tc5Y2Y0" target="_blank" rel="noreferrer">
        گروه تلگرام ما
      </Anchor>
    </Box>
  );
}
