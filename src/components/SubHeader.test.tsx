import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SubHeader from "./SubHeader";

describe("reading page title", () => {
  test("shows the current chapter and total chapters", async () => {
    render(
      <MemoryRouter initialEntries={["/پیدایش/1/1"]}>
        <Routes>
          <Route path="/:activeBook/:activeChapter/:activeVerse" element={<SubHeader />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("پیدایش 1/50"));
  });
});