import {
  calculateRoi,
  EFFORT_STAGES,
  type EffortStage,
  type InvestmentItem,
  type InvestmentKind,
  type Outcome,
} from "../lib/roi";
import { escapeAttribute, numberValue, parseNumber, selected } from "./roi-dom-utils";

type UnitKey = "USD" | "INR" | "EUR" | "hours" | "points" | "custom";
type UiInvestment = InvestmentItem & { id: number };
type UiOutcome = Outcome & { id: number };

class RoiCalculator {
  private readonly root: HTMLElement;
  private readonly investmentRows: HTMLElement;
  private readonly outcomeRows: HTMLElement;
  private readonly actionInput: HTMLInputElement;
  private readonly unitSelect: HTMLSelectElement;
  private readonly customUnitField: HTMLElement;
  private readonly customUnitInput: HTMLInputElement;
  private readonly clearButton: HTMLButtonElement;
  private readonly liveStatus: HTMLElement;
  private readonly touchedFields = new Set<string>();

  private nextId = 1;
  private action = "";
  private unit: UnitKey;
  private customUnit: string;
  private investments: UiInvestment[];
  private outcomes: UiOutcome[];
  private clearTimer: number | undefined;
  private lastAnnouncement = "";

  static mount(root: HTMLElement) {
    return new RoiCalculator(root);
  }

  constructor(root: HTMLElement) {
    this.root = root;
    this.investmentRows = this.required("#roi-investment-rows");
    this.outcomeRows = this.required("#roi-outcome-rows");
    this.actionInput = this.required("#roi-action");
    this.unitSelect = this.required("#roi-unit");
    this.customUnitField = this.required("#roi-custom-unit-field");
    this.customUnitInput = this.required("#roi-custom-unit");
    this.clearButton = this.required("[data-clear-all]");
    this.liveStatus = this.required("#roi-live-status");
    this.unit = this.unitSelect.value as UnitKey;
    this.customUnit = this.customUnitInput.value;
    this.investments = [this.blankInvestment()];
    this.outcomes = [this.blankOutcome()];
    this.attachListeners();
    this.renderAll();
  }

