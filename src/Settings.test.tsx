import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { Settings } from "./pages/Settings";
import { useBibleStore } from "./store";

beforeEach(() => {
  useBibleStore.setState({ fontSize: 16 });
});

describe("font size setting", () => {
  test("updates the selected font size", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "بزرگ" }));

    expect(useBibleStore.getState().fontSize).toBe(18);
  });

  test("returns to the current passage", () => {
    useBibleStore.setState({
      activeBook: "پیدایش",
      activeChapter: 1,
      activeVerse: 1,
    });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "بازگشت به مطالعه" })).toBeInTheDocument();
  });
});