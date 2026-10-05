import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export class PromptNotesDB extends Dexie {
  notes!: EntityTable<Note, "id">;

  constructor() {
    super("prompt-notes-db");
    this.version(1).stores({
      notes: "id, updatedAt, *tags",
    });
  }
}

export const db = new PromptNotesDB();
