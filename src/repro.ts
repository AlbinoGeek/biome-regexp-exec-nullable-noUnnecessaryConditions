const BEARER_HEADER = /^Bearer\s+(.+)$/i;

// State 1: optional chaining on a nullable RegExp.exec() result.
// Biome's own suggested fix (`?.` -> `.`) is `repro-fixed.ts`, which fails tsc.
export function bearerToken(header: string): string | null {
	const match = BEARER_HEADER.exec(header);
	return match?.[1] ?? null;
}

// State 3: the type-correct alternative to optional chaining, an explicit
// null guard. Biome flags this guard's condition as always falsy.
export function bearerTokenGuarded(header: string): string | null {
	const match = BEARER_HEADER.exec(header);
	if (!match) {
		return null;
	}
	return match[1] ?? null;
}
