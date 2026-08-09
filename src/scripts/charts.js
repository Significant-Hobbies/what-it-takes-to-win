// Client-side chart helpers using ECharts. Loaded via <script> on pages that need charts.
// Exposes window.initChart(elementId, option) and registers a global init queue.

import { BarChart, PieChart } from "echarts/charts";
import { initChart as initRuntimeChart, useChartModules } from "./chart-runtime.js";

useChartModules([BarChart, PieChart]);

export function initChart(...args) {
  return initRuntimeChart(...args);
}

window.initChart = initRuntimeChart;

// Dark theme defaults
export const chartTheme = {
  textColor: "#9aa3b2",
  axisLineColor: "#232a3a",
  splitLineColor: "#1c2230",
  palette: ["#7c9cff", "#5fd3bc", "#f0a36b", "#e879a6", "#f0c36b", "#a78bfa", "#67e8f9", "#fb7185"],
};

window.chartTheme = chartTheme;
