// Chart.js Configuration for Serena Hotels Dashboard

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartOptions, TooltipItem } from "chart.js";
import { serenaBrand, landCoverColors } from "./colorPalettes";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set global defaults
ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif";
ChartJS.defaults.color = serenaBrand.neutral[600];

// ============================================================================
// Doughnut/Pie Chart Options
// ============================================================================

export const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "right",
      align: "center",
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: "circle",
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: serenaBrand.neutral[900],
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: TooltipItem<"doughnut">) => {
          const value = context.parsed;
          return ` ${context.label}: ${value.toFixed(1)}%`;
        },
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 800,
    easing: "easeOutQuart",
  },
};

// ============================================================================
// Bar Chart Options
// ============================================================================

export const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: serenaBrand.neutral[900],
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: serenaBrand.neutral[200],
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  animation: {
    duration: 600,
    easing: "easeOutQuart",
  },
};

// ============================================================================
// Horizontal Bar Chart Options
// ============================================================================

export const horizontalBarOptions: ChartOptions<"bar"> = {
  ...barOptions,
  indexAxis: "y" as const,
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: serenaBrand.neutral[200],
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

// ============================================================================
// Line Chart Options
// ============================================================================

export const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: "circle",
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: serenaBrand.neutral[900],
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: serenaBrand.neutral[200],
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
  animation: {
    duration: 800,
    easing: "easeOutQuart",
  },
};

// ============================================================================
// Stacked Bar Chart Options
// ============================================================================

export const stackedBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: "rectRounded",
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: serenaBrand.neutral[900],
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
      mode: "index",
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: 100,
      grid: {
        color: serenaBrand.neutral[200],
      },
      ticks: {
        font: {
          size: 11,
        },
        callback: (value) => `${value}%`,
      },
    },
  },
  animation: {
    duration: 600,
    easing: "easeOutQuart",
  },
};

// ============================================================================
// Land Cover Colors for Charts
// ============================================================================

export const landCoverChartColors = [
  landCoverColors.treeCanopy,
  landCoverColors.greenArea,
  landCoverColors.barrenLand,
  landCoverColors.wetLand,
  landCoverColors.water,
  landCoverColors.buildup,
  landCoverColors.snow,
  landCoverColors.rock,
  landCoverColors.solarPanels,
];

export const landCoverLabels = [
  "Tree Canopy",
  "Green Area",
  "Barren Land",
  "Wetland",
  "Water",
  "Built-up",
  "Snow",
  "Rock",
  "Solar Panels",
];
