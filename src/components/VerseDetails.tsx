import { Text, Title, rem, useMantineTheme } from "@mantine/core";
import { IconDotsCircleHorizontal } from "@tabler/icons-react";

import type { TextDisplayMode } from "../store";

export const VerseDetails = ({
  originalText,
  transliteration,
  activeBookFromParams,
  verse,
  textDisplayMode = "both",
  showMoreInformationIcon = false,
}: {
  originalText: string;
  transliteration: string;
  activeBookFromParams: string | undefined;
  verse: string;
  textDisplayMode: TextDisplayMode;
  showMoreInformationIcon: boolean;
}) => {
  const theme = useMantineTheme();
  const originalKeys = originalText.split(" ");
  const transliterationKeys = transliteration.split(" ");

  return (
    <>
      {(textDisplayMode === "original" || textDisplayMode === "both") &&
        (activeBookFromParams === "قرآن" ? (
          <Title order={3} fz={rem(18)} fw={500} mb={rem(10)} ff={"Uthmani"}>
            {originalText}
          </Title>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: rem(10),
              width: "100%",
            }}
          >
            {originalKeys.map((item, i) => (
              <div
                key={i}
                style={{
                  marginLeft: rem(3),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: rem(18),
                    height: rem(20),
                  }}
                >
                  {item}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: rem(13),
                    height: rem(13),
                    color:
                      theme.colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.gray[7],
                  }}
                >
                  {transliterationKeys[i]}
                </span>
              </div>
            ))}
          </div>
        ))}
      {(textDisplayMode === "translation" || textDisplayMode === "both") && (
        <Text fz="md" fw="normal" ml={3}>
          {verse}
          {showMoreInformationIcon && <IconDotsCircleHorizontal height={"1em"} width={"1em"} />}
        </Text>
      )}
    </>
  );
};
