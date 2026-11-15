export function parseCoordinates(value: string) {
  const match = value.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/,
  );

  if (!match) {
    throw new Error(
      "Enter coordinates like 6.3350, 5.6037 (copy them from Google Maps).",
    );
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Enter valid latitude and longitude coordinates.");
  }

  return { latitude, longitude };
}
