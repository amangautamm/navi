import * as fs from 'fs';
import * as path from 'path';

export function createDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  createDir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

export function createDirStructure(base: string, structure: Record<string, any>): void {
  for (const [key, value] of Object.entries(structure)) {
    const fullPath = path.join(base, key);
    if (typeof value === 'string') {
      writeFile(fullPath, value);
    } else if (typeof value === 'object' && value !== null) {
      createDir(fullPath);
      createDirStructure(fullPath, value);
    }
  }
}
