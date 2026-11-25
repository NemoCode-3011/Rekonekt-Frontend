// @vitest-environment jsdom

import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LinksField from "./LinksField";

function Harness({ start = "[]" }: { start?: string }) {
  const [value, setValue] = useState(start);

  return (
    <>
      <LinksField id="links" label="Learn more" value={value} onChange={setValue} />
      <output data-testid="json">{value}</output>
    </>
  );
}

const json = () => JSON.parse(screen.getByTestId("json").textContent ?? "[]");

describe("LinksField", () => {
  // Start every test with an empty page, whatever the test setup does.
  afterEach(cleanup);

  it("starts empty and adds a row", () => {
    render(<Harness />);
    expect(screen.getByText(/No links yet/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add a link" }));
    expect(json()).toEqual([{ label: "", url: "", note: "" }]);
  });

  it("edits a row", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Add a link" }));

    fireEvent.change(screen.getByLabelText("Link 1 name"), {
      target: { value: "Official website" },
    });
    fireEvent.change(screen.getByLabelText("Link 1 web address"), {
      target: { value: "obuduranch.com" },
    });

    expect(json()[0]).toMatchObject({
      label: "Official website",
      url: "obuduranch.com",
    });
  });

  it("moves and removes rows", () => {
    render(
      <Harness
        start={JSON.stringify([
          { label: "A", url: "https://a.com", note: "" },
          { label: "B", url: "https://b.com", note: "" },
        ])}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Move down" })[0]);
    expect(json().map((row: { label: string }) => row.label)).toEqual(["B", "A"]);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(json().map((row: { label: string }) => row.label)).toEqual(["A"]);
  });

  it("stops at 20 links", () => {
    const twenty = Array.from({ length: 20 }, (_, i) => ({
      label: `L${i}`,
      url: `https://e${i}.com`,
      note: "",
    }));
    render(<Harness start={JSON.stringify(twenty)} />);

    expect(
      (screen.getByRole("button", { name: "Add a link" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});