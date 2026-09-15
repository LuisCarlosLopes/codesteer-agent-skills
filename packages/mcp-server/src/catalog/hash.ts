import { createHash, timingSafeEqual } from 'node:crypto';

// @MindContext: Checksum SHA-256 alinhado ao compileCatalog, comparado de forma timing-safe
// @MindDecision: Duplicar createHash localmente em vez de exportar sha256Hex do compilador
// @MindRisk: Hash mismatch nunca deve incluir o corpo do arquivo na mensagem ou no retorno

export function sha256Hex(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function hashesMatch(actual: string, expected: string): boolean {
  const actualBuf = Buffer.from(actual, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(actualBuf, expectedBuf);
}

export function revisionHashFromContentHashes(contentHashes: string[]): string {
  const ordered = [...contentHashes].sort((a, b) => a.localeCompare(b));
  return sha256Hex(ordered.join(''));
}
