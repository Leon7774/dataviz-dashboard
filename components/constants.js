// Political Party mapping for 19th Congress Senators
export const PARTY_MAP = {
  "Zubiri": "Independent",
  "Hontiveros": "Akbayan",
  "Tulfo": "Independent",
  "Gatchalian": "NPC",
  "Legarda": "NPC",
  "Poe": "Independent",
  "Revilla": "Lakas-CMD",
  "Dela Rosa": "PDP-Laban",
  "Ejercito": "NPC",
  "Estrada": "PMP",
  "Escudero": "NPC",
  "Tolentino": "PDP-Laban",
  "Villanueva": "Independent",
  "Pimentel": "PDP-Laban",
  "Angara": "LDP",
  "Padilla": "PDP-Laban",
  "Go": "PDP-Laban",
  "Lapid": "NPC",
  "Villar, M.": "Nacionalista",
  "Cayetano, P.": "Nacionalista",
  "Binay": "UNA",
  "Cayetano, A.": "Independent",
  "Villar, C.": "Nacionalista",
  "Marcos": "Nacionalista"
};

// Distinct colors for political parties
export const PARTY_COLORS = {
  "Independent": "#6b7280",   // Cool Gray
  "Akbayan": "#ef4444",       // Crimson Red
  "NPC": "#10b981",           // Emerald Green
  "Lakas-CMD": "#a855f7",     // Amethyst Purple
  "PDP-Laban": "#3b82f6",     // Royal Blue
  "PMP": "#eab308",           // Gold/Yellow
  "LDP": "#06b6d4",           // Cyan
  "Nacionalista": "#f97316",   // Amber Orange
  "UNA": "#ec4899"            // Rose Pink
};

// Community colors (vibrant and distinct)
export const COMMUNITY_COLORS = [
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
];

// Color implications explanations for research
export const COLOR_IMPLICATIONS = {
  community: {
    title: "Collaboration Blocs",
    description: "Groups identified by a modularity clustering algorithm. Senators within the same bloc frequently co-sponsor the same ICT bills, showing informal legislative networks."
  },
  party: {
    title: "Political Parties",
    description: "Official political party affiliations. Comparing party colors with collaboration blocs shows if partnerships cross official party lines (bipartisanship vs. partisan voting)."
  }
};

// Centrality explanations for researchers
export const METRIC_EXPLANATIONS = {
  degree: {
    title: "Degree Centrality",
    description: "Measures the proportion of senators a legislator has collaborated with. A high degree indicates a senator who co-sponsors bills with a wide range of colleagues."
  },
  betweenness: {
    title: "Betweenness Centrality",
    description: "Measures how often a senator lies on the shortest collaboration paths between other senators. High betweenness indicates key 'bridge' actors who link different factions or cliques."
  },
  sharedBills: {
    title: "Shared Bills",
    description: "The total count of ICT bills co-sponsored or authored in partnership with others. Larger nodes indicate more active legislative output."
  }
};
