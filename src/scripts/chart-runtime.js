import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([GridComponent, TooltipComponent, CanvasRenderer]);

const charts = new Map();

window.addEventListener("resize", () => {
  charts.forEach((chart) => chart.resize());
});

export function initChart(id, option) {
  const element = document.getElementById(id);
  if (!element) return;
  let chart = charts.get(id);
  if (!chart) {
    chart = echarts.init(element, null, { renderer: "canvas" });
    charts.set(id, chart);
  }
  chart.setOption(option);
  return chart;
}

export function useChartModules(modules) {
  echarts.use(modules);
}

window.disposeCharts = function () {
  charts.forEach((chart) => chart.dispose());
  charts.clear();
};
