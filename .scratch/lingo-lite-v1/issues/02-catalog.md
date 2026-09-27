# 02 Catalog draft and review

Status: done
Blocked by: none

## What
Author the Catalog: about 300 Expressions across the 12 Topics in the spec.

- One source file in the repo (e.g. `catalog/catalog.yaml`) with fields `id`, `topic`, `romanization`, `hangul`, `english`, `usageNote?`, `order`.
- Romanization is pronunciation-first with syllable hyphens (ADR 0001). Politeness is *-yo*, or *-mnida* for set phrases, never casual.
- Numbers: Sino-Korean and native Korean systems, with Usage notes explaining when each is used.
- Catalog order: ordered by usefulness and interleaved across Topics. No Batch of 15 has more than 3 Numbers Expressions.
- Verification: a second, independent model checks every Expression for naturalness, politeness and Romanization. Disagreements go to `catalog/review-flags.md` for the user to decide.
- Generate a readable per-Topic markdown table (`catalog/REVIEW.md`) for the user to review.
- Add a validation script and test: unique ids, required fields, valid Topic, contiguous `order`, the Numbers-per-Batch constraint.

## Done when
- The user has reviewed the tables and resolved the flags, and the Catalog is marked final.

## Comments

- 2026-09-26: Draft done: 241 Expressions in 12 Topics (`catalog/catalog.ts`).
  - Deviation from the spec: there is no hand-written `order` field. Each Expression has a `tier` (1–3), and the Catalog order is derived from it (`src/catalog/order.ts`): round-robin across Topics per tier, with Numbers spread evenly (at most 3 per Batch; in practice 2).
  - `npm run catalog:check` validates the Catalog and prints the Batches.
  - `npm run catalog:review` writes `catalog/REVIEW.md`.
  - Romanization uses RR letter values spelled by pronunciation; see the conventions in the file header and ADR 0001.
  - Independent model review goes to `catalog/review-flags.md`.
- 2026-09-27: Final. The user reviewed it in the Voice Lab and rejected the five suggested corrections, and made no additions or cuts, so the Catalog content is unchanged at 241 Expressions. The existing cross-word sound-change rule is now written down in the Catalog header and ADR 0001.
