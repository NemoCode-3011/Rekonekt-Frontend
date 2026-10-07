import { http } from "../../services/api/client";

export interface Note {
  id: number;
  title: string | null;
  content: string;
  note_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  noteDate?: string; // YYYY-MM-DD
}

// Every backend reply looks like { message, data }.
export async function getNotes() {
  const res = await http.get<{ message: string; data: Note[] }>("/notes");
  return res.data.data;
}

export async function createNote(input: NoteInput) {
  const res = await http.post<{ message: string; data: Note }>("/notes", input);
  return res.data.data;
}

export async function updateNote(id: number, input: Partial<NoteInput>) {
  const res = await http.patch<{ message: string; data: Note }>(
    `/notes/${id}`,
    input,
  );
  return res.data.data;
}

export function deleteNote(id: number) {
  return http.delete(`/notes/${id}`);
}