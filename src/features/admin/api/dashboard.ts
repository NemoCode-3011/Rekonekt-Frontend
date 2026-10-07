import { http } from "../../../services/api/client";
import type {
  CreateArtifactInput,
  CreateEventInput,
  CreateExhibitionInput,
  CreatePersonInput,
  CreatePlaceInput,
  CreateStoryInput,
  DashboardArtifact,
  DashboardEvent,
  DashboardExhibitionsResponse,
  DashboardPerson,
  DashboardPlace,
  DashboardSection,
  DashboardStory,
} from "../types/dashboard";

async function getData<T>(path: string) {
  const response = await http.get<{ message: string; data: T }>(path);
  return response.data.data;
}

export const getAdminExhibitions = () =>
  getData<DashboardExhibitionsResponse>("/exhibitions/admin");

export const getAdminEvents = () =>
  getData<DashboardEvent[]>("/events/admin");

export const getAdminPeople = () =>
  getData<DashboardPerson[]>("/people/admin");

export const getAdminPlaces = () =>
  getData<DashboardPlace[]>("/places/admin");

export const getAdminArtifacts = () =>
  getData<DashboardArtifact[]>("/artifacts/admin");

export const getAdminStories = () =>
  getData<DashboardStory[]>("/stories/admin");

export const getAdminSections = (exhibitionId: number) =>
  getData<DashboardSection[]>(
    `/sections/admin/exhibitions/${exhibitionId}`,
  );

export const createExhibition = (input: CreateExhibitionInput) =>
  http.post("/exhibitions", input);

export const createEvent = (input: CreateEventInput) =>
  http.post("/events", input);

export const createPerson = (input: CreatePersonInput) =>
  http.post("/people", input);

export const createPlace = (input: CreatePlaceInput) =>
  http.post("/places", input);

export const createArtifact = (input: CreateArtifactInput) =>
  http.post("/artifacts", input);

export const createStory = (input: CreateStoryInput) =>
  http.post("/stories", input);
