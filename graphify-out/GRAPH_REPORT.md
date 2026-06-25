# Graph Report - C:\Users\USER\Documents\WEBSITES\David Australia\MERIDIAN 3PL\meridian-3pl  (2026-06-15)

## Corpus Check
- 97 files · ~320,947 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 251 nodes · 332 edges · 14 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Panel & Quote Management|Admin Panel & Quote Management]]
- [[_COMMUNITY_Database & ORM Layer|Database & ORM Layer]]
- [[_COMMUNITY_Business Domain & Pricing Tiers|Business Domain & Pricing Tiers]]
- [[_COMMUNITY_Pricing Calculation Engine|Pricing Calculation Engine]]
- [[_COMMUNITY_AI Agent Configuration|AI Agent Configuration]]
- [[_COMMUNITY_Logistics Services & Visual Assets|Logistics Services & Visual Assets]]
- [[_COMMUNITY_Build Infrastructure & Design System|Build Infrastructure & Design System]]
- [[_COMMUNITY_Server-Side Pricing API|Server-Side Pricing API]]
- [[_COMMUNITY_GSAP Animation Utilities|GSAP Animation Utilities]]
- [[_COMMUNITY_Industry Verticals Fashion & Consumer|Industry Verticals: Fashion & Consumer]]
- [[_COMMUNITY_Brand Identity & Locale|Brand Identity & Locale]]
- [[_COMMUNITY_Industry Verticals Industrial & Manufacturing|Industry Verticals: Industrial & Manufacturing]]
- [[_COMMUNITY_Industry Vertical Electronics|Industry Vertical: Electronics]]
- [[_COMMUNITY_Industry Vertical Healthcare|Industry Vertical: Healthcare]]

## God Nodes (most connected - your core abstractions)
1. `Pricing Calculator Implementation Plan` - 33 edges
2. `Build Notes` - 14 edges
3. `Drizzle ORM` - 13 edges
4. `cPanel Deployment Guide` - 12 edges
5. `Pricing Calculator Formula Draft` - 12 edges
6. `Project Configuration (CLAUDE.md)` - 11 edges
7. `Pricing Calculator Proposal PDF` - 11 edges
8. `src/lib/pricing/calculate.ts` - 9 edges
9. `src/lib/pricing/default-config.ts` - 9 edges
10. `POST()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Pricing Calculator Proposal PDF` --semantically_similar_to--> `Pricing Calculator Formula Draft`  [EXTRACTED] [semantically similar]
  Meridian-Pricing-Calculator-Proposal.pdf → Meridian-Pricing-Calculator-Formula-DRAFT.md
- `Pricing Calculator Proposal PDF` --references--> `Whole-Quantity Banding Rule`  [EXTRACTED]
  Meridian-Pricing-Calculator-Proposal.pdf → Meridian-Pricing-Calculator-Formula-DRAFT.md
- `POST()` --calls--> `getPublishedConfig()`  [INFERRED]
  src\routes\api\quote\+server.ts → src\lib\server\pricing.ts
- `load()` --calls--> `seedIfEmpty()`  [INFERRED]
  src\routes\admin\pricing\+page.server.ts → src\lib\server\pricing.ts
- `load()` --calls--> `listVersions()`  [INFERRED]
  src\routes\admin\pricing\+page.server.ts → src\lib\server\pricing.ts

## Hyperedges (group relationships)
- **Pricing Formula Document Set** — pricing_formula_draft, pricing_impl_plan, pricing_proposal_pdf, quote_formula_txt [INFERRED 0.90]
- **Six Pricing Cost Components** — pricing_account_fee, pricing_storage, pricing_receiving, pricing_pick_pack, pricing_shipping, pricing_extras [EXTRACTED 1.00]
- **Pricing Engine Module (src/lib/pricing/)** — pricing_types_ts, pricing_calculate_ts, pricing_default_config_ts, pricing_calculate_test_ts [EXTRACTED 1.00]
- **Core Technology Stack** — sveltekit_framework, typescript_lang, tailwindcss_addon, mariadb_mysql, drizzle_orm, better_auth, adapter_node [EXTRACTED 1.00]
- **AI Agent Configuration Documents** — agents_md_project_config, claude_md_project_config, gemini_md_project_config [EXTRACTED 1.00]
- **Pricing Calculator Build Phases** — phase_2a_engine, phase_2b_admin, phase_2c_public_calc, phase_2d_qa [EXTRACTED 1.00]
- **Meridian 3PL Service Offerings** — service_warehousing, service_pick_pack, service_inventory_mgmt, service_shipping_dist [EXTRACTED 1.00]
- **Public Calculator Data Flow** — quote_page_server, quote_page_svelte, pricing_calculator_component, api_quote_server, quote_requests_table [EXTRACTED 1.00]

## Communities

### Community 0 - "Admin Panel & Quote Management"
Cohesion: 0.12
Nodes (35): src/routes/admin/pricing/+page.server.ts, src/routes/admin/pricing/+page.svelte, src/routes/admin/quotes/[id]/+page.svelte, /admin Route, /admin/setup Route, src/routes/api/quote/+server.ts, bandRate() helper function, better-auth (Authentication) (+27 more)

