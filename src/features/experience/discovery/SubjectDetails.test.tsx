// @vitest-environment jsdom

import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ExperiencePerson } from "../types";
import type { DiscoverySubject } from "./types";

vi.mock("../useConnections", () => ({
  useArtifactMedia: () => ({ items: [] }),
  useArtifactSources: () => ({ items: [], status: "ready" }),
  useEventSources: () => ({ items: [], status: "ready" }),
  usePersonMedia: () => ({ items: [] }),
  usePersonSources: () => ({ items: [], status: "ready" }),
  usePlaceMedia: () => ({ items: [] }),
  usePlaceSources: () => ({ items: [], status: "ready" }),
}));

import SubjectDetails from "./SubjectDetails";

const person: ExperiencePerson = {
  id: 1,
  name: "Ada Example",
  slug: "ada-example",
  description: "A short introduction.\n\nThe rest of the full story.",
  birth_date: null,
  death_date: null,
};

function SidebarHarness() {
  const [open, setOpen] = useState(true);
  const subject: DiscoverySubject = { kind: "person", person };

  return (
    <>
      {open && (
        <div role="dialog">
          <SubjectDetails subject={subject} onClose={() => setOpen(false)} />
        </div>
      )}
      <Routes>
        <Route path="/explore/people" element={<p>People list</p>} />
        <Route path="/people/:slug" element={<h1>Full person story</h1>} />
      </Routes>
    </>
  );
}

describe("person details drawer navigation", () => {
  afterEach(cleanup);

  it("closes the drawer when opening the full person story", () => {
    render(
      <MemoryRouter initialEntries={["/explore/people"]}>
        <SidebarHarness />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("link", { name: /Read their full story/ }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Full person story" }),
    ).toBeInTheDocument();
  });
});
