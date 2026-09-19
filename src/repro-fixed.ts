const BEARER_HEADER = /^Bearer\s+(.+)$/i;

// State 2: Biome's suggested fix for src/repro.ts's bearerToken, applied.
// `match` is typed `RegExpExecArray | null`, so this is a real TS18047.
export function bearerToken(header: string): string | null {
	const match = BEARER_HEADER.exec(header);
	return match[1] ?? null;
}
