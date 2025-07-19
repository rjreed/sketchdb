//// LIBRARIES

/// node/core libs
import { randomUUID } from 'crypto';
import { promises as fsp } from 'fs';

//// APP
export function gen_uid() {
  return randomUUID();
}

export function delete_directory(dirPath) {
  return fsp.rm(dirPath, { recursive: true, force: true });
}

export async function path_exists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}
