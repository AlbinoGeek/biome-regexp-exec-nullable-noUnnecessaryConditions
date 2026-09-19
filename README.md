# noUnnecessaryConditions vs RegExp.exec()'s nullable return, Biome 2.5.14

Duplicate of [biomejs/biome#11278](https://github.com/biomejs/biome/issues/11278). Not filed as a new issue; see `ISSUE.md` for the comment drafted for that thread.

`suspicious/noUnnecessaryConditions` treats `RegExp.prototype.exec()`'s result as guaranteed non-nullish. It is typed `RegExpExecArray | null`.

```sh
npm install
./node_modules/.bin/biome lint src/repro.ts
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

Applying the suggested fix (`?.` -> `.`) to `bearerToken`, shown already applied in `src/repro-fixed.ts`:

```sh
./node_modules/.bin/biome lint src/repro-fixed.ts   # clean, 0 errors
./node_modules/.bin/tsc                             # fails
```

```
src/repro-fixed.ts(7,9): error TS18047: 'match' is possibly 'null'.
```

So the safe form (`match?.[1]`) is flagged, Biome's own fix for it produces a real `tsc` error, and the type-correct guard (`if (!match) return null;`) is separately flagged as always-falsy. There is no form that satisfies both Biome and `tsc`.

Versions: `@biomejs/biome` 2.5.14 (current on npm, and BoundMCP's own pinned `^2.5.14`), `typescript` 7.0.2, Node 24.18.0.

`src/repro.ts` covers state 1 (flagged) and state 3 (guard flagged). `src/repro-fixed.ts` covers state 2 (the suggested fix, and its `tsc` error).
