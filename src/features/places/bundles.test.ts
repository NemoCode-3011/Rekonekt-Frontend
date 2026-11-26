import { describe, expect, it } from "vitest";
import {
  bundleCoverUrl,
  placesInBundle,
  standalonePlaces,
  tilesOf,
} from "./bundles";
import type { PlaceBundle, PlaceBundleMember, PlaceCard } from "./types";

function card(id: number, name: string): PlaceCard {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    summary: null,
    region: null,
    category: null,
    latitude: null,
    longitude: null,
    cover_image_url: null,
    cover_image_alt: null,
    cover_image_credit: null,
  };
}

function member(id: number, cover: string | null = null): PlaceBundleMember {
  return {
    id,
    name: `Place ${id}`,
    slug: `place-${id}`,
    region: null,
    category: null,
    cover_image_url: cover,
    cover_image_alt: null,
  };
}

function bundle(
  slug: string,
  members: PlaceBundleMember[],
  cover: string | null = null,
): PlaceBundle {
  return {
    id: 1,
    title: `Exhibition ${slug}`,
    slug,
    subtitle: null,
    cover_image_url: cover,
    place_count: members.length,
    places: members,
  };
}

const places = [card(1, "Old Market"), card(2, "Palace"), card(3, "Lone Rock")];

describe("exhibition tiles", () => {
  it("only gives a tile to exhibitions with two or more places", () => {
    const big = bundle("big", [member(1), member(2)]);
    const small = bundle("small", [member(3)]);

    expect(tilesOf([big, small])).toEqual([big]);
  });

  it("leaves places inside a tile out of the plain cards", () => {
    const big = bundle("big", [member(1), member(2)]);

    expect(standalonePlaces(places, [big]).map((item) => item.place.id)).toEqual([
      3,
    ]);
  });

  it("keeps a lone exhibition place as a card, labelled with its exhibition", () => {
    const small = bundle("small", [member(3)]);
    const result = standalonePlaces(places, [small]);

    expect(result.map((item) => item.place.id)).toEqual([1, 2, 3]);
    expect(result.find((item) => item.place.id === 3)?.partOf).toBe(
      "Exhibition small",
    );
    expect(result.find((item) => item.place.id === 1)?.partOf).toBeNull();
  });

  it("shows every place as a card when there are no exhibitions", () => {
    expect(standalonePlaces(places, []).map((item) => item.place.id)).toEqual([
      1, 2, 3,
    ]);
  });

  it("lists an exhibition's places in its own order and skips unknown ones", () => {
    const big = bundle("big", [member(2), member(99), member(1)]);

    expect(placesInBundle(big, places).map((place) => place.id)).toEqual([2, 1]);
  });

  it("uses the exhibition cover, else the first place picture, else nothing", () => {
    expect(
      bundleCoverUrl(bundle("a", [member(1, "https://img/p.jpg")], "https://img/e.jpg")),
    ).toBe("https://img/e.jpg");
    expect(
      bundleCoverUrl(bundle("b", [member(1), member(2, "https://img/p2.jpg")])),
    ).toBe("https://img/p2.jpg");
    expect(bundleCoverUrl(bundle("c", [member(1)]))).toBeNull();
  });
});