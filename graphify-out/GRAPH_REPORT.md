# Graph Report - .  (2026-06-09)

## Corpus Check
- Corpus is ~19,244 words - fits in a single context window. You may not need a graph.

## Summary
- 168 nodes · 247 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Graphify Skill Docs|Graphify Skill Docs]]
- [[_COMMUNITY_Booking Flow|Booking Flow]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Time Slot Logic|Time Slot Logic]]
- [[_COMMUNITY_App Layout Video|App Layout Video]]
- [[_COMMUNITY_README Setup|README Setup]]
- [[_COMMUNITY_Claude Agent Hooks|Claude Agent Hooks]]
- [[_COMMUNITY_Next.js Media Config|Next.js Media Config]]
- [[_COMMUNITY_Neo4j Export|Neo4j Export]]
- [[_COMMUNITY_Token Benchmark|Token Benchmark]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `POST()` - 13 edges
3. `graphify` - 12 edges
4. `BookingForm()` - 9 edges
5. `minutesSinceMidnight()` - 9 edges
6. `isSlotBookable()` - 8 edges
7. `getOpeningHoursFromEnv()` - 7 edges
8. `isTimeBookable()` - 7 edges
9. `--update Incremental Re-extraction` - 7 edges
10. `resolveBookingInstantUtcMs()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `graphify-out Knowledge Graph` --semantically_similar_to--> `Knowledge Graph`  [INFERRED] [semantically similar]
  CLAUDE.md → .claude/skills/graphify/SKILL.md
- `graphify update` --semantically_similar_to--> `Code-Only Update Fast Path`  [INFERRED] [semantically similar]
  CLAUDE.md → .claude/skills/graphify/references/update.md
- `sanitizePhone()` --semantically_similar_to--> `BookingSchema`  [INFERRED] [semantically similar]
  app/booking/BookingForm.tsx → lib/validation.ts
- `graphify-out Knowledge Graph` --references--> `graph.json`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md
- `graphify update` --conceptually_related_to--> `--update Incremental Re-extraction`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/references/update.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Submission Pipeline** — booking_bookingform_bookingform, booking_route_post, lib_validation_bookingschema, lib_bookingslots_isslotbookable, lib_telegram_sendtelegrammessage [EXTRACTED 1.00]
- **Opening Hours Slot System** — lib_openinghours_getopeninghoursfromenv, lib_openinghours_buildopeningtimeslots, lib_bookingslots_filterbookableslots, lib_bookingslots_isslotbookable, lib_openinghours_istimebookable [EXTRACTED 1.00]
- **Font Video Asset Pipeline** — scripts_copy_font_video, components_appvideoshell_font_mp4_asset, components_appvideoshell_appvideoshell, next_config_nextconfig, types_media_d [INFERRED 0.95]
- **Meduza Booking Customer Flow** — readme_booking_form, readme_opening_hours, readme_telegram_bot, readme_telegram_bot_token, readme_telegram_chat_id [INFERRED 0.85]
- **Graphify Dual Extraction Pipeline** — graphify_skill_ast_extraction, graphify_skill_semantic_extraction, graphify_skill_knowledge_graph, graphify_skill_community_detection [EXTRACTED 1.00]
- **Graphify Query Traversal Flow** — references_query_vocab_expansion, references_query_bfs, references_query_dfs, references_query_save_result [EXTRACTED 1.00]

## Communities (12 total, 3 thin omitted)

### Community 0 - "Graphify Skill Docs"
Cohesion: 0.07
Nodes (36): graphify Skill, graphify query, graphify update, AST Structural Extraction, Community Detection, Fast Path Query on Existing Graph, Gemini Semantic Extraction, God Nodes (+28 more)

### Community 1 - "Booking Flow"
Cohesion: 0.12
Nodes (26): HomePage(), BookingForm(), BookingFormProps, BookingPayload, sanitizePhone(), BookingPage(), ErrorBody, escapeHtml() (+18 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, next, react, react-dom, @vercel/analytics, @vercel/speed-insights, zod, devDependencies (+10 more)

### Community 4 - "Time Slot Logic"
Cohesion: 0.21
Nodes (16): bookingInstantUtcMs(), Cross-Midnight Service Night, getResolvedCalendarDate(), MIN_BOOKING_ADVANCE_MS, minBookableSlotUtcMs(), resolveBookingInstantUtcMs(), roundUpToSlotMs(), TZ_UTC_OFFSET_HOURS (+8 more)

### Community 5 - "App Layout Video"
Cohesion: 0.14
Nodes (14): metadata, RootLayout(), viewport, AppVideoShell(), AppVideoShellProps, font.mp4 Background Video Asset, scripts, build (+6 more)

### Community 6 - "README Setup"
Cohesion: 0.15
Nodes (13): graphify-out Knowledge Graph, Booking Form, BOOKING_TZ Asia/Ho_Chi_Minh, BotFather, Meduza Booking, Meduza Restaurant-Lounge, Opening Hours 12:00–03:00 Vietnam Time, Vercel Speed Insights (+5 more)

### Community 7 - "Claude Agent Hooks"
Cohesion: 0.50
Nodes (3): Graphify Agent Pre-Tool Hooks, hooks, PreToolUse

## Knowledge Gaps
- **64 isolated node(s):** `ErrorBody`, `BookingFormProps`, `metadata`, `viewport`, `AppVideoShellProps` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `graphify-out Knowledge Graph` connect `README Setup` to `Graphify Skill Docs`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `ErrorBody`, `BookingFormProps`, `metadata` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Graphify Skill Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Booking Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.12299465240641712 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `App Layout Video` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._