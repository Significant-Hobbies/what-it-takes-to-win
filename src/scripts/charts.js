// Client-side chart helpers using ECharts. Loaded via <script> on pages that need charts.
// Exposes window.initChart(elementId, option) and registers a global init queue.

import * as echarts from "echarts";

const charts = new Map();

window.addEventListener("resize", () => {
  charts.forEach((c) => c.resize());
});

export function initChart(id, option) {
  const el = document.getElementById(id);
  if (!el) return;
  let chart = charts.get(id);
  if (!chart) {
    chart = echarts.init(el, null, { renderer: "canvas" });
    charts.set(id, chart);
  }
  chart.setOption(option);
  return chart;
}

window.initChart = initChart;

window.disposeCharts = function () {
  charts.forEach((c) => c.dispose());
  charts.clear();
};

// Dark theme defaults
export const chartTheme = {
  textColor: "#9aa3b2",
  axisLineColor: "#232a3a",
  splitLineColor: "#1c2230",
  palette: ["#7c9cff", "#5fd3bc", "#f0a36b", "#e879a6", "#f0c36b", "#a78bfa", "#67e8f9", "#fb7185"],
};

window.chartTheme = chartTheme;