### Community 1 - "Database & ORM Layer"
Cohesion: 0.1
Nodes (6): Drizzle ORM, load(), load(), userCount(), handle(), userCount()

### Community 2 - "Business Domain & Pricing Tiers"
Cohesion: 0.25
Nodes (21): Custom Capacity Flag (55+ pallets / 3000+ orders), Derrimut, Melbourne VIC (166 sqm), Meridian 3PL (Company), Meridian 3PL Company Profile, NPFulfilment (Competitor Benchmark), Pricing: Monthly Account Fee (A), src/lib/pricing/default-config.ts, Pricing: Extras / Add-ons (F) (+13 more)

### Community 3 - "Pricing Calculation Engine"
Cohesion: 0.18
Nodes (13): orNull(), POST(), bandRate(), computeQuote(), round2(), shippingPrice(), aud(), orNull() (+5 more)

### Community 4 - "AI Agent Configuration"
Cohesion: 0.14
Nodes (16): Project Configuration (AGENTS.md), SvelteKit App Shell (app.html), Project Configuration (CLAUDE.md), Project Configuration (GEMINI.md), Graphify Knowledge Graph, MCP (Model Context Protocol), npm Package Manager, SvelteKit Project (README) (+8 more)

### Community 5 - "Logistics Services & Visual Assets"
Cohesion: 0.17
Nodes (15): International Shipping Service, Container Ship - Ocean Freight, Last-Mile Delivery Service, Courier Truck - Road Freight, Svelte Framework Logo (Favicon), Order Processing and Fulfillment, Fulfillment Floor - Warehouse Operations, Business Partnership Handshake (+7 more)

### Community 6 - "Build Infrastructure & Design System"
Cohesion: 0.19
Nodes (13): SvelteKit adapter-node, Build Notes, computeQuote Engine (pure function), Courier Rate Card (placeholder / pending), "The Meridian Line" Design Concept, Fontsource Self-hosted Fonts, GSAP + ScrollTrigger + Lenis, HeroSlider.svelte Component (+5 more)

### Community 7 - "Server-Side Pricing API"
Cohesion: 0.21
Nodes (6): load(), load(), getPublishedConfig(), getVersion(), listVersions(), seedIfEmpty()

### Community 8 - "GSAP Animation Utilities"
Cohesion: 0.17
Nodes (3): parallax(), clipReveal(), clipReveal()

### Community 9 - "Industry Verticals: Fashion & Consumer"
Cohesion: 0.24
Nodes (12): Clothing Boutique / Garment Store Interior, Clothing Rack with Hanging Garments, Fashion & Apparel Industry Vertical, Fresh Vegetables / Grocery Produce, FMCG Industry Vertical, Supermarket Produce Shelves, Artisan Bread Loaves, Food Industry Vertical (+4 more)

### Community 10 - "Brand Identity & Locale"
Cohesion: 0.25
Nodes (9): Meridian 3PL Primary Logo, Meridian 3PL White (Reversed) Logo, Flinders Street Station — Melbourne Landmark, Last-Mile Parcel Handover, Logistics Planning and Strategy Session, Aerial Container Port — International Freight, Warehouse Pallet Racking — Storage Operations, Australian Road Train — Long-Haul Freight (+1 more)

### Community 12 - "Industry Verticals: Industrial & Manufacturing"
Cohesion: 0.53
Nodes (6): Arc Welding Operation with Sparks, Industrial Industry Vertical, Welder Worker with Protective Helmet, Manufacturing Industry Vertical, Metal Grinding with Angle Grinder, Metalwork Sparks / Fabrication Process

### Community 15 - "Industry Vertical: Electronics"
Cohesion: 1.0
Nodes (3): Circuit Board / PCB, Electronics Industry Vertical, Microchip / Semiconductor Component

### Community 16 - "Industry Vertical: Healthcare"
Cohesion: 1.0
Nodes (3): Healthcare & Pharmaceutical Industry Vertical, Prescription Medicine Bottle, Pharmaceutical Capsule Pills

## Knowledge Gaps
- **23 isolated node(s):** `Project Configuration (AGENTS.md)`, `Project Configuration (GEMINI.md)`, `SvelteKit App Shell (app.html)`, `TypeScript`, `Svelte MCP: list-sections` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Drizzle ORM` connect `Database & ORM Layer` to `Admin Panel & Quote Management`, `Server-Side Pricing API`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `Pricing Calculator Implementation Plan` connect `Admin Panel & Quote Management` to `Database & ORM Layer`, `Business Domain & Pricing Tiers`, `AI Agent Configuration`, `Build Infrastructure & Design System`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Why does `getPublishedConfig()` connect `Server-Side Pricing API` to `Pricing Calculation Engine`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `Project Configuration (AGENTS.md)`, `Project Configuration (GEMINI.md)`, `SvelteKit App Shell (app.html)` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Panel & Quote Management` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Database & ORM Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `AI Agent Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._