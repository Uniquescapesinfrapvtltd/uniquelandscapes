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
  ['Farmhouse & Resorts', 'Farmhouses, resort villas and outdoor living, from masterplan to handover.', ['Farmhouses', 'Resort villas & cottages', 'Masterplanning', 'Outdoor living'], ['Farmhouse — aerial or façade', 'Farmhouse approach', 'Resort villa entrance', 'Outdoor lounge', 'Interior to garden']],
  ['3D Designs', 'Photoreal 3D renders and walkthroughs — see the finished space before a single stone is laid.', ['3D renders', 'Walkthrough videos', 'Landscape & pool visuals', 'Materials & lighting'], ['3D render — hero view', 'Render detail', 'Night render', 'Aerial render', 'Walkthrough still']],
]

// [title, body, items, placeholder, role, quote]
export const STEPS: [string, string, string[], string, string, string][] = [
  ['Founder Name', 'Leads design and client relationships. Trained as a landscape architect, with years of work on resorts and private estates before founding Uniquescapes.', ['Landscape architecture', 'Resorts & estates', 'Client lead'], 'Portrait — founder 1', 'Co-founder · Design Director', 'A landscape should feel inevitable — as if it was always meant to be there.'],
  ['Founder Name', 'Leads engineering and construction. A civil engineer who built the in-house crews that let us deliver pools, structures and services to the drawing.', ['Civil engineering', 'Pools & structures', 'Site delivery'], 'Portrait — founder 2', 'Co-founder · Projects Director', 'What we promise on paper, we build on site — line for line.'],
]

// [name, type, place, year, aspect, photo?] — empty place/year are hidden.
export const PROJECTS: [string, string, string, string, string, string?][] = [
  ['Timber Cottage & Pool', 'Farmhouse & Resorts', '', '', '1/1', '/assets/projects/timber-cottage-pool.jpg'],
  ['Round Pools & Mural Garden', 'Pools & Landscaping', '', '', '1/1', '/assets/projects/round-pools-mural-garden.jpg'],
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

export const PROJECT_TYPES =['Landscaping', 'Swimming pool', 'Resort', 'Farmhouse', 'Residential', 'Commercial', '3D design']

export const STATEMENT = ['We', 'design', 'and', 'build', 'visionary', 'ideas', 'into', 'extraordinary', 'destinations', 'through', 'end-to-end', 'resort', 'and', 'farmhouse', 'development,', 'bespoke', 'landscapes,', 'architectural', 'swimming', 'pools,', 'and', 'precision-crafted', 'outdoor']

// Slug per service (same order as SERVICES); used in ?service=<slug>.
export const SERVICE_SLUGS = ['landscaping', 'pools', 'resorts', '3d-designs']

export interface ServicePageContent { name: string; stages: [tag: string, title: string, body: string, placeholder: string, photo?: string][] }

// Real photos for the home Services cards (keyed by slug); services without one keep the placeholder.
export const SERVICE_CARD_PHOTOS: Record<string, string> = {
  landscaping: '/assets/services/landscaping/garden-pavilion-night.jpg',
  pools: '/assets/services/pools/card-wide.jpg',
  resorts: '/assets/services/resorts/card.jpg',
  '3d-designs': '/assets/services/3d-designs/card.jpg',
}

// Stage-by-stage pages opened from the Services carousel.
// Landscaping copy is from the design recording. Pools, Farmhouse & Resorts and 3D Designs are DRAFT copy written
// from each service's description/feature list — replace with approved text when the designs arrive.
export const SERVICE_PAGES: Record<string, ServicePageContent> = {
  landscaping: {
    name: 'Landscaping',
    stages: [
      // Photos: the client's own landscape builds, in order.
      ['Stage 1', 'Site & Survey', 'We study the ground first — levels, soil, drainage, sun and existing trees — before a single line is drawn.', 'Stage 1 — site dug out, footings', '/assets/services/landscaping/stage-1-site.jpg'],
      ['Stage 2', 'Groundwork', 'Grading, drainage, irrigation and hardscape go in: paths, steps, edging and the bones of the garden.', 'Stage 2 — pergola base & kerbs', '/assets/services/landscaping/stage-2-groundwork.jpg'],
      ['Stage 3', 'Planting', 'Trees, shrubs, lawns and groundcover are placed to the plan, chosen to mature well in the local climate.', 'Stage 3 — palms craned into place', '/assets/services/landscaping/stage-3-planting.jpg'],
      ['Finished', 'The Finished Garden', 'Lighting, finishing and handover. A landscape that is complete on day one and keeps getting better.', 'Finished — villa garden from above', '/assets/services/landscaping/finished-aerial.jpg'],
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
    name: 'Farmhouse & Resorts',
    stages: [
      ['Stage 1', 'Masterplan', 'We plan the whole site first — the approach, the views, the villas and the outdoor spaces between them.', 'Stage 1 — masterplan render', '/assets/services/resorts/stage-1-masterplan.jpg'],
      ['Stage 2', 'Farmhouses & Villas', 'Foundations, frames and roofs for every farmhouse, villa and cottage, built by our own crews to the drawings.', 'Stage 2 — timber cottage under construction', '/assets/services/resorts/stage-2-cottage-build.jpg'],
      ['Stage 3', 'Outdoor Living', 'Lounges, decks, driveways and landscape draw the buildings together into one place.', 'Stage 3 — lawn, deck and pergolas', '/assets/services/resorts/stage-3-outdoor-living.jpg'],
      ['Finished', 'The Finished Retreat', 'Interiors open to the garden, every detail resolved, handed over ready for the first guests or the first weekend.', 'Finished — timber cottage at night', '/assets/services/resorts/finished-cottage-night.jpg'],
    ],
  },
  '3d-designs': {
    name: '3D Designs',
    stages: [
      ['Stage 1', 'Brief & Site Study', 'We start with how you want to live and the land you have — photos, levels and views of the real site.', 'Stage 1 — the real site', '/assets/services/3d-designs/stage-1-site.jpg'],
      ['Stage 2', 'Concept & Layout', 'Plans and sketches settle the layout: where the pool, lawn, paths and buildings sit and how they connect.', 'Stage 2 — plan view of the layout', '/assets/services/3d-designs/stage-2-plan.jpg'],
      ['Stage 3', '3D Model & Materials', 'The design is modelled in 3D with real materials, planting and lighting, so every choice can be seen and changed.', 'Stage 3 — 3D model from above', '/assets/services/3d-designs/stage-3-model.jpg'],
      ['Finished', 'Renders & Walkthrough', 'Photoreal day and night renders and a walkthrough video — the finished space, before construction begins.', 'Finished — rooftop lounge render at sunset', '/assets/services/3d-designs/finished-render.jpg'],
    ],
  },
}
