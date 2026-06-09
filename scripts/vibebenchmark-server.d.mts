export interface VibeBenchmarkServer {
  readonly port: number;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
}

export function signSessionCookie(
  session: { githubId: number; githubLogin: string; name: string },
  secret: string,
): string;

export function createVibeBenchmarkServer(input?: {
  basePath?: string;
  publicBaseUrl?: string;
  sessionSecret?: string;
  dataDir?: string;
  githubClientId?: string;
  githubClientSecret?: string;
}): VibeBenchmarkServer;
