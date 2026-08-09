import { HeatmapChart, ScatterChart } from "echarts/charts";
import { VisualMapComponent } from "echarts/components";
import { initChart as initRuntimeChart, useChartModules } from "./chart-runtime.js";

useChartModules([HeatmapChart, ScatterChart, VisualMapComponent]);

window.initChart = initRuntimeChart;

export function initChart(...args) {
  return initRuntimeChart(...args);
}
