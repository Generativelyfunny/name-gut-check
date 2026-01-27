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
  const imagery = [
    "moon","sun","star","river","ocean","stone","lantern","forest","shadow",
    "light","ember","storm","garden","wind","cloud","mountain"
  ];
  const s = normalize(input).toLowerCase();
  return imagery.some(w => s.includes(w));
}

function hasGenericWord(input) {
  const generic = [
    "studio","labs","lab","group","collective","solutions","media","creative",
    "works","company","co","inc","llc","systems","digital"
  ];
  const s = normalize(input).toLowerCase();
  return generic.some(w => s.split(" ").includes(w));
}

function hasHardToSpellSignals(input) {
  // Light heuristic: double letters or uncommon clusters
  return /(.)\1|q(?!u)|xq|jq|tz|zs|aei|iou/i.test(input);
}

function hasTrendPattern(input) {
  // Light heuristic: popular ending words or patterns
  const s = normalize(input).toLowerCase();
  return /(labs|lab|studio|collective|hub)$/.test(s);
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

  // Memorability
  let memorability = "The name has some memorable elements, though certain aspects of its structure may make it slightly harder to retain at first.";
  if (signals.short || signals.imagery) {
    memorability = "The name is relatively easy to remember, supported by its structure and overall feel.";
    if (signals.imagery) {
      memorability += " The use of visual language supports memorability by giving the mind something concrete to hold onto.";
    }
  }
  if (signals.long) {
    memorability = "The name may be harder to remember on first exposure, as its length offers fewer natural memory anchors.";
  }

  // Clarity
  let clarity = "The name suggests a mood or style, though it may not immediately communicate what it represents without additional context.";
  if (signals.imagery) {
    clarity = "The name gives a general sense of tone or direction, helping new audiences form an initial impression.";
  }

  // Practical
  let practical = "There are no obvious structural concerns. The name should function smoothly in everyday use.";

  if (signals.spelling || signals.generic || signals.trendy) {
    practical = "The name is workable in practical terms, though certain elements may require occasional clarification in spelling or wording.";
  }

  if (signals.spelling) {
    practical += " Some parts may be difficult to spell on first hearing, which could create minor friction in search or sharing.";
  }
  if (signals.generic) {
    practical += " One or more terms are commonly used, which may reduce distinctiveness but does not prevent effective use.";
  }
  if (signals.trendy) {
    practical += " The structure follows a currently popular pattern that may date more quickly over time.";
  }

  // Gut check summary
  let gutcheck = "Gut check: The name feels structurally sound with manageable trade-offs. It is likely workable in most contexts.";
  if (cautionCount === 1) {
    gutcheck = "Gut check: The name has several strengths, with a few areas that may benefit from refinement depending on your goals.";
  }
  if (cautionCount >= 2) {
    gutcheck = "Gut check: The name presents a mix of strengths and trade-offs. It is usable as-is, though adjustments could improve clarity or memorability.";
  }

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

  // Tie-breaker: shorter name often performs better in everyday use
  if (repA.signals.short && !repB.signals.short) {
    return `Both options are broadly workable. "${nameA}" may be slightly easier to use and remember in everyday contexts.`;
  }
  if (repB.signals.short && !repA.signals.short) {
    return `Both options are broadly workable. "${nameB}" may be slightly easier to use and remember in everyday contexts.`;
  }

  return "Both options appear structurally similar. The better choice may depend on audience fit and how you plan to present it.";
}

// Pick which name to use for the domain link in compare mode
function pickBetterName(nameA, repA, nameB, repB) {
  if (repA.signals.cautionCount < repB.signals.cautionCount) return nameA;
  if (repB.signals.cautionCount < repA.signals.cautionCount) return nameB;

  if (repA.signals.short && !repB.signals.short) return nameA;
  if (repB.signals.short && !repA.signals.short) return nameB;

  return nameA;
}

// ---------- Affiliate / Next-step Links (placeholders for now) ----------
function buildDomainLink(name) {
  // Replace with your affiliate link later
  return "https://www.namecheap.com/domains/registration/results/?domain=" +
    encodeURIComponent(normalize(name).replace(/\s+/g, ""));
}

function buildLandingPageLink() {
  // Replace with your referral link later
  return "https://carrd.co/";
}

function buildLogoLink() {
  // Replace with your affiliate link later
  return "https://www.canva.com/";
}

function buildTrademarkSearchLink() {
  return "https://www.uspto.gov/trademarks/search";
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
const landingLink = document.getElementById("landingpage-link");
const logoLink = document.getElementById("logo-link");
const trademarkLink = document.getElementById("trademark-link");

// Toggle compare fields visibility
form.addEventListener("change", () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  compareFields.hidden = mode !== "compare";
});

// Submit handler
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
    landingLink.href = buildLandingPageLink();
    logoLink.href = buildLogoLink();
    trademarkLink.href = buildTrademarkSearchLink();

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

    const betterName = pickBetterName(nameA, repA, nameB, repB);

    domainLink.href = buildDomainLink(betterName);
    landingLink.href = buildLandingPageLink();
    logoLink.href = buildLogoLink();
    trademarkLink.href = buildTrademarkSearchLink();
  }

  results.scrollIntoView({ behavior: "smooth", block: "start" });
});
