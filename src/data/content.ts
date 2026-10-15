// Content lifted verbatim from the original component's class fields.

// Re-encoded from uploads/Camera_moving_toward_swimming_pool_20261014115109.mp4 with a 10-frame GOP (see MIGRATION-REPORT.md).
export const HERO_VIDEO = '/assets/hero-pool-optimized.mp4'
// Same encode at 1280×720 (6.3 MB vs 11.4 MB) for viewports under the 860px mobile breakpoint.
export const HERO_VIDEO_MOBILE = '/assets/hero-pool-optimized-1280.mp4'

export interface Scene { name: string; title: string; at: number; facts: [string, string][] }

export const SCENES: Scene[] = [
  { name: 'The Villa', title: 'Villa', at: 0, facts: [
    ['Architecture', 'A two-storey villa with tiled pitched roofs and carved timber verandas.'],
    ['Craft', 'Hand-finished columns, brackets and balustrades in warm hardwood.'],
    ['Light', 'Soft wall lanterns that hold the house in the dusk.']] },
  { name: 'Lawn & Pavilion', title: 'Garden', at: .3, facts: [
    ['Lawn', 'A broad, level lawn crossed by a stepping-stone path.'],
    ['Pavilion', 'A tiled garden pavilion around a stone fire bowl.'],
    ['Planting', 'Palms, banana and layered tropical understorey.']] },
  { name: 'Pool Deck', title: 'Deck', at: .58, facts: [
    ['Deck', 'Timber decking that follows the curve of the pool.'],
    ['Shade', 'A timber pergola and parasols over the loungers.'],
    ['Paths', 'Stone pavers set in grass link the deck to the lawn.']] },
  { name: 'Pool & Water Wall', title: 'Pool', at: .8, facts: [
    ['Pool', 'A free-form pool with underwater lighting.'],
    ['Water wall', 'A natural-stone wall with a sheet-water cascade.'],
    ['Reflection', 'The villa mirrored in still water at dusk.']] },
]

export const SERVICES: [string, string, string[], string[]][] = [
  ['Luxury Landscaping', 'Landscaped gardens, planting design, lawns and stone paths that mature beautifully.', ['Planting design', 'Lawns & groundcover', 'Stone paths & steps', 'Garden lighting'], ['Landscaping — signature garden', 'Planting detail', 'Stone path', 'Lawn & trees', 'Garden at dusk']],
  ['Swimming Pool Construction', 'Premium pools, water details and poolside design engineered to last.', ['Infinity & lap pools', 'Water features', 'Pool decks', 'Filtration & plant'], ['Pool — wide view', 'Infinity edge', 'Pool deck', 'Water feature', 'Pool lit at night']],
  ['Resort & Farmhouse Development', 'Modern villas, resort architecture and outdoor living, from masterplan to handover.', ['Masterplanning', 'Villas & cottages', 'Outdoor living', 'Approach & driveways'], ['Resort — aerial or façade', 'Villa entrance', 'Outdoor lounge', 'Farmhouse approach', 'Interior to garden']],
  ['Residential & Commercial Construction', 'Contemporary buildings delivered with refined architectural detail.', ['Homes & bungalows', 'Offices & retail', 'Façades & cladding', 'Turnkey interiors'], ['Building — street façade', 'Material detail', 'Entrance lobby', 'Courtyard', 'Under construction']],
]

// [title, body, items, placeholder, role, quote]
export const STEPS: [string, string, string[], string, string, string][] = [
  ['Founder Name', 'Leads design and client relationships. Trained as a landscape architect, with years of work on resorts and private estates before founding Uniquescapes.', ['Landscape architecture', 'Resorts & estates', 'Client lead'], 'Portrait — founder 1', 'Co-founder · Design Director', 'A landscape should feel inevitable — as if it was always meant to be there.'],
  ['Founder Name', 'Leads engineering and construction. A civil engineer who built the in-house crews that let us deliver pools, structures and services to the drawing.', ['Civil engineering', 'Pools & structures', 'Site delivery'], 'Portrait — founder 2', 'Co-founder · Projects Director', 'What we promise on paper, we build on site — line for line.'],
]

export const PROJECTS: [string, string, string, string, string][] = [
  ['The Aranya Resort', 'Resort', 'Alibaug', '2025', '4/5'],
  ['Villa Neel', 'Pool & Landscape', 'Goa', '2024', '4/3'],
  ['Kesar Farmhouse', 'Farmhouse', 'Lonavala', '2024', '4/3'],
  ['Meridian Court', 'Commercial', 'Pune', '2023', '4/5'],
]

