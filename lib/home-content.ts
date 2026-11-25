/*
  Homepage copy and structure (design direction A, "Index"). Client-safe:
  plain data, no fetching. Build-time data (essays, Are.na channels) is
  joined onto this in pages/index.tsx.
*/

export type AreaKey = "historiography" | "sensemaking" | "permaculture" | "technology";

export const SUBSTACK_URL = "https://suruleredotdev.substack.com/";
export const ARENA_PROFILE_URL = "https://www.are.na/korede-aderele";
export const GITHUB_URL = "https://github.com/suruleredotdev";
export const TWITTER_URL = "https://twitter.com/suruleredotdev";

export const hero = {
  eyebrow: "surulere.dev — essays, tools & archives",
  title: "A space for critical thinking on African futures.",
  description:
    "Essays and visualizations to help us think critically about our ever-changing reality in the 2020s and build a better future for ourselves.",
};

export type AreaLink = { title: string; kind: string; href: string };

export type Area = {
  key: AreaKey;
  code: string;
  title: string;
  subtitle?: string;
  /** Matched against the Are.na channel title at build time. */
  channelTitle: string;
  /** Used when the build couldn't read the channel from Are.na. */
  fallbackUrl: string;
  /** Tools and research that grew out of the area. Essays are added by slug. */
  links: AreaLink[];
};

export const areas: Area[] = [
  {
    key: "historiography",
    code: "R.01",
    title: "Historiography",
    channelTitle: "Historiography",
    fallbackUrl: "https://www.are.na/korede-aderele/historiography-kr29u84pivs",
    links: [
      { title: "Atlas", kind: "Tool · States, cities & trade routes", href: "https://github.com/suruleredotdev/atlas" },
    ],
  },
  {
    key: "sensemaking",
    code: "R.02",
    title: "Sensemaking",
    subtitle: "Knowledge systems",
    channelTitle: "Sensemaking",
    fallbackUrl: ARENA_PROFILE_URL,
    links: [
      {
        title: "Symbolic motif analysis",
        kind: "Research · In progress",
        href: "https://github.com/suruleredotdev/symbolic-motif-analysis",
      },
    ],
  },
  {
    key: "permaculture",
    code: "R.03",
    title: "Permaculture",
    channelTitle: "Permaculture",
    fallbackUrl: "https://www.are.na/korede-aderele/permaculture-gndkdg_ckpc",
    links: [],
  },
  {
    key: "technology",
    code: "R.04",
    title: "Technology",
    channelTitle: "Technology",
    fallbackUrl: ARENA_PROFILE_URL,
    links: [
      { title: "African Artifacts Index", kind: "Tool", href: "https://artifacts-index.surulere.dev" },
      { title: "Archive 3D", kind: "Tool", href: "https://archive-3d.surulere.dev" },
      { title: "Map Tool", kind: "Tool", href: "https://map-tool.surulere.dev" },
    ],
  },
];

/**
 * Essay → research area, keyed by the Substack post slug or, for posts on
 * this site, the Notion page path. A first guess from the design review;
 * edit freely.
 */
export const essayAreas: Record<string, AreaKey> = {
  "how-we-understanding-archives-in": "sensemaking",
  "african-symbolism-inquiry": "sensemaking",
  "world-building-and-cosmology": "sensemaking",
  "why-study-african-history": "historiography",
  "on-yoruba-art-as-historic-storytelling": "historiography",
  "indexing-african-artifacts": "technology",
  "archiving-with-arena": "technology",
  // Notion posts on surulere.dev
  "nigeria-agriculture": "permaculture",
};

export const areaTitle = (key?: AreaKey) => areas.find((a) => a.key === key)?.title;

export const tools = [
  {
    area: "technology" as AreaKey,
    title: "African Artifacts Index",
    url: "https://artifacts-index.surulere.dev",
    image: "/artifacts-index-preview.png",
    alt: "African Artifacts Index search screen",
    description: "Cross-cultural index of museum collections for discovery and comparative analysis.",
  },
  {
    area: "technology" as AreaKey,
    title: "Archive 3D",
    url: "https://archive-3d.surulere.dev",
    image: "/archive-3d-preview.jpeg",
    alt: "Archive 3D graph of linked references",
    description: "Visualize and explore vector-similar archives in 3D.",
  },
  {
    area: "technology" as AreaKey,
    title: "Map Tool",
    url: "https://map-tool.surulere.dev",
    image: "/map-tool-preview.png",
    alt: "Map Tool showing a map of the West African coast",
    description: "Simple tool to view and share maps on the web.",
  },
];

export const researchInProgress = {
  label: "Research in progress · Sensemaking",
  title: "Symbolic motif analysis",
  description: "Comparing recurring motifs across the Frobenius panel-art collection.",
  stat: "144 motif crops · 22 families",
  href: "https://github.com/suruleredotdev/symbolic-motif-analysis",
};

export const footer = {
  line: "Essays, tools and archives for thinking critically about African futures.",
  groups: [
    { label: "Read", links: [{ label: "Substack", href: SUBSTACK_URL }, { label: "Essays", href: "#essays" }] },
    { label: "Build", links: [{ label: "GitHub", href: GITHUB_URL }, { label: "Tools", href: "#tools" }] },
    { label: "Collect", links: [{ label: "Are.na", href: ARENA_PROFILE_URL }, { label: "X / Twitter", href: TWITTER_URL }] },
  ],
};
