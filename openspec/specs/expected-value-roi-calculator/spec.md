# expected-value-roi-calculator Specification

## Purpose

Provide a transparent worksheet for comparing a user-valued investment with a
user-supplied probability distribution of possible returns, without prediction
or runtime AI.

## Requirements

### Requirement: Investment is expressed in one common value unit

The calculator SHALL let the user name the action, choose a common value unit,
and define one or more investment line items. Each line item SHALL have a label;
a time, money, or resource category; a foundation, capability-building, or
final-mile effort stage; a non-negative quantity; and a non-negative value per
quantity. Total investment SHALL equal the sum of quantity multiplied by value
per quantity across valid line items.

The interface MUST explain that unlike units cannot be added directly and that
the user is responsible for converting every line item into the selected common
value unit.

#### Scenario: User combines different investment types

- **WHEN** the user values time, cash, and equipment in the same selected unit
- **THEN** the calculator shows each subtotal and their sum as total investment

#### Scenario: Investment units are not comparable

- **WHEN** the user has not converted every investment line item into one common unit
- **THEN** the interface explains why the ROI result would not be meaningful

### Requirement: Effort allocation distinguishes position from intensity

The calculator SHALL total the value and share of investment assigned to three
user-selected stages:

- foundation effort for acquiring prerequisites, access, runway, tools, or the
  position needed to begin;
- capability-building effort for developing or converting skills and leverage;
  and
- final-mile effort applied directly to producing the evaluated outcome.

The interface MUST describe all three stages as real investment and MUST NOT
infer another person's effort, merit, or starting position. It SHALL explain
that a lower foundation cost can let a person direct more of the same total
effort toward final-mile execution.

#### Scenario: Equal effort is allocated differently

- **WHEN** two illustrative paths have the same total investment but different user-entered stage allocations
- **THEN** the interface can show their different allocation without claiming that either person worked less

#### Scenario: User classifies their investment

- **WHEN** the user assigns investment rows to different effort stages
- **THEN** the allocation view shows the value and percentage of total investment in each stage

### Requirement: Outcomes form an explicit probability distribution

The calculator SHALL let the user add, edit, and remove named outcomes. Each
outcome SHALL accept a probability from 0% through 100% and a finite total
outcome value in the selected common unit, including zero or a negative value.
The interface SHALL show the running probability total and SHALL treat the
distribution as valid only when it totals 100% within a 0.01 percentage-point
rounding tolerance.

Outcome value MUST be labelled as total value received if the outcome occurs,
not profit after subtracting the investment.

#### Scenario: Probabilities reconcile

- **WHEN** the entered outcome probabilities total 100%
- **THEN** the distribution is marked complete and final results are available

#### Scenario: Probabilities do not reconcile

- **WHEN** the probabilities total less than or more than 100%
- **THEN** the interface shows the exact gap or excess and withholds final ROI results

### Requirement: Expected value and ROI use visible deterministic formulas

For a valid distribution and a total investment greater than zero, the
calculator SHALL compute all results from the entered values without inferred
inputs:

- expected gross value = sum of each outcome probability multiplied by its
  total outcome value;
- expected net return = expected gross value minus total investment;
- expected ROI = expected net return divided by total investment, expressed as
  a percentage;
- expected multiple = expected gross value divided by total investment;
- downside probability = the sum of probabilities for outcomes worth less than
  total investment; and
- break-even-or-better probability = the sum of probabilities for outcomes
  worth at least total investment.

The interface SHALL show the expected-value contribution of each outcome and
the calculation sequence so a user can audit the result. Calculations SHALL use
unrounded values internally and round only for presentation.

#### Scenario: Calculator evaluates a valid decision

- **WHEN** the user supplies a positive investment and a complete probability distribution
- **THEN** every result follows the documented formulas and the outcome contributions sum to expected gross value

#### Scenario: Investment is zero

- **WHEN** total investment is zero
- **THEN** the interface explains that ROI is undefined and does not display a final ROI percentage

### Requirement: Editing remains reversible and accessible

The calculator SHALL begin as a blank guided worksheet, update after input
changes, and provide labelled add and remove controls. It SHALL offer an
optional explicitly synthetic example and a confirmed clear-all action that
returns to the blank state. Validation status and result changes SHALL be
available to assistive technology, and all controls SHALL be usable with a
keyboard and at narrow viewport widths.

#### Scenario: User changes an assumption

- **WHEN** the user edits an investment amount, outcome probability, or outcome value
- **THEN** affected subtotals, validation, contributions, and results update from the new values

#### Scenario: User loads the example

- **WHEN** the user chooses to load the synthetic example
- **THEN** its fictional action, assumptions, and outcomes populate the worksheet and remain editable

#### Scenario: User clears the worksheet

- **WHEN** the user confirms the clear-all action
- **THEN** the action, investment rows, and outcome rows return to the blank guided state

### Requirement: The worksheet is local and non-predictive

The calculator MUST NOT call an AI model, infer probabilities, transmit entered
values, or present its arithmetic as a forecast. The surface SHALL state that
probabilities and valuations are user assumptions, expected value is an average
over repeated comparable decisions rather than the most likely single result,
and risk tolerance can make two decisions with the same expected ROI feel
different.

#### Scenario: User enters private decision assumptions

- **WHEN** the user edits the worksheet
- **THEN** the calculation runs locally without a runtime network request or persisted account data
