DRAFT — NOMAD reviews before posting. Not filed. Target: comment on existing issue
<https://github.com/biomejs/biome/issues/11278>, not a new issue.

Reasoning: #11278 already reports the same root cause (`suspicious/noUnnecessaryConditions`
treating `RegExp.prototype.exec()`'s `RegExpExecArray | null` return as non-nullable) and is
open. This adds two things #11278 does not cover: the suggested fix produces a real `tsc`
error, and the type-correct alternative (a null guard) gets a second, different false
positive from the same rule. Also: on current 2.5.14 the bug now reproduces on a plain
regex literal held in a `const` (`BEARER_HEADER.exec(...)`), not only on `new RegExp(...)`
as #11278's report described on 2.5.7 — worth a maintainer's attention on whether that
literal/constructor distinction from the original report still holds.

---

This also reproduces on `@biomejs/biome` 2.5.14 (current npm release), and it gets worse:
following the rule's own suggested fix breaks the typechecker, and the type-correct
alternative to the fix gets a second, different false positive from the same rule.

Repro (`match` here is a `const` holding a regex literal, not `new RegExp(...)`):

```ts
const BEARER_HEADER = /^Bearer\s+(.+)$/i;

export function bearerToken(header: string): string | null {
 const match = BEARER_HEADER.exec(header);
 return match?.[1] ?? null;
}

export function bearerTokenGuarded(header: string): string | null {
 const match = BEARER_HEADER.exec(header);
 if (!match) {
  return null;
 }
 return match[1] ?? null;
}
```

```
src/repro.ts:7:9 lint/suspicious/noUnnecessaryConditions
  × Unnecessary optional chaining.
    7 │  return match?.[1] ?? null;
  i Replace ?. with ..
  i The receiver is guaranteed to be non-nullish.

src/repro.ts:14:6 lint/suspicious/noUnnecessaryConditions
  × This condition is always falsy.
   14 │  if (!match) {
  i The value's type can never be truthy, so this check is redundant.

Found 2 errors.
```

Applying the suggested fix (`?.[1]` -> `[1]`) to `bearerToken`:

```ts
export function bearerToken(header: string): string | null {
 const match = BEARER_HEADER.exec(header);
 return match[1] ?? null;
}
```

`biome lint` now reports 0 errors on this function, but `tsc` fails:

```
src/repro-fixed.ts(7,9): error TS18047: 'match' is possibly 'null'.
```

So on this rule as it stands, none of the three forms satisfies both tools:

1. `match?.[1]` — the type-correct form — flagged as an unnecessary condition.
2. `match[1]`, Biome's own suggested fix for (1) — passes Biome, fails `tsc` with TS18047.
3. `if (!match) return null;`, the type-correct guard alternative to (1) — flagged as
   always falsy.

Versions: `@biomejs/biome` 2.5.14, `typescript` 7.0.2, Node 24.18.0, Linux x86_64.

Full repro, both files and commands:
<https://github.com/AlbinoGeek/biome-regexp-exec-nullable-noUnnecessaryConditions>
