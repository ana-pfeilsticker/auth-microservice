import * as fs from 'fs';
import * as path from 'path';

export function getKeyPath(fileName: string): string {
  const pathsToTry = [
    path.join(__dirname, '..', '..', 'keys', fileName), // Produção (dist)
    path.join(__dirname, '..', 'keys', fileName), // Desenvolvimento (src)
    path.join(process.cwd(), 'keys', fileName), // Raiz do projeto
  ];

  for (const keyPath of pathsToTry) {
    if (fs.existsSync(keyPath)) {
      return keyPath;
    }
  }

  throw new Error(`Chave não encontrada: ${fileName}`);
}