// [quote, who, project · place]
// DRAFT — sample copy so the section can be reviewed. Replace with real, approved client quotes before launch.
export const TESTIMONIALS: [string, string, string][] = [
  ['They understood the land before they drew a single line. Two years on, the garden looks better every season.', 'Owner', 'Villa Neel · Goa'],
  ['One team for the cottages, the pool and the landscape — and nothing was lost between the drawing and the site.', 'Managing partner', 'The Aranya Resort · Alibaug'],
  ['Weekly updates, honest timelines, and a finish that our guests still ask about. We would build with them again.', 'Family owners', 'Kesar Farmhouse · Lonavala'],
]

export const PROJECT_TYPES =['Landscaping', 'Swimming pool', 'Resort', 'Farmhouse', 'Residential', 'Commercial']

export const STATEMENT = ['We', 'design', 'and', 'build', 'landscapes,', 'pools', 'and', 'architecture', 'for', 'people', 'who', 'expect', 'the', 'outdoors', 'to', 'feel', 'as', 'considered', 'as', 'the']

// Slug per service (same order as SERVICES); used in ?service=<slug>.
export const SERVICE_SLUGS = ['landscaping', 'pools', 'resorts', 'construction']

export interface ServicePageContent { name: string; stages: [tag: string, title: string, body: string, placeholder: string, photo?: string][] }

// Real photos for the home Services cards (keyed by slug); services without one keep the placeholder.
export const SERVICE_CARD_PHOTOS: Record<string, string> = {
  pools: '/assets/services/pools/card-wide.jpg',
}

// Stage-by-stage pages opened from the Services carousel.
// Landscaping copy is from the design recording. Pools, Resorts and Construction are DRAFT copy written
// from each service's description/feature list — replace with approved text when the designs arrive.
export const SERVICE_PAGES: Record<string, ServicePageContent> = {
  landscaping: {
    name: 'Landscaping',
    stages: [
      ['Stage 1', 'Site & Survey', 'We study the ground first — levels, soil, drainage, sun and existing trees — before a single line is drawn.', 'Stage 1 — bare site / survey'],
      ['Stage 2', 'Groundwork', 'Grading, drainage, irrigation and hardscape go in: paths, steps, edging and the bones of the garden.', 'Stage 2 — groundwork & hardscape'],
      ['Stage 3', 'Planting', 'Trees, shrubs, lawns and groundcover are placed to the plan, chosen to mature well in the local climate.', 'Stage 3 — planting in progress'],
      ['Finished', 'The Finished Garden', 'Lighting, finishing and handover. A landscape that is complete on day one and keeps getting better.', 'Finished — completed garden'],
    ],
  },
  pools: {
    name: 'Swimming Pools',
    stages: [
      // Photos: the client's own pool build, in order.
      ['Stage 1', 'Design & Excavation', 'We set the pool to the site and the house — shape, depth and levels — then excavate and shore the ground.', 'Stage 1 — excavation', '/assets/services/pools/stage-1-excavation.jpg'],
      ['Stage 2', 'Shell & Reinforcement', 'Steel and formwork follow every curve of the pool, and the floor and walls are cast as one watertight shell.', 'Stage 2 — steel & formwork', '/assets/services/pools/stage-2-shell.jpg'],
      ['Stage 3', 'Plumbing & Water Test', 'Return lines, drains and filtration go in, then the shell is filled and checked for leaks before any finish goes on.', 'Stage 3 — water test', '/assets/services/pools/stage-3-water-test.jpg'],
      ['Finished', 'The Finished Pool', 'Tiles, coping and deck laid; filled, balanced and lit — handed over with a care plan so the water stays clear.', 'Finished — pool lit at night', '/assets/services/pools/finished-night.jpg'],
    ],
  },
  resorts: {
    name: 'Resorts & Farmhouses',
    stages: [
      ['Stage 1', 'Masterplan', 'We plan the whole site first — the approach, the views, the villas and the outdoor spaces between them.', 'Stage 1 — site masterplan'],
      ['Stage 2', 'Villas & Cottages', 'Foundations, frames and roofs for every villa and cottage, built by our own crews to the drawings.', 'Stage 2 — villas under construction'],
      ['Stage 3', 'Outdoor Living', 'Lounges, decks, driveways and landscape draw the buildings together into one place.', 'Stage 3 — outdoor lounge & approach'],
      ['Finished', 'The Finished Resort', 'Interiors open to the garden, every detail resolved, handed over ready for the first guests.', 'Finished — resort at dusk'],
    ],
  },
  construction: {
    name: 'Construction',
    stages: [
      ['Stage 1', 'Design & Approvals', 'Drawings, structure and services are resolved early and taken through approvals before ground is broken.', 'Stage 1 — drawings & site'],
      ['Stage 2', 'Structure', 'Foundations, frame and slabs rise on a planned sequence, inspected at every stage.', 'Stage 2 — structure rising'],
      ['Stage 3', 'Façade & Services', 'Cladding, glazing and building services close the building in with refined architectural detail.', 'Stage 3 — façade & services'],
      ['Finished', 'Handover', 'Turnkey interiors, a final inspection and a building ready to move into on day one.', 'Finished — completed building'],
    ],
  },
}
