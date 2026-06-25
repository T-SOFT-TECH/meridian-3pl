# Graph Report - meridian-3pl  (2026-06-25)

## Corpus Check
- 71 files · ~468,831 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 292 nodes · 313 edges · 15 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `Pricing Calculator Implementation Plan` - 16 edges
2. `Pricing Calculator Formula Draft` - 12 edges
3. `Project Configuration (CLAUDE.md)` - 11 edges
4. `cPanel Deployment Guide` - 11 edges
5. `Pricing Calculator Proposal PDF` - 11 edges
6. `getAdminPb()` - 10 edges
7. `POST()` - 10 edges
8. `Build Notes` - 10 edges
9. `Quote Formula (Original Draft)` - 8 edges
10. `Meridian 3PL (Company)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Pricing Calculator Formula Draft` --semantically_similar_to--> `Pricing Calculator Proposal PDF`  [EXTRACTED] [semantically similar]
  Meridian-Pricing-Calculator-Formula-DRAFT.md → Meridian-Pricing-Calculator-Proposal.pdf
- `Pricing Calculator Proposal PDF` --references--> `Whole-Quantity Banding Rule`  [EXTRACTED]
  Meridian-Pricing-Calculator-Proposal.pdf → Meridian-Pricing-Calculator-Formula-DRAFT.md
- `computeQuote()` --calls--> `POST()`  [INFERRED]
  src\lib\pricing\calculate.ts → src\routes\api\quote\+server.ts
- `saveDraft()` --calls--> `getAdminPb()`  [INFERRED]
  src\lib\server\pricing.ts → src\lib\server\pb.ts
- `publish()` --calls--> `getAdminPb()`  [INFERRED]
  src\lib\server\pricing.ts → src\lib\server\pb.ts

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

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (38): ApiError, AppleClientSecretCreateForm, AutodateField, BadRequestError, BoolField, Collection, Command, Context (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (28): SvelteKit adapter-node, /admin Route, /admin/setup Route, better-auth (Authentication), Build Notes, Courier Rate Card (placeholder / pending), cPanel Shared Hosting, cPanel Deployment Guide (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (13): load(), load(), createPb(), getAdminPb(), getPublishedConfig(), getVersion(), listVersions(), publish() (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (20): Custom Capacity Flag (55+ pallets / 3000+ orders), Derrimut, Melbourne VIC (166 sqm), Meridian 3PL (Company), Meridian 3PL Company Profile, NPFulfilment (Competitor Benchmark), Pricing: Monthly Account Fee (A), Pricing: Extras / Add-ons (F), Pricing Calculator Formula Draft (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (12): json(), main(), text(), orNull(), POST(), aud(), orNull(), POST() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (15): Project Configuration (AGENTS.md), Project Configuration (CLAUDE.md), Project Configuration (GEMINI.md), Graphify Knowledge Graph, MCP (Model Context Protocol), npm Package Manager, SvelteKit Project (README), sv CLI (Svelte project scaffold) (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (15): International Shipping Service, Container Ship - Ocean Freight, Last-Mile Delivery Service, Courier Truck - Road Freight, Svelte Framework Logo (Favicon), Order Processing and Fulfillment, Fulfillment Floor - Warehouse Operations, Business Partnership Handshake (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (3): parallax(), clipReveal(), clipReveal()

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (12): Clothing Boutique / Garment Store Interior, Clothing Rack with Hanging Garments, Fashion & Apparel Industry Vertical, Fresh Vegetables / Grocery Produce, FMCG Industry Vertical, Supermarket Produce Shelves, Artisan Bread Loaves, Food Industry Vertical (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (9): Meridian 3PL Primary Logo, Meridian 3PL White (Reversed) Logo, Flinders Street Station — Melbourne Landmark, Last-Mile Parcel Handover, Logistics Planning and Strategy Session, Aerial Container Port — International Freight, Warehouse Pallet Racking — Storage Operations, Australian Road Train — Long-Haul Freight (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.53
Nodes (6): Arc Welding Operation with Sparks, Industrial Industry Vertical, Welder Worker with Protective Helmet, Manufacturing Industry Vertical, Metal Grinding with Angle Grinder, Metalwork Sparks / Fabrication Process

### Community 14 - "Community 14"
Cohesion: 0.7
Nodes (4): bandRate(), computeQuote(), round2(), shippingPrice()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (1): load()

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (3): Circuit Board / PCB, Electronics Industry Vertical, Microchip / Semiconductor Component

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (3): Healthcare & Pharmaceutical Industry Vertical, Prescription Medicine Bottle, Pharmaceutical Capsule Pills

## Knowledge Gaps
- **67 isolated node(s):** `DynamicModel`, `Context`, `Collection`, `FieldsList`, `Field` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (3 nodes): `load()`, `+page.server.ts`, `+page.server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pricing Calculator Implementation Plan` connect `Community 1` to `Community 3`, `Community 5`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `SvelteKit Project (README)` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Build Notes` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `DynamicModel`, `Context`, `Collection` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._