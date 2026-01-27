// ---------- Basic Helpers ----------
function normalize(input) {
  return input.trim().replace(/\s+/g, " ");
}

function wordsOf(input) {
  return normalize(input).split(" ").filter(Boolean);
}

function charCount(input) {
  return normalize(input).length;
}

function isLong(input) {
  return wordsOf(input).length >= 4 || charCount(input) >= 28;
}

function isShort(input) {
  return wordsOf(input).length <= 2 && charCount(input) <= 18;
}

function hasImageryWord(input) {
  const imagery = ["moon","sun","star","river","ocean","stone","lantern","forest","shadow","light","ember","storm"];
  const s = normalize(input).toLowerCase();
  return imagery.some(w => s.includes(w));
}

function hasGenericWord(input) {
  const generic = ["studio","labs","lab","group","collective","solutions","media","creative","works"];
  const s = normalize(input).toLowerCase();
  return generic.some(w => s.split(" ").includes(w));
}

function hasHardToSpellSignals(input) {
  return /(.)\1|q(?!u)|xq|jq|tz|zs/i.test(input);
}

function hasTrendPattern(input) {
  const s = normalize(input).toLowerCase();
  return /(labs|studio|collective)$/.test(s);
}

// ---------- Evaluation Logic ----------
function evaluateName(name) {
  const signals = {
    long: isLong(name),
    short: isShort(name),
    imagery: hasImageryWord(name),
    generic: hasGenericWord(name),
    spelling: hasHardToSpellSignals(name),
    trendy: hasTrendPattern(name)
  };

  let cautionCount = 0;
  if (signals.long) cautionCount++;
  if (signals.spelling) cautionCount++;
  if (signals.generic) cautionCount++;
  if (signals.trendy) cautionCount++;

  signals.cautionCount = cautionCount;

  const memorability = signals.short || signals.imagery
    ? "The name is relatively easy to remember and has elements that help it stand out."
    : "The name may be slightly harder to remember at first exposure due to its length or structure.";

  const clarity = signals.imagery
    ? "The name suggests a tone or feeling, which helps form an initial impression."
    : "The name is more conceptual than descriptive, which may require context to fully understand.";

  let practical = "There are no obvious structural concerns. The name should function smoothly in everyday use.";
  if (signals.spelling) practical = "Some parts of the name may be difficult to spell on first hearing, which could create minor friction.";
  if (signals.generic) practical += " One or more terms are widely used, which may reduce distinctiveness.";
  if (signals.trendy) practical += " The name follows a currently popular structure that may feel dated over time.";

  let gutcheck = "Gut check: The name feels structurally sound with manageable trade-offs.";
  if (cautionCount === 1) gutcheck = "Gut check: The name has several strengths, with minor areas that could be refined.";
  if (cautionCount >= 2) gutcheck = "Gut check: The name presents a mix of strengths and trade-offs that depend on context.";

  return { memorability, clarity, practical, gutcheck, signals };
}

// ---------- Compare Summary ----------
function compareSummary(nameA, repA, nameB, repB) {
  if (repA.signals.cautionCount < repB.signals.cautionCount) {
    return `Between the two, "${nameA}" appears structurally smoother with fewer practical trade-offs.`;
  }
  if (repB.signals.cautionCount < repA.signals.cautionCount) {
    return `Between the two, "${nameB}" appears structurally smoother with fewer practical trade-offs.`;
  }
  return "Both options appear structurally similar. The better choice may depend on audience and presentation.";
}

// ---------- DOM Wiring ----------
const form = document.getElementById("gutcheck-form");
const inputA = document.getElementById("name-input");
const inputB = document.getElementById("name-input-b");
const compareFields = document.getElementById("compare-fields");

const results = document.getElementById("results");
const singleResults = document.getElementById("single-results");
const compareResults = document.getElementById("compare-results");

const echoInput = document.getElementById("echo-input");
const memorabilityText = document.getElementById("memorability-text");
const clarityText = document.getElementById("clarity-text");
const practicalText = document.getElementById("practical-text");
const gutcheckText = document.getElementById("gutcheck-text");

const echoA = document.getElementById("echo-a");
const echoB = document.getElementById("echo-b");
const aM = document.getElementById("a-m");
const aC = document.getElementById("a-c");
const aP = document.getElementById("a-p");
const aG = document.getElementById("a-g");
const bM = document.getElementById("b-m");
const bC = document.getElementById("b-c");
const bP = document.getElementById("b-p");
const bG = document.getElementById("b-g");
const compareSummaryEl = document.getElementById("compare-summary");

const domainLink = document.getElementById("domain-link");
const trademarkLink = document.getElementById("trademark-link");
const landingLink = document.getElementById("landingpage-link");

function buildDomainLink(name) {
  return "https://www.namecheap.com/domains/registration/results/?domain=" + encodeURIComponent(name.replace(/\s+/g, ""));
}

form.addEventListener("change", () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  compareFields.hidden = mode !== "compare";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const mode = document.querySelector('input[name="mode"]:checked').value;
  const nameA = normalize(inputA.value);
  if (!nameA) return;

  results.hidden = false;

  if (mode === "single") {
    singleResults.hidden = false;
    compareResults.hidden = true;

    const rep = evaluateName(nameA);

    echoInput.textContent = nameA;
    memorabilityText.textContent = rep.memorability;
    clarityText.textContent = rep.clarity;
    practicalText.textContent = rep.practical;
    gutcheckText.textContent = rep.gutcheck;

    domainLink.href = buildDomainLink(nameA);
    trademarkLink.href = "https://www.uspto.gov/trademarks/search";
    landingLink.href = "https://carrd.co/";

  } else {
    const nameB = normalize(inputB.value);
    if (!nameB) return;

    singleResults.hidden = true;
    compareResults.hidden = false;

    const repA = evaluateName(nameA);
    const repB = evaluateName(nameB);

    echoA.textContent = nameA;
    echoB.textContent = nameB;

    aM.textContent = repA.memorability;
    aC.textContent = repA.clarity;
    aP.textContent = repA.practical;
    aG.textContent = repA.gutcheck;

    bM.textContent = repB.memorability;
    bC.textContent = repB.clarity;
    bP.textContent = repB.practical;
    bG.textContent = repB.gutcheck;

    compareSummaryEl.textContent = compareSummary(nameA, repA, nameB, repB);

    domainLink.href = buildDomainLink(nameA);
    trademarkLink.href = "https://www.uspto.gov/trademarks/search";
    landingLink.href = "https://carrd.co/";
  }

  results.scrollIntoView({ behavior: "smooth" });
});

