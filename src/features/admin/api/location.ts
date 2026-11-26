import { parseCoordinates } from "./coordinates";

const GOOGLE_MAPS_HINT =
  "Paste coordinates like 6.3350, 5.6037, or a full Google Maps link. Short links (maps.app.goo.gl) can't be read: open the link first and copy the address from the browser.";

/** Parse typed coordinates or coordinates copied from a Google Maps URL. */
export function parseLocation(value: string) {
  const text = value.trim();
  if (!text) return null;

  const fromLink =
    text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ??
    text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) ??
    text.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i);

  if (fromLink) {
    // Keep the specific out-of-range error from parseCoordinates.
    return parseCoordinates(`${fromLink[1]}, ${fromLink[2]}`);
  }

  try {
    return parseCoordinates(text);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Enter valid latitude and longitude coordinates."
    ) {
      throw error;
    }

    throw new Error(GOOGLE_MAPS_HINT, { cause: error });
  }
}
