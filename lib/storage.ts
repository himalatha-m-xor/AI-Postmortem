// Simple in-memory storage for postmortems
// Uses global to persist across hot reloads in development

import { Postmortem } from '@/types/postmortem';

interface GlobalStorage {
  postmortems: Map<string, Postmortem>;
}

declare global {
  var __postmortemStorage: GlobalStorage | undefined;
}

// Initialize global storage if it doesn't exist
if (!global.__postmortemStorage) {
  global.__postmortemStorage = {
    postmortems: new Map(),
  };
}

export const storage = global.__postmortemStorage;

// Storage functions
export function savePostmortem(postmortem: Postmortem): void {
  storage.postmortems.set(postmortem.id, postmortem);
}

export function getPostmortem(id: string): Postmortem | undefined {
  return storage.postmortems.get(id);
}

export function getAllPostmortems(): Postmortem[] {
  return Array.from(storage.postmortems.values());
}

export function deletePostmortem(id: string): boolean {
  return storage.postmortems.delete(id);
}

export function clearAllPostmortems(): void {
  storage.postmortems.clear();
}
