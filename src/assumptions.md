# Assumptions and Audit Trail

Every judgment below is reversible. No assumption changes the source books themselves.

## A1 — Nested repository paths

- **Ambiguity:** The brief described flat paths /src/01.md, /src/02.md, /src/03.md; the repository stores the files in subdirectories.
- **Assumption:** Use src/01/01.md, src/02/02.md, and src/03/03.md.
- **Reasoning:** All three files exist and parse as readable Markdown with page anchors.
- **Reversibility:** Update the source manifest and rerun if canonical paths change.

## A2 — Page citation source

- **Ambiguity:** Sources contain HTML page anchors and visible page separators; some cross-book printed references do not obviously match anchor numbers.
- **Assumption:** Track the current page using both explicit page-ID anchors and visible page separators of the form {N}----. Cite the page number current at the specific heading or rule text, not the parent section's earlier anchor.
- **Reasoning:** Some headings have an HTML page-ID anchor; others begin after a visible page separator and otherwise inherit an obsolete parent-page number. Combining both marker forms keeps citations page-specific.
- **Reversibility:** If the source is re-exported with explicit page-ID anchors on every page, re-run the page parser against that uniform marker format.

## A3 — Cross-reference pagination

- **Ambiguity:** 03 sometimes refers to 02 using page numbers that do not line up obviously with the extracted 02 anchors.
- **Assumption:** Cite the page anchor in the book actually being discussed; do not guess a pagination offset.
- **Reasoning:** This preserves traceability and avoids fabricated page equivalences.
- **Reversibility:** Add a verified page crosswalk without rewriting the factual extraction.

## A4 — Source bible organization

- **Ambiguity:** The brief allows grouping by book then alphabetically or by entity type.
- **Assumption:** Group by source book in precedence order (01, 02, 03), alphabetically within each book.
- **Reasoning:** This preserves the layered hierarchy and provides predictable lookup.
- **Reversibility:** Re-sort by type; the records and citations remain unchanged.

## A5 — Headings and table entries

- **Ambiguity:** Some named entities/procedures are headings; others appear as bold labels in equipment tables, encounter tables, mounts/boats, or city keys.
- **Assumption:** Index all gameable headings and add explicit table entries for major gear, transport, factions, cities, regions, and notable named sites. Represent repetitive random table outcomes under their parent table unless an outcome is itself an independent named entity.
- **Reasoning:** This produces a usable index without turning every generated rumor or generic row into a separate setting entity.
- **Reversibility:** Expand extraction to individual rows of a selected table family.

## A6 — Fact-boundary tags

- **Ambiguity:** The sources do not label every option as immutable or adaptable.
- **Assumption:** Core 01 resolution/action/resource procedures are immutable; narrative identity, creatures, items, factions and player options are adaptable; deliberate undefined areas are open; use override only where 03 expressly selects an alternate rule; reserve conflicted for unresolved source disagreement.
- **Reasoning:** Tags describe downstream design freedom; they are not additional game rules.
- **Reversibility:** Relabel individual rows without changing source facts or citations.

## A7 — Reaches hex crawl precedence

- **Ambiguity:** 01's core overland cadence differs from 02's Reaches hex-crawl procedure.
- **Assumption:** Mark 02's Reaches travel procedure as an override for campaigns using the Western Reaches, because 03 expressly selects the alternate procedure. Keep 01 as baseline outside the setting.
- **Reasoning:** The GM-facing merge rule establishes precedence. This is not an unresolved contradiction. (01, pp. 93–94; 02, pp. 225–231; 03, p. 29)
- **Reversibility:** A campaign outside the Western Reaches can return to 01's overland procedure.

## A8 — Player beliefs versus GM-facing secrets

- **Ambiguity:** 02's “What Everyone Knows” and 03's “What Nobody Knows” sometimes present different accounts of the same world.
- **Assumption:** Treat these as player-facing beliefs/rumors versus GM-facing secrets, not a mechanical conflict.
- **Reasoning:** The sections explicitly distinguish audience and informational function. (02, pp. 11–12; 03, pp. 11–12)
- **Reversibility:** A campaign can choose a local truth and label it override in campaign notes.

## A9 — Worked 5e example

- **Ambiguity:** No specific 5e edition or stat block was supplied.
- **Assumption:** Use an illustrative 5e-style goblin input and compare it with the published Shadowdark goblin as the target chassis.
- **Reasoning:** This demonstrates stat, AC, HP, attack, movement, and action-economy reconciliation while keeping Shadowdark facts anchored to 01.
- **Reversibility:** Substitute a verified 5e block or another external system and rerun the same conversion steps.

## A10 — No blocker

- **Ambiguity:** An earlier PDF retrieval attempt failed, but this task supplies three Markdown sources.
- **Assumption:** Proceed with the Markdown sources and do not create BLOCKER.md.
- **Reasoning:** All three Markdown source files were retrieved and parsed as readable UTF-8.
- **Reversibility:** If a later revision is missing or corrupt, create a blocker for that revision rather than filling its content from memory.

## A11 — SoloDark is an optional historical solo aid, not a new expansion layer

- **Ambiguity:** SoloDark V1 predates the 2026 Western Reaches books in the repository. The user has not yet received all physical/Kickstarter PDFs, so it is unknown whether other later materials clarify or replace any solo procedures.
- **Assumption:** Treat SoloDark as an optional solo-play aid for the original Shadowdark engine. Evaluate only the current repository sources `src/01/01.md`, `src/02/02.md`, `src/03/03.md`, and `src/solo/SoloDark_V1_(PDF).md`. Limit the review to solo-relevant rules and direct interactions; do not re-index all expansion content.
- **Reasoning:** SoloDark's source carries a 2023 copyright notice; the two Western Reaches books carry 2026 copyright notices. The supplied 02/03 text does not explicitly adopt or supersede SoloDark. The exact remaining Kickstarter source set is not available in this repository pass.
- **Reversibility:** When additional PDFs arrive, search them for solo/Oracle/initiative/light/luck procedures and update `src/solo/README.md`. If a later source expressly revises SoloDark, record that as an override and preserve this review as the earlier-source baseline.

## A12 — Oracle-style tools are treated as replaceable implementations

- **Ambiguity:** SoloDark presents a specific d20 Oracle and d100 verb+noun Prompt table, but solo play could use other uncertainty-resolution aids.
- **Assumption:** Treat the Oracle/Prompt procedure as the published implementation, while documenting tarot, other oracles, random tables, and scripts only as possible replacements at the interface level. Do not attribute those alternatives to SoloDark itself.
- **Reasoning:** This separates the general job of replacing missing GM judgment from the particular random tables used by this booklet.
- **Reversibility:** Keep the SoloDark tables unchanged as one backend, or replace the implementation without changing Shadowdark's core checks, combat, travel, or resource rules.
