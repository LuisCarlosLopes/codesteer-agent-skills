// @MindContext: Erros tipados das tools MCP — falha de contrato sem vazar corpo de arquivo
// @MindSpec: NotFound | HashMismatch | PathDenied | ExecDenied — mensagem só com path/nome, nunca conteúdo

export class CatalogToolError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class NotFoundError extends CatalogToolError {
  constructor(skillName: string) {
    super('NOT_FOUND', `skill não encontrada: ${skillName}`);
  }
}

export class HashMismatchError extends CatalogToolError {
  constructor(filePath: string) {
    super('HASH_MISMATCH', `hash SHA-256 diverge do manifesto: ${filePath}`);
  }
}

export class PathDeniedError extends CatalogToolError {
  constructor(filePath: string, reason: string) {
    super('PATH_DENIED', `path recusado (${reason}): ${filePath}`);
  }
}

export class ExecDeniedError extends CatalogToolError {
  constructor(skillName: string) {
    super('EXEC_DENIED', `prepare recusado: sandbox.allow_exec é false (${skillName})`);
  }
}
