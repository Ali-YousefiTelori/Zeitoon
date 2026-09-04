import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { Settings } from "./pages/Settings";
import { useBibleStore } from "./store";

beforeEach(() => {
  useBibleStore.setState({ fontSize: 16 });
});

describe("font size setting", () => {
  test("updates the selected font size", () => {
    render(<Settings />);

    fireEvent.click(screen.getByRole("radio", { name: "بزرگ" }));

    expect(useBibleStore.getState().fontSize).toBe(18);
  });
});