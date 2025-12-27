// Color Palettes for Serena Hotels Dashboard

// ============================================================================
// Brand Colors
// ============================================================================

export const serenaBrand = {
  // Primary Greens (Serena Hotels brand)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',  // Main brand color
    900: '#14532d',
    950: '#052e16',
  },

  // Warm Neutrals (complementing earth tones)
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
} as const;

// ============================================================================
// Land Cover Colors
// ============================================================================

export const landCoverColors = {
  treeCanopy: '#166534',   // Dark forest green
  greenArea: '#4ade80',    // Light vibrant green
  barrenLand: '#d6b88c',   // Sandy beige
  wetLand: '#06b6d4',      // Cyan/teal
  water: '#0ea5e9',        // Sky blue
  buildup: '#94a3b8',      // Slate gray
  snow: '#f1f5f9',         // Light gray/white
  rock: '#78716c',         // Stone gray
  solarPanels: '#1e3a5f',  // Dark navy blue
} as const;

// Land cover with labels for charts
export const landCoverConfig = [
  { key: 'treeCanopy', label: 'Tree Canopy', color: landCoverColors.treeCanopy },
  { key: 'greenArea', label: 'Green Area', color: landCoverColors.greenArea },
  { key: 'barrenLand', label: 'Barren Land', color: landCoverColors.barrenLand },
  { key: 'wetLand', label: 'Wetland', color: landCoverColors.wetLand },
  { key: 'water', label: 'Water', color: landCoverColors.water },
  { key: 'buildup', label: 'Built-up', color: landCoverColors.buildup },
  { key: 'snow', label: 'Snow', color: landCoverColors.snow },
  { key: 'rock', label: 'Rock', color: landCoverColors.rock },
  { key: 'solarPanels', label: 'Solar Panels', color: landCoverColors.solarPanels },
] as const;

// ============================================================================
// Category Accent Colors
// ============================================================================

export const categoryColors = {
  PLANTATION: '#22c55e',   // Green
  SOLAR: '#f97316',        // Orange
  COMMUNITY: '#3b82f6',    // Blue
  WASTE: '#eab308',        // Amber/yellow
  SEWAGE: '#06b6d4',       // Cyan
  RESTORATION: '#8b5cf6',  // Purple
} as const;

export const categoryConfig = [
  { type: 'PLANTATION', label: 'Plantation', color: categoryColors.PLANTATION, icon: 'Trees' },
  { type: 'SOLAR', label: 'Solar Energy', color: categoryColors.SOLAR, icon: 'Sun' },
  { type: 'COMMUNITY', label: 'Community', color: categoryColors.COMMUNITY, icon: 'Users' },
  { type: 'WASTE', label: 'Waste Management', color: categoryColors.WASTE, icon: 'Recycle' },
  { type: 'SEWAGE', label: 'Sewage Treatment', color: categoryColors.SEWAGE, icon: 'Droplets' },
  { type: 'RESTORATION', label: 'Restoration', color: categoryColors.RESTORATION, icon: 'Leaf' },
] as const;

// ============================================================================
// Chart Colors
// ============================================================================

export const chartColors = {
  primary: serenaBrand.primary[800],
  secondary: serenaBrand.primary[500],
  tertiary: serenaBrand.primary[300],
  accent: '#f97316',
  muted: serenaBrand.neutral[400],
  background: serenaBrand.neutral[50],
  border: serenaBrand.neutral[200],
  text: serenaBrand.neutral[900],
  textMuted: serenaBrand.neutral[500],
} as const;

// ============================================================================
// Map Colors
// ============================================================================

export const mapColors = {
  vectorFill: 'rgba(22, 101, 52, 0.2)',      // Semi-transparent green
  vectorStroke: '#166534',                    // Dark green border
  vectorHover: 'rgba(22, 101, 52, 0.4)',     // Darker on hover
  selectedFill: 'rgba(249, 115, 22, 0.3)',   // Orange for selected
  selectedStroke: '#f97316',                  // Orange border
  rasterOverlay: 'rgba(255, 255, 255, 0.1)', // Light overlay for raster
} as const;

// ============================================================================
// Status Colors
// ============================================================================

export const statusColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

export function getCategoryColor(type: string): string {
  return categoryColors[type as keyof typeof categoryColors] || serenaBrand.primary[500];
}

export function getLandCoverColor(key: string): string {
  return landCoverColors[key as keyof typeof landCoverColors] || serenaBrand.neutral[400];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// Tailwind CSS Class Helpers
// ============================================================================

export const tailwindColors = {
  primary: 'bg-green-800 text-white hover:bg-green-700',
  primaryLight: 'bg-green-100 text-green-800',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
  accent: 'bg-orange-500 text-white hover:bg-orange-600',
  muted: 'bg-stone-50 text-stone-600',
  card: 'bg-white border border-stone-200 shadow-sm',
  cardHover: 'bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow',
} as const;
