# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Importing businesses** in Georgia moving cargo from China, Europe, Türkiye and beyond.
- **Exporters** in Georgia sending cargo abroad.
- **Transit partners** — foreign forwarders and companies using the Georgia / Caucasus corridor.
- **Private individuals** with one-off shipments (e.g. a car or household goods).

They arrive to find out whether WEFORWARD can move their cargo on their corridor, how, and how to start.

## Product Purpose

WEFORWARD is a freight-forwarding and logistics company based in Tbilisi, Georgia, founded in 2009. The site presents its services, lets visitors explore illustrative corridors to and from Georgia by transport mode, and turns interest into a quote request or contact. Success = a visitor finds their route and starts a conversation.

## Positioning

All transport modes — air, sea, rail, road — plus customs brokerage, handled by one team end to end, so cargo never falls between two providers.

## Operating Context

- Corridors: Europe, China, Türkiye, Central Asia, Gulf and worldwide sea/air into and out of Georgia; Georgia as a transit hub.
- Shipment vocabulary visitors use: FTL / LTL (road), FCL / LCL (sea, rail), consolidation warehouses, ferries, border crossings, customs declarations.
- Client platform: **tms.weforward** (transport management system). The site currently shows a placeholder; real TMS screens are not ready.

## Capabilities and Constraints

- Site: Next.js 16 (App Router) + Tailwind 3 + motion + three.js; repo `Desktop/wfnew`.
- Route explorer uses the brand-concept corridor engine (`public/routes-engine/`, loaded unchanged). Corridors are **illustrative**; availability is confirmed per shipment — never present them as live tracking or schedules.
- Languages: EN now; a KA (Georgian) switch exists but translation is not implemented. Engine copy already carries Georgian strings.
- Quote form is a front-end preview only — no backend sends requests yet.
- Undecided: final copy, figures and proof points (see Evidence).

## Brand Commitments

- Name: **WEFORWARD**. Tagline: **“You deal. We deliver.”**
- Brand guidelines: see git history (removed from tree); W mark and wordmark in `components/brand/design-system.tsx`; typeface Loos Wide (web `public/assets/fonts`).
- Founded 2009; voice from the confirmed about copy: experience, loyalty, teamwork; “your cargo’s journey is our top priority”.

## Evidence on Hand

- Assets: logo, Loos Wide fonts, hero videos (`public/assets/hero-*.webm`), Earth texture (NASA Blue Marble, public domain).
- Network memberships and carriers as published on weforward.ge: WCA China Global, JCtrans, WCA World, All World Shipping; carriers Maersk, Hapag-Lloyd, CMA CGM, COSCO, Evergreen, Turkish Airlines, Qatar Airways, Lufthansa, Air France, flydubai (logos in `public/assets/logos/`). weforward.ge's "MSC" image is the MSC Cruises logo — not used.
- **No** confirmed figures (volumes, clients, warehouse size), **no** client logos or testimonials, **no** certifications on hand. Do not invent any of these.
- Unverified figures currently in design copy (14 days China → Georgia by rail, 33 t per 40HC, contact +995 591 32 12 92 / info@weforward.ge) come from the design files — confirm before treating as final.

## Product Principles

1. One partner for the whole journey — every surface should make the end-to-end, multi-mode service obvious.
2. Show the route, not a promise — corridors are illustrative; never imply live data, guarantees or claims we cannot back.
3. Serve both businesses and private senders — plain language for FTL/LTL/FCL terms, no gatekeeping.
4. Georgia as the hub — corridors are framed to and from Georgia.
5. Every visit ends with a clear next step: find your route, then request a quote or contact the team.
