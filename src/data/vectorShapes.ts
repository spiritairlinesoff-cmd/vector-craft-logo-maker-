export interface VectorShape {
  id: string;
  name: string;
  category: 'Abstract & Geometric' | 'Tech & Cyber' | 'Crest & Heraldry' | 'Nature & Eco' | 'Animals & Mascots' | 'Minimalist' | 'Badges';
  path: string;
  viewBox: string;
}

export const VECTOR_SHAPES: VectorShape[] = [
  // Abstract & Geometric
  {
    id: 'geom_hexagon_mesh',
    name: 'Hexagonal Prism',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z M50 25 L72 38 L72 62 L50 75 L28 62 L28 38 Z',
  },
  {
    id: 'geom_isometric_cube',
    name: 'Isometric Cube',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 10 L85 30 L50 50 L15 30 Z M15 35 L48 53 L48 90 L15 72 Z M85 35 L52 53 L52 90 L85 72 Z',
  },
  {
    id: 'geom_interlocking_arcs',
    name: 'Infinity Dynamic Arc',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M25 50 C25 35 40 25 55 25 C70 25 80 40 80 50 C80 65 65 75 50 75 C35 75 25 60 25 50 Z M38 50 C38 58 45 64 53 64 C62 64 68 56 68 50 C68 42 61 36 52 36 C43 36 38 43 38 50 Z',
  },
  {
    id: 'geom_apex_triangle',
    name: 'Apex Delta',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 12 L90 82 L10 82 Z M50 32 L26 74 L74 74 Z M50 48 L62 68 L38 68 Z',
  },
  {
    id: 'geom_diamond_star',
    name: 'Luxe Diamond Star',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 5 L62 38 L95 50 L62 62 L50 95 L38 62 L5 50 L38 38 Z',
  },
  {
    id: 'geom_origami_crane',
    name: 'Origami Poly',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 15 L80 45 L50 85 L20 45 Z M50 28 L70 45 L50 72 L30 45 Z M50 45 L80 45 L50 85 Z',
  },
  {
    id: 'geom_vortex_spiral',
    name: 'Vortex Blades',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M50 15 C65 15 80 25 85 45 L65 48 C62 38 55 30 45 30 C30 30 20 45 25 60 L8 64 C2 38 20 15 50 15 Z M50 85 C35 85 20 75 15 55 L35 52 C38 62 45 70 55 70 C70 70 80 55 75 40 L92 36 C98 62 80 85 50 85 Z',
  },
  {
    id: 'geom_interlinked_rings',
    name: 'Interlinked Rings',
    category: 'Abstract & Geometric',
    viewBox: '0 0 100 100',
    path: 'M38 50 A 24 24 0 1 0 38 49.9 Z M38 50 A 14 14 0 1 1 38 50.1 Z M62 50 A 24 24 0 1 0 62 49.9 Z M62 50 A 14 14 0 1 1 62 50.1 Z',
  },

  // Tech & Cyber
  {
    id: 'tech_chip_core',
    name: 'Microprocessor AI Core',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M25 25 H75 V75 H25 Z M35 35 H65 V65 H35 Z M10 35 H20 M10 50 H20 M10 65 H20 M80 35 H90 M80 50 H90 M80 65 H90 M35 10 V20 M50 10 V20 M65 10 V20 M35 80 V90 M50 80 V90 M65 80 V90',
  },
  {
    id: 'tech_lightning_bolt',
    name: 'Volt Energy Bolt',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M58 8 L22 52 L48 52 L42 92 L78 48 L52 48 Z',
  },
  {
    id: 'tech_quantum_orbital',
    name: 'Quantum Atom Orbit',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M50 42 A 8 8 0 1 0 50 58 A 8 8 0 1 0 50 42 Z M50 15 C75 15 88 35 88 50 C88 65 75 85 50 85 C25 85 12 65 12 50 C12 35 25 15 50 15 Z M25 25 C45 10 70 30 80 55 C90 80 65 92 45 80 C25 68 15 40 25 25 Z',
  },
  {
    id: 'tech_cyber_shield',
    name: 'Cyber Sentinel Shield',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M50 10 L85 25 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V25 Z M50 24 L72 35 V54 C72 68 50 80 50 80 C50 80 28 68 28 54 V35 Z M50 36 L62 48 L56 65 L44 65 L38 48 Z',
  },
  {
    id: 'tech_rocket_launch',
    name: 'Rocket Propulsion',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M50 10 C65 25 68 50 64 68 L50 62 L36 68 C32 50 35 25 50 10 Z M32 60 L18 72 L26 80 L36 74 Z M68 60 L82 72 L74 80 L64 74 Z M44 75 L50 92 L56 75 Z',
  },
  {
    id: 'tech_digital_nodes',
    name: 'Network Nodes',
    category: 'Tech & Cyber',
    viewBox: '0 0 100 100',
    path: 'M50 20 A 10 10 0 1 0 50 40 A 10 10 0 1 0 50 20 Z M20 65 A 10 10 0 1 0 20 85 A 10 10 0 1 0 20 65 Z M80 65 A 10 10 0 1 0 80 85 A 10 10 0 1 0 80 65 Z M42 36 L28 68 M58 36 L72 68 M32 75 L68 75',
  },

  // Crest & Heraldry
  {
    id: 'crest_royal_crown',
    name: 'Imperial Royal Crown',
    category: 'Crest & Heraldry',
    viewBox: '0 0 100 100',
    path: 'M15 75 L22 35 L40 55 L50 22 L60 55 L78 35 L85 75 Z M20 80 H80 V86 H20 Z M22 32 A 4 4 0 1 0 22 24 A 4 4 0 1 0 22 32 Z M50 20 A 4 4 0 1 0 50 12 A 4 4 0 1 0 50 20 Z M78 32 A 4 4 0 1 0 78 24 A 4 4 0 1 0 78 32 Z',
  },
  {
    id: 'crest_laurel_wreath',
    name: 'Laurel Victory Wreath',
    category: 'Crest & Heraldry',
    viewBox: '0 0 100 100',
    path: 'M50 85 C32 85 18 70 18 50 C18 36 26 24 35 18 C32 28 35 38 42 45 C35 52 35 65 42 74 C44 77 47 80 50 85 Z M50 85 C68 85 82 70 82 50 C82 36 74 24 65 18 C68 28 65 38 58 45 C65 52 65 65 58 74 C56 77 53 80 50 85 Z M48 20 L52 20 L50 12 Z',
  },
  {
    id: 'crest_classic_shield',
    name: 'Heritage Crest Shield',
    category: 'Crest & Heraldry',
    viewBox: '0 0 100 100',
    path: 'M50 10 C70 10 88 18 88 18 L88 56 C88 74 50 92 50 92 C50 92 12 74 12 56 L12 18 C12 18 30 10 50 10 Z M50 22 C35 22 24 28 24 28 L24 54 C24 68 50 80 50 80 C50 80 76 68 76 54 L76 28 C76 28 65 22 50 22 Z M50 32 L58 46 L74 46 L62 56 L66 72 L50 62 L34 72 L38 56 L26 46 L42 46 Z',
  },
  {
    id: 'crest_winged_mark',
    name: 'Sovereign Wings',
    category: 'Crest & Heraldry',
    viewBox: '0 0 100 100',
    path: 'M50 35 C38 20 18 24 10 38 C20 42 32 40 40 48 C28 50 18 60 14 74 C26 70 38 64 45 58 L50 78 L55 58 C62 64 74 70 86 74 C82 60 72 50 60 48 C68 40 80 42 90 38 C82 24 62 20 50 35 Z',
  },

  // Nature & Eco
  {
    id: 'nature_dual_leaf',
    name: 'Bio Sprout & Leaf',
    category: 'Nature & Eco',
    viewBox: '0 0 100 100',
    path: 'M50 88 C50 88 48 55 30 38 C12 21 16 8 36 10 C56 12 65 38 50 88 Z M50 88 C50 88 55 58 72 45 C88 32 94 45 88 60 C80 75 62 85 50 88 Z',
  },
  {
    id: 'nature_mountain_peaks',
    name: 'Majestic Peaks',
    category: 'Nature & Eco',
    viewBox: '0 0 100 100',
    path: 'M50 15 L88 78 L12 78 Z M50 36 L68 68 L32 68 Z M68 45 L95 86 L41 86 Z',
  },
  {
    id: 'nature_solar_sunburst',
    name: 'Radiant Sun',
    category: 'Nature & Eco',
    viewBox: '0 0 100 100',
    path: 'M50 30 A 20 20 0 1 0 50 70 A 20 20 0 1 0 50 30 Z M50 8 V20 M50 80 V92 M8 50 H20 M80 50 H92 M20 20 L28 28 M72 72 L80 80 M80 20 L72 28 M28 72 L20 80',
  },
  {
    id: 'nature_clean_droplet',
    name: 'Aqua Droplet',
    category: 'Nature & Eco',
    viewBox: '0 0 100 100',
    path: 'M50 12 C50 12 80 48 80 66 C80 82 66 92 50 92 C34 92 20 82 20 66 C20 48 50 12 50 12 Z M50 28 C42 45 32 60 32 68 C32 78 40 84 50 84 C44 76 44 58 50 28 Z',
  },
  {
    id: 'nature_fire_flame',
    name: 'Ignite Flame',
    category: 'Nature & Eco',
    viewBox: '0 0 100 100',
    path: 'M50 10 C62 28 78 46 78 66 C78 82 66 92 50 92 C34 92 22 82 22 66 C22 52 32 38 42 26 C40 38 48 48 54 48 C58 48 60 42 58 35 C58 26 54 18 50 10 Z M50 48 C58 58 64 68 64 76 C64 84 58 88 50 88 C42 88 36 84 36 76 C36 68 44 58 50 48 Z',
  },

  // Animals & Mascots
  {
    id: 'animal_soaring_falcon',
    name: 'Falcon Hunter',
    category: 'Animals & Mascots',
    viewBox: '0 0 100 100',
    path: 'M50 18 C40 28 25 35 10 40 C22 45 35 48 44 54 C32 58 18 68 12 82 C28 78 44 70 50 64 C56 70 72 78 88 82 C82 68 68 58 56 54 C65 48 78 45 90 40 C75 35 60 28 50 18 Z M50 38 L54 48 L50 52 L46 48 Z',
  },
  {
    id: 'animal_wolf_apex',
    name: 'Apex Wolf Silhouette',
    category: 'Animals & Mascots',
    viewBox: '0 0 100 100',
    path: 'M50 15 L62 32 L78 30 L68 45 L80 60 L62 60 L50 85 L38 60 L20 60 L32 45 L22 30 L38 32 Z M50 35 L58 48 L42 48 Z',
  },
  {
    id: 'animal_lion_monarch',
    name: 'Lion Monarch Head',
    category: 'Animals & Mascots',
    viewBox: '0 0 100 100',
    path: 'M50 15 C60 15 75 22 82 35 C88 48 85 62 76 74 C68 85 58 88 50 88 C42 88 32 85 24 74 C15 62 12 48 18 35 C25 22 40 15 50 15 Z M50 28 C42 28 32 35 32 45 C32 58 44 72 50 78 C56 72 68 58 68 45 C68 35 58 28 50 28 Z M42 45 L50 54 L58 45 Z',
  },
  {
    id: 'animal_panther_stealth',
    name: 'Stealth Panther',
    category: 'Animals & Mascots',
    viewBox: '0 0 100 100',
    path: 'M25 35 L40 22 L50 32 L60 22 L75 35 C70 50 65 65 50 82 C35 65 30 50 25 35 Z M36 42 L44 48 L36 50 Z M64 42 L56 48 L64 50 Z M50 56 L46 64 L54 64 Z',
  },

  // Minimalist & Monograms
  {
    id: 'mini_interlocking_v',
    name: 'Double Chevron Apex',
    category: 'Minimalist',
    viewBox: '0 0 100 100',
    path: 'M50 18 L85 52 L72 64 L50 42 L28 64 L15 52 Z M50 48 L85 82 L72 94 L50 72 L28 94 L15 82 Z',
  },
  {
    id: 'mini_geometric_k',
    name: 'Dynamic K Prism',
    category: 'Minimalist',
    viewBox: '0 0 100 100',
    path: 'M25 15 H40 V85 H25 Z M45 48 L75 15 H92 L58 52 Z M55 48 L92 85 H74 L42 54 Z',
  },
  {
    id: 'mini_bold_m',
    name: 'Architectural M',
    category: 'Minimalist',
    viewBox: '0 0 100 100',
    path: 'M15 15 H32 L50 54 L68 15 H85 V85 H70 V42 L54 74 H46 L30 42 V85 H15 Z',
  },
  {
    id: 'mini_spiral_orbit',
    name: 'Nexus Orbit',
    category: 'Minimalist',
    viewBox: '0 0 100 100',
    path: 'M50 12 A 38 38 0 1 0 88 50 H74 A 24 24 0 1 1 50 26 Z M50 36 A 14 14 0 1 0 64 50 H50 Z',
  },
  {
    id: 'mini_camera_lens',
    name: 'Aperture Shutter',
    category: 'Minimalist',
    viewBox: '0 0 100 100',
    path: 'M50 10 A 40 40 0 1 0 90 50 A 40 40 0 1 0 50 10 Z M50 22 L72 35 L62 58 L32 58 L24 38 Z',
  },

  // Badges & Enclosures
  {
    id: 'badge_starburst_seal',
    name: 'Certified Starburst',
    category: 'Badges',
    viewBox: '0 0 100 100',
    path: 'M50 5 L60 18 L76 14 L80 30 L95 35 L90 50 L95 65 L80 70 L76 86 L60 82 L50 95 L40 82 L24 86 L20 70 L5 65 L10 50 L5 35 L20 30 L24 14 L40 18 Z',
  },
  {
    id: 'badge_double_ring',
    name: 'Classic Academy Ring',
    category: 'Badges',
    viewBox: '0 0 100 100',
    path: 'M50 10 A 40 40 0 1 0 50 90 A 40 40 0 1 0 50 10 Z M50 18 A 32 32 0 1 1 50 82 A 32 32 0 1 1 50 18 Z M50 26 A 24 24 0 1 0 50 74 A 24 24 0 1 0 50 26 Z',
  },
  {
    id: 'badge_shield_enclosure',
    name: 'Knight Shield Border',
    category: 'Badges',
    viewBox: '0 0 100 100',
    path: 'M50 8 L88 22 V54 C88 74 50 94 50 94 C50 94 12 74 12 54 V22 Z M50 18 L80 30 V52 C80 68 50 84 50 84 C50 84 20 68 20 52 V30 Z',
  },
];
