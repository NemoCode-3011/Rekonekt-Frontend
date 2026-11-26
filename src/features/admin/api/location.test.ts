import { describe, expect, it } from "vitest";
import { parseLocation } from "./location";

describe("parseLocation", () => {
  it("parses typed coordinates", () => {
    expect(parseLocation("6.3350, 5.6037")).toEqual({
      latitude: 6.335,
      longitude: 5.6037,
    });
  });

  it("parses coordinates from a Google Maps URL", () => {
    expect(
      parseLocation("https://www.google.com/maps/@6.3350,5.6037,15z"),
    ).toEqual({ latitude: 6.335, longitude: 5.6037 });
  });

  it("keeps the specific error for coordinates outside valid ranges", () => {
    expect(() => parseLocation("91, 20")).toThrow(
      "Enter valid latitude and longitude coordinates.",
    );
  });

  it("explains that short Google Maps links must be opened first", () => {
    expect(() => parseLocation("https://maps.app.goo.gl/example")).toThrow(
      "open the link first and copy the address from the browser.",
    );
  });

  it("returns null for an empty value", () => {
    expect(parseLocation("  ")).toBeNull();
  });
});
