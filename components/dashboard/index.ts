// Dashboard Components - Serena Hotels GIS Dashboard

// Main page component
export { default as DashboardPage } from "./DashboardPage";

// Filter and navigation
export { default as FilterRow } from "./FilterRow";

// Map components
export { default as DashboardMap } from "./DashboardMap";
export { default as MapToggleButtons } from "./MapToggleButtons";
export { default as YearSlider } from "./YearSlider";

// Chart and visualization components
export { default as LandCoverChart } from "./LandCoverChart";
export { default as CategoryMetrics } from "./CategoryMetrics";

// Summary and detail components
export { default as SummarySection } from "./SummarySection";
export { default as SiteDetailsPanel } from "./SiteDetailsPanel";

// Hooks
export { useDashboard } from "./hooks/useDashboard";
export type { UseDashboardReturn } from "./hooks/useDashboard";

// Types
export * from "./types";

// Utilities
export * from "./utils/colorPalettes";
export * from "./utils/chartConfig";