  private required<T extends Element>(selector: string) {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`ROI calculator markup is missing ${selector}.`);
    return element;
  }

  private blankInvestment(): UiInvestment {
    return {
      id: this.nextId++,
      label: "",
      kind: "time",
      stage: "",
      quantity: Number.NaN,
      valuePerUnit: Number.NaN,
    };
  }

  private blankOutcome(): UiOutcome {
    return {
      id: this.nextId++,
      label: "",
      probability: Number.NaN,
      value: Number.NaN,
    };
  }

  private investmentMarkup(item: UiInvestment, index: number) {
    const unitLabel = this.currentUnitLabel();
    return `
      <div class="roi-row roi-investment-grid" data-investment-row="${index}">
        <div class="roi-cell roi-label-cell">
          <label class="roi-mobile-label" for="investment-label-${item.id}">Investment</label>
          <input id="investment-label-${item.id}" data-investment-index="${index}" data-field="label" type="text" value="${escapeAttribute(item.label)}" placeholder="e.g. Research time" autocomplete="off" aria-label="Investment ${index + 1} name" />
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="investment-kind-${item.id}">Type</label>
          <select id="investment-kind-${item.id}" data-investment-index="${index}" data-field="kind" aria-label="Investment ${index + 1} type">
            <option value="time"${selected("time", item.kind)}>Time</option>
            <option value="money"${selected("money", item.kind)}>Money</option>
            <option value="resource"${selected("resource", item.kind)}>Resource</option>
          </select>
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="investment-stage-${item.id}">Where value lands</label>
          <select id="investment-stage-${item.id}" data-investment-index="${index}" data-field="stage" aria-label="Investment ${index + 1} allocation stage" aria-describedby="roi-stage-guide">
            <option value=""${selected("", item.stage)}>Choose a stage</option>
            ${EFFORT_STAGES.map((stage) => `<option value="${stage.key}"${selected(stage.key, item.stage)}>${stage.label}</option>`).join("")}
          </select>
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="investment-quantity-${item.id}">Quantity</label>
          <input id="investment-quantity-${item.id}" data-investment-index="${index}" data-field="quantity" type="number" min="0" step="any" inputmode="decimal" value="${numberValue(item.quantity)}" placeholder="0" aria-label="Investment ${index + 1} quantity" />
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="investment-value-${item.id}">Value each (${unitLabel})</label>
          <input id="investment-value-${item.id}" data-investment-index="${index}" data-field="valuePerUnit" type="number" min="0" step="any" inputmode="decimal" value="${numberValue(item.valuePerUnit)}" placeholder="0" aria-label="Investment ${index + 1} value per unit in ${unitLabel}" />
        </div>
        <div class="roi-cell roi-cell-output">
          <span class="roi-mobile-label">Subtotal (${unitLabel})</span>
          <output data-investment-subtotal="${index}">—</output>
        </div>
        <button type="button" class="roi-remove-button" data-remove-investment="${index}" aria-label="Remove investment ${index + 1}">×</button>
      </div>
    `;
  }

  private outcomeMarkup(outcome: UiOutcome, index: number) {
    const unitLabel = this.currentUnitLabel();
    return `
      <div class="roi-row roi-outcome-grid" data-outcome-row="${index}">
        <div class="roi-cell roi-label-cell">
          <label class="roi-mobile-label" for="outcome-label-${outcome.id}">Outcome</label>
          <input id="outcome-label-${outcome.id}" data-outcome-index="${index}" data-field="label" type="text" value="${escapeAttribute(outcome.label)}" placeholder="e.g. Modest demand" autocomplete="off" aria-label="Outcome ${index + 1} name" />
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="outcome-probability-${outcome.id}">Probability %</label>
          <input id="outcome-probability-${outcome.id}" data-outcome-index="${index}" data-field="probability" type="number" min="0" max="100" step="0.01" inputmode="decimal" value="${numberValue(outcome.probability)}" placeholder="0" aria-label="Outcome ${index + 1} probability percent" />
        </div>
        <div class="roi-cell">
          <label class="roi-mobile-label" for="outcome-value-${outcome.id}">Total value (${unitLabel})</label>
          <input id="outcome-value-${outcome.id}" data-outcome-index="${index}" data-field="value" type="number" step="any" inputmode="decimal" value="${numberValue(outcome.value)}" placeholder="0" aria-label="Outcome ${index + 1} total value in ${unitLabel}" />
        </div>
        <div class="roi-cell roi-cell-output roi-contribution-cell">
          <span class="roi-mobile-label">EV contribution (${unitLabel})</span>
          <output data-outcome-contribution="${index}">—</output>
        </div>
        <button type="button" class="roi-remove-button" data-remove-outcome="${index}" aria-label="Remove outcome ${index + 1}">×</button>
      </div>
    `;
  }

  private renderRows() {
    this.investmentRows.innerHTML = this.investments
      .map((item, index) => this.investmentMarkup(item, index))
      .join("");
    this.outcomeRows.innerHTML = this.outcomes
      .map((outcome, index) => this.outcomeMarkup(outcome, index))
      .join("");
  }

  private currentUnit() {
    if (this.unit === "USD") return { prefix: "$", suffix: "" };
    if (this.unit === "INR") return { prefix: "₹", suffix: "" };
    if (this.unit === "EUR") return { prefix: "€", suffix: "" };
    if (this.unit === "hours") return { prefix: "", suffix: " h" };
    if (this.unit === "points") return { prefix: "", suffix: " pts" };
    return { prefix: "", suffix: ` ${this.customUnit.trim() || "units"}` };
  }

  private currentUnitLabel() {
    if (this.unit === "custom") return this.customUnit.trim() || "units";
    if (this.unit === "points") return "value points";
    return this.unit;
  }

  private updateUnitLabels() {
    const label = this.currentUnitLabel();
    this.root.querySelectorAll<HTMLElement>("[data-unit-label]").forEach((element) => {
      element.textContent = `${element.dataset.unitLabel} (${label})`;
    });
  }

  private formatNumber(value: number, maximumFractionDigits = 2) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
  }

  private formatValue(value: number) {
    if (!Number.isFinite(value)) return "—";
    const { prefix, suffix } = this.currentUnit();
    const sign = value < 0 ? "−" : "";
    return `${sign}${prefix}${this.formatNumber(Math.abs(value))}${suffix}`;
  }

  private formatPercent(value: number, signed = false) {
    if (!Number.isFinite(value)) return "—";
    const sign = signed && value > 0 ? "+" : value < 0 ? "−" : "";
    return `${sign}${this.formatNumber(Math.abs(value))}%`;
  }

  private setText(selector: string, value: string) {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = value;
  }

  private setInvalidFields(summary: ReturnType<typeof calculateRoi>) {
    this.root.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((element) => {
      element.removeAttribute("aria-invalid");
    });
    for (const issue of summary.issues) {
      if (issue.index === undefined || !issue.field) continue;
      const indexName = issue.scope === "investment" ? "investment" : "outcome";
      if (!this.touchedFields.has(`${indexName}:${issue.index}:${issue.field}`)) continue;
      this.root
        .querySelector<HTMLElement>(
          `[data-${indexName}-index="${issue.index}"][data-field="${issue.field}"]`,
        )
        ?.setAttribute("aria-invalid", "true");
    }
  }

  private renderAllocation(summary: ReturnType<typeof calculateRoi>) {
    const allocationList = this.root.querySelector<HTMLElement>("#roi-allocation-list");
    if (!allocationList) return;
    for (const stage of summary.stageAllocations) {
      const segment = this.root.querySelector<HTMLElement>(
        `[data-stage-segment="${stage.key}"]`,
      );
      if (segment) segment.style.width = `${stage.share}%`;
    }
    allocationList.innerHTML = summary.stageAllocations
      .map(
        (stage) => `
          <div class="${stage.key}">
            <i aria-hidden="true"></i>
            <dt>${stage.label}</dt>
            <dd>${this.formatValue(stage.value)} · ${this.formatPercent(stage.share)}</dd>
          </div>
        `,
      )
      .join("");
    this.setText("#roi-allocation-total", `${this.formatValue(summary.totalInvestment)} valued`);
  }

  private renderContributions(summary: ReturnType<typeof calculateRoi>) {
    const list = this.root.querySelector<HTMLElement>("#roi-contribution-list");
    if (!list) return;
    const visible = summary.outcomeContributions.filter(
      (outcome) => outcome.label.trim() || Number.isFinite(outcome.probability),
    );
    if (visible.length === 0) {
      list.innerHTML = "<p>Add outcomes to see their weight.</p>";
      return;
    }
    const maximum = Math.max(...visible.map((item) => Math.abs(item.contribution)), 1);
    list.innerHTML = visible
      .map((outcome) => this.contributionMarkup(outcome, maximum))
      .join("");
  }

  private contributionMarkup(
    outcome: ReturnType<typeof calculateRoi>["outcomeContributions"][number],
    maximum: number,
  ) {
    const magnitude = Math.min(100, (Math.abs(outcome.contribution) / maximum) * 100);
    const sign = outcome.contribution < 0 ? "negative" : "positive";
    return `
      <div class="roi-contribution-row">
        <strong>${escapeAttribute(outcome.label.trim() || "Unnamed outcome")}</strong>
        <span>${this.formatValue(outcome.contribution)}</span>
        <div class="roi-contribution-track" data-sign="${sign}" role="img" aria-label="Expected value contribution ${this.formatValue(outcome.contribution)}"><i style="--magnitude:${magnitude}%"></i></div>
      </div>
    `;
  }

  private renderResult(summary: ReturnType<typeof calculateRoi>) {
    const result = summary.result;
    const proofStatus = this.root.querySelector<HTMLElement>("#roi-proof-status");
    const roiOutput = this.root.querySelector<HTMLOutputElement>("#roi-expected-roi");
    if (proofStatus) proofStatus.dataset.state = result ? "complete" : "incomplete";
    if (roiOutput) roiOutput.removeAttribute("data-sign");
    if (!result) {
      this.renderIncompleteResult(summary);
      return;
    }
    this.setText("#roi-proof-heading", "Proof reconciled");
    this.setText("#roi-proof-note", "100% assigned. Every input is visible and included.");
    this.setText("#roi-expected-roi", this.formatPercent(result.expectedRoi, true));
    if (roiOutput) roiOutput.dataset.sign = result.expectedRoi >= 0 ? "positive" : "negative";
    this.setText("#roi-expected-value", this.formatValue(result.expectedGrossValue));
    this.setText("#roi-expected-net", this.formatValue(result.expectedNetReturn));
    this.setText("#roi-expected-multiple", `${this.formatNumber(result.expectedMultiple)}×`);
    this.setText("#roi-downside", this.formatPercent(result.downsideProbability));
    this.setText("#roi-break-even", this.formatPercent(result.breakEvenProbability));
    this.setText("#roi-formula-ev", `Σ p × value = ${this.formatValue(result.expectedGrossValue)}`);
    this.setText(
      "#roi-formula-net",
      `${this.formatValue(result.expectedGrossValue)} − ${this.formatValue(summary.totalInvestment)} = ${this.formatValue(result.expectedNetReturn)}`,
    );
    this.setText(
      "#roi-formula-roi",
      `${this.formatValue(result.expectedNetReturn)} ÷ ${this.formatValue(summary.totalInvestment)} = ${this.formatPercent(result.expectedRoi, true)}`,
    );
  }

  private renderIncompleteResult(summary: ReturnType<typeof calculateRoi>) {
    const status = this.incompleteStatus(summary);
    this.setText("#roi-proof-heading", status[0]);
    this.setText("#roi-proof-note", status[1]);
    for (const selector of [
      "#roi-expected-roi",
      "#roi-expected-value",
      "#roi-expected-net",
      "#roi-expected-multiple",
      "#roi-downside",
      "#roi-break-even",
    ]) {
      this.setText(selector, "—");
    }
    this.setText("#roi-formula-ev", "Σ p × value = —");
    this.setText("#roi-formula-net", "expected value − investment = —");
    this.setText("#roi-formula-roi", "expected net ÷ investment = —");
  }

  private incompleteStatus(summary: ReturnType<typeof calculateRoi>): [string, string] {
    if (summary.totalInvestment <= 0) {
      return ["Value the investment", "Add a positive quantity and value to at least one investment."];
    }
    if (!summary.probabilityComplete) {
      const note =
        summary.probabilityGap > 0
          ? `${this.formatPercent(summary.probabilityGap)} remains unassigned.`
          : `Probabilities exceed 100% by ${this.formatPercent(Math.abs(summary.probabilityGap))}.`;
      return ["Probability incomplete", note];
    }
    return ["Check highlighted inputs", summary.issues[0]?.message ?? "Complete every row."];
  }

  private renderSummary() {
    const summary = calculateRoi(this.investments, this.outcomes);
    summary.investmentItems.forEach((item, index) => {
      this.setText(`[data-investment-subtotal="${index}"]`, this.formatValue(item.subtotal));
    });
    summary.outcomeContributions.forEach((outcome, index) => {
      this.setText(
        `[data-outcome-contribution="${index}"]`,
        this.formatValue(outcome.contribution),
      );
    });
    this.renderProbability(summary);
    this.setText("#roi-total-investment", this.formatValue(summary.totalInvestment));
    this.setText("#roi-action-summary", this.action.trim() || "No action named yet");
    this.renderAllocation(summary);
    this.renderContributions(summary);
    this.setInvalidFields(summary);
    this.renderResult(summary);
    this.announce(summary);
    this.clearButton.disabled = this.isBlank();
  }

  private renderProbability(summary: ReturnType<typeof calculateRoi>) {
    this.setText("#roi-probability-total", this.formatPercent(summary.probabilityTotal));
    const check = this.root.querySelector<HTMLElement>("#roi-probability-check");
    if (check) check.dataset.state = summary.probabilityComplete ? "complete" : "incomplete";
    const note = summary.probabilityComplete
      ? "Distribution complete"
      : summary.probabilityGap > 0
        ? `${this.formatPercent(summary.probabilityGap)} remaining`
        : `${this.formatPercent(Math.abs(summary.probabilityGap))} over`;
    this.setText("#roi-probability-note", note);
  }

  private announce(summary: ReturnType<typeof calculateRoi>) {
    const announcement = summary.result
      ? `Calculation complete. Expected ROI ${this.formatPercent(summary.result.expectedRoi, true)}.`
      : summary.probabilityComplete
        ? "Inputs still need attention."
        : `Probability total ${this.formatPercent(summary.probabilityTotal)}.`;
    if (announcement === this.lastAnnouncement) return;
    this.liveStatus.textContent = announcement;
    this.lastAnnouncement = announcement;
  }

  private isBlank() {
    const investment = this.investments[0];
    const outcome = this.outcomes[0];
    return (
      this.action.trim() === "" &&
      this.investments.length === 1 &&
      investment.label === "" &&
      !Number.isFinite(investment.quantity) &&
      !Number.isFinite(investment.valuePerUnit) &&
      this.outcomes.length === 1 &&
      outcome.label === "" &&
      !Number.isFinite(outcome.probability) &&
      !Number.isFinite(outcome.value)
    );
  }

  private renderAll() {
    this.actionInput.value = this.action;
    this.unitSelect.value = this.unit;
    this.customUnitInput.value = this.customUnit;
    this.customUnitField.hidden = this.unit !== "custom";
    this.renderRows();
    this.updateUnitLabels();
    this.renderSummary();
  }

  private handleInvestmentInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const index = Number(target.dataset.investmentIndex);
    const field = target.dataset.field;
    const item = this.investments[index];
    if (!item || !field) return;
    this.touchedFields.add(`investment:${index}:${field}`);
    if (field === "label") item.label = target.value;
    if (field === "kind") item.kind = target.value as InvestmentKind;
    if (field === "stage") item.stage = target.value as EffortStage | "";
    if (field === "quantity") item.quantity = parseNumber(target.value);
    if (field === "valuePerUnit") item.valuePerUnit = parseNumber(target.value);
    this.renderSummary();
  }

  private handleOutcomeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const index = Number(target.dataset.outcomeIndex);
    const field = target.dataset.field;
    const outcome = this.outcomes[index];
    if (!outcome || !field) return;
    this.touchedFields.add(`outcome:${index}:${field}`);
    if (field === "label") outcome.label = target.value;
    if (field === "probability") outcome.probability = parseNumber(target.value);
    if (field === "value") outcome.value = parseNumber(target.value);
    this.renderSummary();
  }

  private handleClick(event: Event) {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!target) return;
    if (target.matches("[data-add-investment]")) this.addInvestment();
    else if (target.matches("[data-add-outcome]")) this.addOutcome();
    else if (target.dataset.removeInvestment !== undefined) this.removeInvestment(target);
    else if (target.dataset.removeOutcome !== undefined) this.removeOutcome(target);
    else if (target.matches("[data-load-example]")) this.loadExample();
    else if (target.matches("[data-clear-all]")) this.handleClear(target);
  }

  private addInvestment() {
    this.investments.push(this.blankInvestment());
    this.renderAll();
    this.investmentRows.querySelector<HTMLInputElement>(".roi-row:last-child input")?.focus();
  }

  private addOutcome() {
    this.outcomes.push(this.blankOutcome());
    this.renderAll();
    this.outcomeRows.querySelector<HTMLInputElement>(".roi-row:last-child input")?.focus();
  }

  private removeInvestment(target: HTMLElement) {
    const index = Number(target.dataset.removeInvestment);
    this.investments =
      this.investments.length === 1
        ? [this.blankInvestment()]
        : this.investments.filter((_, row) => row !== index);
    this.touchedFields.clear();
    this.renderAll();
  }

  private removeOutcome(target: HTMLElement) {
    const index = Number(target.dataset.removeOutcome);
    this.outcomes =
      this.outcomes.length === 1
        ? [this.blankOutcome()]
        : this.outcomes.filter((_, row) => row !== index);
    this.touchedFields.clear();
    this.renderAll();
  }

  private loadExample() {
    this.action = "Synthetic example: publish a small paid research report";
    this.unit = "USD";
    this.investments = [
      this.exampleInvestment("Research access and tools", "resource", "foundation", 1, 1200),
      this.exampleInvestment("Relevant skill practice", "time", "capability", 30, 50),
      this.exampleInvestment("Writing and launch execution", "time", "final-mile", 50, 50),
    ];
    this.outcomes = [
      this.exampleOutcome("No paid reach", 45, 0),
      this.exampleOutcome("Recover the investment", 30, 5200),
      this.exampleOutcome("Solid niche demand", 20, 12_000),
      this.exampleOutcome("Breakout distribution", 5, 40_000),
    ];
    this.touchedFields.clear();
    this.renderAll();
    this.liveStatus.textContent = "Synthetic example loaded. Every value remains editable.";
  }

  private exampleInvestment(
    label: string,
    kind: InvestmentKind,
    stage: EffortStage,
    quantity: number,
    valuePerUnit: number,
  ): UiInvestment {
    return { id: this.nextId++, label, kind, stage, quantity, valuePerUnit };
  }

  private exampleOutcome(label: string, probability: number, value: number): UiOutcome {
    return { id: this.nextId++, label, probability, value };
  }

  private handleClear(target: HTMLButtonElement) {
    if (target.dataset.armed !== "true") {
      target.dataset.armed = "true";
      target.textContent = "Click again to clear";
      this.liveStatus.textContent = "Press clear again to remove all worksheet values.";
      window.clearTimeout(this.clearTimer);
      this.clearTimer = window.setTimeout(() => {
        target.dataset.armed = "false";
        target.textContent = "Clear all";
      }, 4000);
      return;
    }
    window.clearTimeout(this.clearTimer);
    target.dataset.armed = "false";
    target.textContent = "Clear all";
    this.action = "";
    this.unit = "USD";
    this.customUnit = "units";
    this.investments = [this.blankInvestment()];
    this.outcomes = [this.blankOutcome()];
    this.touchedFields.clear();
    this.renderAll();
    this.actionInput.focus();
    this.liveStatus.textContent = "Worksheet cleared.";
  }

  private attachListeners() {
    this.investmentRows.addEventListener("input", (event) => this.handleInvestmentInput(event));
    this.outcomeRows.addEventListener("input", (event) => this.handleOutcomeInput(event));
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.actionInput.addEventListener("input", () => {
      this.action = this.actionInput.value;
      this.setText("#roi-action-summary", this.action.trim() || "No action named yet");
      this.clearButton.disabled = this.isBlank();
    });
    this.unitSelect.addEventListener("change", () => this.handleUnitChange());
    this.customUnitInput.addEventListener("input", () => this.handleCustomUnitInput());
  }

  private handleUnitChange() {
    this.unit = this.unitSelect.value as UnitKey;
    this.customUnitField.hidden = this.unit !== "custom";
    this.renderRows();
    this.updateUnitLabels();
    this.renderSummary();
    if (this.unit === "custom") this.customUnitInput.focus();
  }

  private handleCustomUnitInput() {
    this.customUnit = this.customUnitInput.value;
    this.renderRows();
    this.updateUnitLabels();
    this.renderSummary();
  }
}

const root = document.querySelector<HTMLElement>("[data-roi-root]");
if (root) RoiCalculator.mount(root);
