const themeStorageKey = "irlRpgTheme";
const customThemeStorageKey = "irlRpgCustomTheme";

const levelBadgeIcons = {
  noob: "N",
  basic: "B",
  exam: "E",
  tricks: "T",
  master: "M",
  meaning: "M",
  concept: "C",
  formula: "F",
  rule: "R",
  usage: "U",
  ssc: "S",
  revision: "R",
  speed: "S"
};

function getStageBadge(stage) {
  const parts = stage.label.split(" ");
  const number = parts.shift() || "";
  const name = parts.join(" ") || stage.title;
  const levelClass = String(stage.id || name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const icon = levelBadgeIcons[levelClass] || name.charAt(0).toUpperCase();
  return `<span class="level-badge level-${levelClass}" title="${stage.label}"><i>${icon}</i><b>${number}</b><em>${name}</em></span>`;
}

function getCustomTheme() {
  try {
    return JSON.parse(localStorage.getItem(customThemeStorageKey)) || {};
  } catch (_) {
    return {};
  }
}

function saveCustomTheme(theme) {
  localStorage.setItem(customThemeStorageKey, JSON.stringify(theme));
}

function applyCustomThemeValues(theme) {
  const values = {
    "--bg": theme.bg || "#08111c",
    "--panel": theme.panel || "#13263a",
    "--panel-2": theme.panel2 || theme.panel || "#0d1d2d",
    "--cyan": theme.accent || "#65e8ff",
    "--green": theme.power || "#73f58b",
    "--pink": theme.magic || "#ff4d9d",
    "--amber": theme.gold || "#ffd166"
  };

  Object.entries(values).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
}

function clearCustomThemeValues() {
  ["--bg", "--panel", "--panel-2", "--cyan", "--green", "--pink", "--amber"].forEach((name) => {
    document.documentElement.style.removeProperty(name);
  });
}

function applyTheme(themeName) {
  const theme = themeName || "neon";
  document.body.dataset.theme = theme;
  localStorage.setItem(themeStorageKey, theme);

  if (theme === "custom") {
    applyCustomThemeValues(getCustomTheme());
  } else {
    clearCustomThemeValues();
  }

  const select = document.getElementById("themeSelect");
  if (select) select.value = theme;

  const customBox = document.getElementById("customThemePanel");
  if (customBox) customBox.hidden = theme !== "custom";
}

function setupThemeControls() {
  const savedTheme = localStorage.getItem(themeStorageKey) || "neon";
  const customTheme = getCustomTheme();
  const fields = {
    customBg: "bg",
    customPanel: "panel",
    customAccent: "accent",
    customPower: "power"
  };

  Object.entries(fields).forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (customTheme[key]) input.value = customTheme[key];
    input.addEventListener("input", () => {
      const nextTheme = getCustomTheme();
      nextTheme[key] = input.value;
      saveCustomTheme(nextTheme);
      applyTheme("custom");
    });
  });

  const select = document.getElementById("themeSelect");
  if (select) {
    select.addEventListener("change", () => applyTheme(select.value));
  }

  applyTheme(savedTheme);
}
const profileStorageKey = "irlRpgProfile";

const examTargetPlans = {
  "SSC CGL": "Build Maths and Reasoning speed first, then English accuracy and daily GK revision.",
  "SSC CHSL": "Strengthen basic Maths, English accuracy, computer comfort, and typing practice.",
  "SSC MTS": "Master basics first: Number System, Percentage, grammar, static GK, and daily revision.",
  "SSC GD": "Balance written exam practice with a simple physical fitness routine.",
  "SSC CPO": "Focus on Quant and Reasoning speed, English accuracy, GK, and physical standards.",
  "SSC Stenographer": "Build English, Reasoning, GK, and daily shorthand skill practice.",
  "SSC Selection Post": "Follow the post-specific syllabus, then revise common SSC basics and mocks.",
  "SSC JE": "Add technical subject revision with SSC reasoning, GK, and exam speed practice."
};

const profileStatusText = {
  student: "Student",
  working: "Working",
  unemployed: "Unemployed",
  other: "Other"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(profileStorageKey));
  } catch (_) {
    return null;
  }
}

function getSelectedExamTargets() {
  return Array.from(document.querySelectorAll("#profileExamChoices input:checked")).map((input) => input.value);
}

function getProfilePlan(profile) {
  const targets = profile?.targets || getSelectedExamTargets();
  if (!targets.length) return "Pick one SSC exam target to unlock a focused path.";
  return targets.map((target) => examTargetPlans[target] || `Prepare ${target} with SSC basics, revision, and mock tests.`).join(" ");
}

function collectProfileFromForm() {
  return {
    name: document.getElementById("profileName")?.value.trim() || "Learner",
    phone: document.getElementById("profilePhone")?.value.trim() || "",
    email: document.getElementById("profileEmail")?.value.trim() || "",
    status: document.getElementById("profileStatus")?.value || "student",
    level: document.getElementById("profileLevel")?.value || "beginner",
    time: document.getElementById("profileTime")?.value || "30 minutes",
    targets: getSelectedExamTargets(),
    updatedAt: new Date().toISOString()
  };
}

function fillProfileForm(profile = getProfile()) {
  if (!profile) return;
  const fields = {
    profileName: profile.name || "",
    profilePhone: profile.phone || "",
    profileEmail: profile.email || "",
    profileStatus: profile.status || "student",
    profileLevel: profile.level || "beginner",
    profileTime: profile.time || "30 minutes"
  };

  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });

  document.querySelectorAll("#profileExamChoices input").forEach((input) => {
    input.checked = (profile.targets || []).includes(input.value);
  });
}

function updateProfileShell(profile) {
  const heroLine = document.getElementById("profileHeroLine");
  const sidebarLabel = document.getElementById("sidebarFocusLabel");
  const sidebarText = document.getElementById("sidebarFocusText");

  if (!profile) {
    if (heroLine) heroLine.textContent = "Create your profile in Settings so IRL RPG can build your SSC path.";
    if (sidebarLabel) sidebarLabel.textContent = "Today Focus";
    if (sidebarText) sidebarText.textContent = "2 Pomodoro + 1 Mock";
    return;
  }

  const targets = profile.targets?.length ? profile.targets.join(", ") : "SSC basics";
  if (heroLine) heroLine.textContent = `${profile.name || "Learner"}, your target is ${targets}. IRL RPG will focus your prep path.`;
  if (sidebarLabel) sidebarLabel.textContent = "Target Path";
  if (sidebarText) sidebarText.textContent = profile.targets?.length ? `${profile.targets[0]} + basics` : "Set exam target";
}

function renderProfileSettings() {
  const profile = getProfile();
  const summary = document.getElementById("profileSummary");
  const badge = document.getElementById("profileStatusBadge");
  const planBox = document.getElementById("targetPlanBox");

  updateProfileShell(profile);

  if (!profile) {
    if (summary) summary.innerHTML = "No profile yet. Fill the form and save.";
    if (badge) badge.textContent = "No Profile";
    if (planBox) planBox.textContent = getProfilePlan(null);
    return;
  }

  const targetText = profile.targets?.length ? profile.targets.join(", ") : "No exam target selected";
  const plan = getProfilePlan(profile);
  if (badge) badge.textContent = "Profile Ready";
  if (summary) {
    summary.innerHTML = `
      <strong>${escapeHtml(profile.name || "Learner")}</strong>
      <span>${escapeHtml(profileStatusText[profile.status] || "Learner")} | ${escapeHtml(profile.level || "beginner")} | ${escapeHtml(profile.time || "30 minutes")}/day</span>
      <span>Target: ${escapeHtml(targetText)}</span>
      <span>${profile.email ? "Email: " + escapeHtml(profile.email) : "Email: not added"}</span>
    `;
  }
  if (planBox) planBox.innerHTML = `<strong>Preparation path:</strong> ${escapeHtml(plan)}`;
}

function updateTargetPreview() {
  const planBox = document.getElementById("targetPlanBox");
  if (planBox) planBox.innerHTML = `<strong>Preparation path:</strong> ${escapeHtml(getProfilePlan({ targets: getSelectedExamTargets() }))}`;
}

function saveProfileFromSettings() {
  const profile = collectProfileFromForm();
  localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  renderProfileSettings();
}

function resetProfileForm() {
  fillProfileForm();
  renderProfileSettings();
}

function setupProfileControls() {
  fillProfileForm();
  document.querySelectorAll("#profileExamChoices input").forEach((input) => {
    input.addEventListener("change", updateTargetPreview);
  });

  const form = document.getElementById("profileForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveProfileFromSettings();
    });
  }

  renderProfileSettings();
}

let time = 25 * 60;
let timerInterval = null;
let lastAiAnswer = "";
let recognition = null;
let browserVoices = [];
let practiceChallengeTimer = null;
let currentPracticeChallenge = null;
let lastMistakeLessonText = "";
const newsReaderItems = {};


const studyLibrary = [
  {
    subject: "Maths",
    intro: "Learn calculation, arithmetic, algebra, geometry, and data interpretation for SSC.",
    chapters: ["Percentage", "Ratio and Proportion", "Profit and Loss", "Simple Interest and Compound Interest", "Time and Work", "Time, Speed and Distance", "Number System", "Algebra", "Geometry", "Mensuration", "Data Interpretation"],
    task: "Start with Percentage. Learn formula, solve 20 basic questions, then 10 exam-level questions."
  },
  {
    subject: "Reasoning",
    intro: "Build logic, pattern recognition, and problem-solving speed.",
    chapters: ["Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relation", "Direction Sense", "Syllogism", "Venn Diagram", "Mirror and Water Image", "Paper Folding", "Statement and Conclusion"],
    task: "Start with Series. Solve number series and alphabet series daily."
  },
  {
    subject: "English",
    intro: "Improve grammar, vocabulary, reading, and sentence correction.",
    chapters: ["Parts of Speech", "Tenses", "Subject Verb Agreement", "Articles", "Prepositions", "Active and Passive Voice", "Direct and Indirect Speech", "Error Spotting", "Cloze Test", "Reading Comprehension", "Synonyms and Antonyms"],
    task: "Start with Tenses. Make notes and solve 20 error spotting questions."
  },
  {
    subject: "General Awareness",
    intro: "Study static GK, history, polity, geography, science, economics, and current affairs.",
    chapters: ["Indian History", "Indian Polity", "Geography", "Economics", "Physics", "Chemistry", "Biology", "Computer Awareness", "Awards and Honours", "Sports", "Current Affairs"],
    task: "Start with Indian Polity. Learn Constitution basics and important articles."
  }
];


const subjectMaps = {
  Maths: {
    core: "Number System -> Percentage -> Ratio -> Profit/Loss -> Interest -> Time/Work -> Speed/Distance -> DI",
    note: "Maths is connected like a chain. If Percentage is weak, Profit/Loss, Interest, and Data Interpretation become hard.",
    links: ["Percentage powers Profit/Loss, SI/CI, and DI", "Ratio helps Time/Work, Speed, and Mixture type questions", "Number System supports almost every Maths chapter"]
  },
  Reasoning: {
    core: "Series -> Analogy -> Classification -> Coding-Decoding -> Syllogism -> Direction/Blood Relation -> Images",
    note: "Reasoning is pattern training. Series and Analogy teach your brain how SSC hides rules.",
    links: ["Series connects with Coding-Decoding patterns", "Analogy and Classification both test comparison", "Direction and Blood Relation both need clean diagrams"]
  },
  English: {
    core: "Parts of Speech -> Tenses -> Subject Verb Agreement -> Articles/Prepositions -> Voice/Narration -> Error Spotting -> Comprehension",
    note: "English is grammar layers. If Parts of Speech and Tenses are clear, Error Spotting becomes much easier.",
    links: ["Parts of Speech supports every grammar chapter", "Tenses connects to Voice and Narration", "Vocabulary improves Cloze Test and Reading Comprehension"]
  },
  "General Awareness": {
    core: "Polity -> History -> Geography -> Science -> Economics -> Current Affairs -> Revision MCQs",
    note: "GA is memory plus revision. Polity and History are core because repeated static facts come from them.",
    links: ["Polity connects with current affairs and government schemes", "Geography connects with economics and environment", "Science helps daily-life GK and static MCQs"]
  }
};

const chapterGuides = {
  "Number System": { level: "Foundation", type: "Core Base", why: "Builds calculation sense for almost every Maths topic.", connects: ["Percentage", "Ratio", "Algebra", "DI"] },
  "Percentage": { level: "Core", type: "Must Learn", why: "Used in marks, discount, profit-loss, interest, population, and charts.", connects: ["Profit and Loss", "SI/CI", "Data Interpretation", "Ratio"] },
  "Ratio and Proportion": { level: "Core", type: "Must Learn", why: "Helps compare quantities and solve share, work, speed, and mixture questions.", connects: ["Time and Work", "Speed", "Mensuration", "DI"] },
  "Profit and Loss": { level: "Core", type: "Scoring", why: "Common SSC arithmetic topic built on percentage and CP/SP logic.", connects: ["Percentage", "Discount", "SI/CI"] },
  "Simple Interest and Compound Interest": { level: "Core", type: "Formula", why: "Needs percentage, time, principal, and fast formula handling.", connects: ["Percentage", "Profit and Loss", "Algebra"] },
  "Time and Work": { level: "Core", type: "Speed Topic", why: "Uses ratio and fractions to solve worker efficiency questions.", connects: ["Ratio", "LCM", "Pipes and Cisterns"] },
  "Time, Speed and Distance": { level: "Core", type: "Speed Topic", why: "Uses ratio, unit conversion, and formula practice.", connects: ["Ratio", "Algebra", "Trains"] },
  "Algebra": { level: "Support", type: "Formula", why: "Helps simplify equations and solve advanced arithmetic quickly.", connects: ["Number System", "Mensuration", "Geometry"] },
  "Geometry": { level: "Support", type: "Concept", why: "Important for shapes, angles, and theorem-based questions.", connects: ["Mensuration", "Algebra"] },
  "Mensuration": { level: "Core", type: "Formula", why: "Area, volume, and surface area questions repeat in SSC.", connects: ["Geometry", "Percentage", "Algebra"] },
  "Data Interpretation": { level: "Core", type: "Exam Skill", why: "Uses tables, charts, percentage, ratio, and average together.", connects: ["Percentage", "Ratio", "Average"] },
  "Series": { level: "Core", type: "Pattern", why: "Builds pattern recognition for reasoning speed.", connects: ["Analogy", "Coding-Decoding", "Classification"] },
  "Analogy": { level: "Core", type: "Comparison", why: "Teaches relation matching, a common reasoning skill.", connects: ["Classification", "Series"] },
  "Classification": { level: "Core", type: "Comparison", why: "Finds odd one out using the same thinking as analogy.", connects: ["Analogy", "Series"] },
  "Coding-Decoding": { level: "Core", type: "Pattern", why: "Uses letter positions, number patterns, and rule finding.", connects: ["Series", "Alphabet", "Analogy"] },
  "Blood Relation": { level: "Practice", type: "Diagram", why: "Needs clean family diagrams and careful reading.", connects: ["Direction Sense", "Syllogism"] },
  "Direction Sense": { level: "Practice", type: "Diagram", why: "Needs map drawing and step tracking.", connects: ["Blood Relation", "Mirror Image"] },
  "Syllogism": { level: "Core", type: "Logic", why: "Builds yes/no logical thinking with statements and conclusions.", connects: ["Venn Diagram", "Statement and Conclusion"] },
  "Parts of Speech": { level: "Foundation", type: "Core Base", why: "Main grammar base for every English chapter.", connects: ["Tenses", "Error Spotting", "Sentence Improvement"] },
  "Tenses": { level: "Core", type: "Must Learn", why: "Used in grammar, voice, narration, and sentence correction.", connects: ["Voice", "Narration", "Error Spotting"] },
  "Subject Verb Agreement": { level: "Core", type: "Error Spotting", why: "Very common in SSC correction questions.", connects: ["Parts of Speech", "Tenses", "Error Spotting"] },
  "Articles": { level: "Support", type: "Accuracy", why: "Small grammar topic that improves fill blanks and correction.", connects: ["Nouns", "Error Spotting"] },
  "Prepositions": { level: "Core", type: "Accuracy", why: "Repeated in fill blanks, error spotting, and cloze test.", connects: ["Phrases", "Cloze Test", "Error Spotting"] },
  "Error Spotting": { level: "Core", type: "Exam Skill", why: "Combines grammar chapters into real SSC questions.", connects: ["Parts of Speech", "Tenses", "SVA", "Prepositions"] },
  "Reading Comprehension": { level: "Practice", type: "Reading", why: "Needs vocabulary, speed, and understanding.", connects: ["Vocabulary", "Cloze Test"] },
  "Indian Polity": { level: "Core", type: "Static GK", why: "High value static GK with repeated facts and articles.", connects: ["Current Affairs", "History", "Government Schemes"] },
  "Indian History": { level: "Core", type: "Static GK", why: "Ancient, medieval, and modern facts repeat in SSC.", connects: ["Polity", "Culture", "Current Affairs"] },
  "Geography": { level: "Core", type: "Static GK", why: "Maps, climate, rivers, and resources connect with economy and environment.", connects: ["Economics", "Current Affairs", "Science"] },
  "Economics": { level: "Support", type: "Concept GK", why: "Helps understand budget, banking, inflation, and schemes.", connects: ["Polity", "Current Affairs"] },
  "Physics": { level: "Support", type: "Science", why: "Daily-life science questions come from basic concepts.", connects: ["Chemistry", "Biology"] },
  "Chemistry": { level: "Support", type: "Science", why: "Useful for substances, reactions, and daily-life GK.", connects: ["Physics", "Biology"] },
  "Biology": { level: "Support", type: "Science", why: "Human body, disease, plants, and nutrition questions repeat.", connects: ["Chemistry", "Current Affairs"] },
  "Current Affairs": { level: "Core", type: "Daily", why: "Connects static GK with recent events and government updates.", connects: ["Polity", "Economics", "Sports", "Awards"] }
};

function getChapterGuide(subject, chapter) {
  return chapterGuides[chapter] || {
    level: subject === "Maths" || subject === "English" ? "Core" : "Practice",
    type: "Study Path",
    why: `Important ${subject} topic for SSC preparation. Learn basics, examples, then exam questions.`,
    connects: subjectMaps[subject]?.links?.slice(0, 2) || ["SSC syllabus", "Mock Tests"]
  };
}
const mockTests = [
  { id: "profile", title: "Profile Smart Mock", subject: "Your Target", questions: 20, time: "10 min", minutes: 10, focus: "Built from your Settings profile and selected SSC exam" },
  { id: "maths", title: "Maths Sprint", subject: "Quant", questions: 20, time: "10 min", minutes: 10, focus: "Percentage, ratio, profit-loss, speed" },
  { id: "reasoning", title: "Reasoning Drill", subject: "Logic", questions: 20, time: "10 min", minutes: 10, focus: "Series, analogy, coding-decoding, direction" },
  { id: "english", title: "English Accuracy", subject: "English", questions: 20, time: "10 min", minutes: 10, focus: "Grammar, error spotting, vocabulary" },
  { id: "ga", title: "GK Revision", subject: "GA", questions: 20, time: "10 min", minutes: 10, focus: "Polity, history, science, current affairs" },
  { id: "mixed", title: "SSC Mixed Mock", subject: "Mixed", questions: 20, time: "10 min", minutes: 10, focus: "Balanced SSC speed practice" }
];

const lessonProgressKey = "irlRpgLessonProgress";

const lessonCatalog = {
  Percentage: {
    title: "Percentage",
    subject: "Maths",
    goal: "Go from noob to master: understand percentage, convert fast, solve SSC exam questions, and avoid silly mistakes.",
    sources: [
      { label: "Khan Academy: Percentages", url: "https://www.khanacademy.org/math/arithmetic/arith-review-percentages" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      {
        id: "noob",
        label: "01 Noob",
        title: "What percentage means",
        points: [
          "Percent means per 100.",
          "25% means 25 out of 100.",
          "Use percentage when comparing marks, discount, profit, loss, population, and data."
        ],
        example: "If you score 40 marks out of 80, percentage = 40 / 80 x 100 = 50%.",
        practice: "Write these as percentages: 1/2, 1/4, 3/4, 1/5, 2/5."
      },
      {
        id: "basic",
        label: "02 Basic",
        title: "Main formula and conversions",
        points: [
          "Percentage = Part / Whole x 100.",
          "Part = Percentage x Whole / 100.",
          "Whole = Part x 100 / Percentage."
        ],
        example: "20% of 350 = 20 x 350 / 100 = 70.",
        practice: "Find: 15% of 200, 12.5% of 480, 35% of 900."
      },
      {
        id: "exam",
        label: "03 SSC Exam",
        title: "Increase, decrease, and comparison",
        points: [
          "Increase by x% means multiply by (100 + x) / 100.",
          "Decrease by x% means multiply by (100 - x) / 100.",
          "Successive changes are multiplied, not added directly."
        ],
        example: "Price 1000 increased by 20%, then decreased by 10%: 1000 x 1.20 x 0.90 = 1080.",
        practice: "A salary increases by 10% then 20%. Find total percentage increase."
      },
      {
        id: "tricks",
        label: "04 Tricks",
        title: "Fast mental percentage values",
        points: [
          "10% = divide by 10, 5% = half of 10%.",
          "1% = divide by 100, 25% = one fourth, 12.5% = one eighth.",
          "Use fractions: 33.33% = 1/3, 16.66% = 1/6, 66.66% = 2/3."
        ],
        example: "12.5% of 640 = 640 / 8 = 80.",
        practice: "Find mentally: 25% of 760, 12.5% of 960, 16.66% of 300."
      },
      {
        id: "master",
        label: "05 Master",
        title: "Mixed SSC level practice",
        points: [
          "First identify: part, whole, increase, decrease, or comparison.",
          "For exam speed, write only the needed formula, not long explanation.",
          "Revise mistake types: wrong base value, direct addition of successive %, and decimal errors."
        ],
        example: "If A is 25% more than B, then B is 20% less than A. Example: B=100, A=125, difference from A = 25/125 x 100 = 20%.",
        practice: "Solve 20 mixed questions: percentage of number, increase/decrease, successive change, and comparison."
      }
    ]
  }
};
Object.assign(lessonCatalog, {
  "Ratio and Proportion": {
    title: "Ratio and Proportion",
    subject: "Maths",
    goal: "Learn comparison, direct proportion, inverse proportion, and SSC mixture-style ratio questions.",
    sources: [
      { label: "Khan Academy: Arithmetic", url: "https://www.khanacademy.org/math/arithmetic" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "meaning", label: "01 Meaning", title: "Understand ratio", points: ["Ratio compares two quantities of the same type.", "a:b means a parts compared with b parts.", "Always reduce a ratio to simplest form."], example: "20 boys and 30 girls = 20:30 = 2:3.", practice: "Simplify: 18:24, 45:60, 72:96." },
      { id: "proportion", label: "02 Proportion", title: "Direct and inverse proportion", points: ["Direct proportion: both increase together.", "Inverse proportion: one increases, other decreases.", "Use unitary method when confused."], example: "If 4 pens cost 40, then 10 pens cost 100.", practice: "Solve 5 direct and 5 inverse proportion questions." },
      { id: "exam", label: "03 SSC Exam", title: "Exam patterns", points: ["Common types: share money, ages, mixture, work ratio.", "Convert ratio parts into total parts first.", "Then multiply one part value."], example: "Divide 900 in ratio 2:3:4. Total parts=9, one part=100, shares=200,300,400.", practice: "Do 15 ratio share questions with timer." }
    ]
  },
  "Profit and Loss": {
    title: "Profit and Loss",
    subject: "Maths",
    goal: "Build the full SSC base: CP, SP, marked price, discount, and profit percentage.",
    sources: [
      { label: "Khan Academy: Arithmetic", url: "https://www.khanacademy.org/math/arithmetic" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "terms", label: "01 Terms", title: "CP, SP, profit, loss", points: ["CP means cost price.", "SP means selling price.", "Profit happens when SP > CP; loss happens when CP > SP."], example: "CP=500, SP=650, profit=150.", practice: "Find profit/loss for 10 CP-SP pairs." },
      { id: "formula", label: "02 Formula", title: "Percent formula", points: ["Profit% = Profit / CP x 100.", "Loss% = Loss / CP x 100.", "Profit and loss percentage is always calculated on CP."], example: "CP=800, SP=1000, profit%=200/800 x 100 = 25%.", practice: "Solve 10 direct formula questions." },
      { id: "discount", label: "03 Discount", title: "Marked price and discount", points: ["Discount is calculated on marked price.", "Selling price = Marked price - discount.", "Then compare SP with CP for profit/loss."], example: "MP=1000, discount=20%, SP=800.", practice: "Solve 10 discount questions." }
    ]
  },
  "Series": {
    title: "Series",
    subject: "Reasoning",
    goal: "Learn number series, alphabet series, missing term, and odd term logic for SSC reasoning.",
    sources: [
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "patterns", label: "01 Patterns", title: "Find the operation", points: ["Check +, -, x, divide first.", "Then check squares, cubes, and alternate patterns.", "Write differences between terms."], example: "2, 5, 10, 17, 26: differences are 3,5,7,9, next difference 11, answer 37.", practice: "Solve 20 number series and write the pattern beside each." },
      { id: "alphabet", label: "02 Alphabet", title: "Alphabet series", points: ["Convert letters to positions: A=1, B=2, ... Z=26.", "Look for skip patterns.", "Check forward and backward movement."], example: "A, C, F, J: gaps +2,+3,+4, next +5 = O.", practice: "Solve 15 alphabet series." },
      { id: "exam", label: "03 Exam", title: "SSC speed method", points: ["Do not overthink first 20 seconds.", "Test simple pattern first.", "Mark odd/even or alternate terms when direct pattern fails."], example: "3, 6, 11, 18, 27: differences +3,+5,+7,+9, answer 38.", practice: "Set 10 minute timer and solve 15 series questions." }
    ]
  },
  "Parts of Speech": {
    title: "Parts of Speech",
    subject: "English",
    goal: "Learn grammar building blocks for SSC error spotting, fill blanks, and sentence improvement.",
    sources: [
      { label: "British Council: Grammar", url: "https://learnenglish.britishcouncil.org/free-resources/grammar" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "names", label: "01 Basics", title: "Eight parts of speech", points: ["Noun names a person, place, thing, or idea.", "Pronoun replaces noun.", "Verb shows action or state.", "Adjective describes noun; adverb describes verb/adjective/adverb."], example: "The smart student quickly solved the question. smart=adjective, quickly=adverb, solved=verb.", practice: "Pick 10 sentences and mark noun, verb, adjective, adverb." },
      { id: "ssc", label: "02 SSC Use", title: "How SSC asks it", points: ["Error spotting often tests noun number, pronoun case, verb agreement, and adjective/adverb confusion.", "Read the full sentence before choosing error.", "Check subject and verb first."], example: "He runs fast. Not: He runs fastly.", practice: "Solve 20 error spotting questions and label the grammar rule." },
      { id: "revision", label: "03 Revision", title: "Memory table", points: ["Noun: name.", "Verb: action/state.", "Adjective: describes noun.", "Adverb: describes action/how/when/where."], example: "She is very happy. very=adverb, happy=adjective.", practice: "Make a one-page grammar table in your notebook." }
    ]
  },
  "Tenses": {
    title: "Tenses",
    subject: "English",
    goal: "Master tense basics for SSC grammar, sentence correction, and narration support.",
    sources: [
      { label: "British Council: Grammar", url: "https://learnenglish.britishcouncil.org/free-resources/grammar" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "time", label: "01 Time", title: "Past, present, future", points: ["Tense tells time of action.", "Present: happens now or generally.", "Past: already happened.", "Future: will happen."], example: "I study. I studied. I will study.", practice: "Write 10 verbs in present, past, and future." },
      { id: "forms", label: "02 Forms", title: "Simple, continuous, perfect", points: ["Simple: fact or completed action.", "Continuous: action going on.", "Perfect: action completed with result."], example: "I read. I am reading. I have read.", practice: "Convert 10 simple sentences into continuous and perfect." },
      { id: "ssc", label: "03 SSC Errors", title: "Common tense mistakes", points: ["Use past tense after yesterday/ago/last year.", "Use present perfect with since/for when action continues.", "Do not mix tense without reason."], example: "I have lived here for two years. Not: I am living here since two years.", practice: "Solve 20 tense error questions." }
    ]
  },
  "Indian Polity": {
    title: "Indian Polity",
    subject: "General Awareness",
    goal: "Build SSC static GK base: Constitution, Parliament, President, PM, rights, and duties.",
    sources: [
      { label: "NCERT Textbooks", url: "https://ncert.nic.in/textbook.php" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    stages: [
      { id: "constitution", label: "01 Base", title: "Constitution basics", points: ["The Constitution is the supreme law of India.", "It explains government structure, rights, duties, and powers.", "Learn Preamble keywords first."], example: "Sovereign, socialist, secular, democratic, republic are Preamble keywords.", practice: "Write the Preamble keywords and meanings." },
      { id: "institutions", label: "02 Bodies", title: "Important institutions", points: ["Parliament makes laws.", "President is constitutional head.", "Prime Minister leads the council of ministers."], example: "Lok Sabha + Rajya Sabha + President form Parliament.", practice: "Make a table: President, PM, Parliament, Supreme Court." },
      { id: "exam", label: "03 SSC Focus", title: "High value facts", points: ["Revise articles, amendments, fundamental rights, DPSP, and duties.", "Static facts repeat often.", "Use short notes and daily revision."], example: "Article 32 is linked with constitutional remedies.", practice: "Revise 20 polity facts daily for 7 days." }
    ]
  }
});
const examHub = [
  {
    name: "SSC CGL",
    level: "Graduate",
    stages: "Tier 1 + Tier 2",
    bestFor: "Inspector, assistant, auditor, office posts",
    intro: "Combined Graduate Level is one of the biggest SSC exams for graduate-level central government posts.",
    syllabus: ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer basics", "Statistics for some posts"],
    events: ["Notification", "Application dates", "Admit card", "Tier 1 exam", "Tier 2 exam", "Result", "Document verification"],
    plan: "CGL path: build Maths speed first, revise English grammar daily, and keep 30 minutes for GK/current affairs."
  },
  {
    name: "SSC CHSL",
    level: "12th pass",
    stages: "Tier 1 + Tier 2",
    bestFor: "LDC, JSA, DEO posts",
    intro: "Combined Higher Secondary Level is for 12th-pass candidates targeting clerical and data entry roles.",
    syllabus: ["General Intelligence", "Quantitative Aptitude", "English Language", "General Awareness", "Typing/data entry skill"],
    events: ["Notification", "Application dates", "Admit card", "Tier 1 exam", "Tier 2 exam", "Typing test", "Result"],
    plan: "CHSL path: practice typing, solve easy-to-medium Maths daily, and focus strongly on English accuracy."
  },
  {
    name: "SSC MTS",
    level: "10th pass",
    stages: "Computer exam + PET/PST for Havaldar",
    bestFor: "MTS and Havaldar posts",
    intro: "Multi Tasking Staff is a 10th-level SSC exam with basic reasoning, numeracy, English, and awareness.",
    syllabus: ["Numerical ability", "Reasoning ability", "English", "General Awareness"],
    events: ["Notification", "Application dates", "Admit card", "Computer exam", "PET/PST if applicable", "Result"],
    plan: "MTS path: master basics first. Do not jump to hard questions before number system, percentage, and grammar basics."
  },
  {
    name: "SSC GD",
    level: "10th pass",
    stages: "Computer exam + PET/PST + medical",
    bestFor: "Constable posts",
    intro: "General Duty Constable is for paramilitary constable posts and needs both written and physical preparation.",
    syllabus: ["General Intelligence", "General Knowledge", "Elementary Maths", "English/Hindi"],
    events: ["Notification", "Application dates", "Admit card", "Computer exam", "PET/PST", "Medical", "Final result"],
    plan: "GD path: study written exam daily and train physical fitness consistently. Both matter."
  },
  {
    name: "SSC CPO",
    level: "Graduate",
    stages: "Paper 1 + PET/PST + Paper 2 + medical",
    bestFor: "Sub-Inspector posts",
    intro: "Central Police Organization exam is for SI-level posts and includes written exams plus physical tests.",
    syllabus: ["Reasoning", "General Knowledge", "Quantitative Aptitude", "English comprehension"],
    events: ["Notification", "Application dates", "Paper 1 admit card", "Paper 1 exam", "PET/PST", "Paper 2", "Medical", "Final result"],
    plan: "CPO path: balance English comprehension with physical preparation. Start PET practice early."
  },
  {
    name: "SSC JE",
    level: "Diploma/Engineering",
    stages: "Paper 1 + Paper 2",
    bestFor: "Junior Engineer posts",
    intro: "Junior Engineer is for engineering candidates in civil, mechanical, and electrical streams.",
    syllabus: ["General Intelligence", "General Awareness", "Civil/Electrical/Mechanical engineering"],
    events: ["Notification", "Application dates", "Paper 1 admit card", "Paper 1 exam", "Paper 2 exam", "Result"],
    plan: "JE path: keep technical subject practice as the main block, then add reasoning and GA for scoring."
  },
  {
    name: "SSC Steno",
    level: "12th pass",
    stages: "Computer exam + skill test",
    bestFor: "Stenographer Grade C and D",
    intro: "Stenographer exam is for candidates with shorthand skill and 12th qualification.",
    syllabus: ["General Intelligence", "General Awareness", "English language", "Shorthand skill test"],
    events: ["Notification", "Application dates", "Admit card", "Computer exam", "Skill test", "Result"],
    plan: "Steno path: English and shorthand practice are the core. Keep daily dictation practice."
  }
];

async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();
  const xpText = data.xp + " / " + data.level * 100;
  const percent = Math.min((data.xp / (data.level * 100)) * 100, 100);

  document.getElementById("level").textContent = data.level;
  document.getElementById("xp").textContent = xpText;
  document.getElementById("xpBar").style.width = percent + "%";

  const dashLevel = document.getElementById("dashLevel");
  const dashXp = document.getElementById("dashXp");
  const progressLevel = document.getElementById("progressLevel");
  const progressXp = document.getElementById("progressXp");
  const progressBar = document.getElementById("progressBar");

  if (dashLevel) dashLevel.textContent = data.level;
  if (dashXp) dashXp.textContent = xpText;
  if (progressLevel) progressLevel.textContent = data.level;
  if (progressXp) progressXp.textContent = xpText;
  if (progressBar) progressBar.style.width = percent + "%";
  window.irlRpgData = data;
  renderQuestBoard(data);
  const questsBox = document.getElementById("quests");
  questsBox.innerHTML = "";
  data.quests.forEach((quest) => {
    const div = document.createElement("div");
    div.className = "quest";
    div.innerHTML = `<span>${quest.title} <b>+${quest.xp} XP</b></span><button onclick="completeQuest(${quest.id})">Complete</button>`;
    questsBox.appendChild(div);
  });
}

async function completeQuest(id) {
  await fetch("/api/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadData();
}

function renderLearningSpace() {
  const subjectsBox = document.getElementById("subjects");
  subjectsBox.innerHTML = "";
  studyLibrary.forEach((item, index) => {
    const map = subjectMaps[item.subject];
    const button = document.createElement("button");
    button.className = "subject-card subject-card-rich";
    button.innerHTML = `<strong>${item.subject}</strong><span>${map?.core || "SSC study path"}</span>`;
    button.onclick = () => showLesson(index);
    subjectsBox.appendChild(button);
  });
}

function showLesson(index) {
  const item = studyLibrary[index];
  const subjectsBox = document.getElementById("subjects");
  const lessonBox = document.getElementById("lessonBox");
  const map = subjectMaps[item.subject];

  if (subjectsBox) subjectsBox.style.display = "grid";
  lessonBox.classList.remove("lesson-detail-mode", "stage-explain-mode");
  document.getElementById("lessonTitle").textContent = item.subject;
  document.getElementById("lessonIntro").textContent = item.intro;

  const chapterList = document.getElementById("chapterList");
  chapterList.innerHTML = "";

  const mapCard = document.createElement("div");
  mapCard.className = "core-map";
  mapCard.innerHTML = `
    <span>SSC Core Map</span>
    <strong>${map?.core || "Learn basics -> practice -> mock tests"}</strong>
    <p>${map?.note || "Follow the order. Do not skip foundation chapters."}</p>
    <div class="connection-list">${(map?.links || []).map((link) => `<small>${link}</small>`).join("")}</div>
  `;
  chapterList.appendChild(mapCard);

  item.chapters.forEach((chapter) => {
    const guide = getChapterGuide(item.subject, chapter);
    const button = document.createElement("button");
    button.className = "chapter chapter-button chapter-guide";
    button.innerHTML = `
      <span class="chapter-meta"><b>${guide.level}</b><small>${guide.type}</small></span>
      <strong>${chapter}</strong>
      <small>${guide.why}</small>
      <em>Connects: ${guide.connects.join(", ")}</em>
    `;
    button.onclick = () => showChapterLesson(item.subject, chapter, index);
    chapterList.appendChild(button);
  });

  const task = document.createElement("div");
  task.className = "study-task";
  task.innerHTML = `<strong>Today's study task:</strong> ${item.task}`;
  chapterList.appendChild(task);
}


function getLessonProgress() {
  try {
    return JSON.parse(localStorage.getItem(lessonProgressKey)) || {};
  } catch (_) {
    return {};
  }
}

function saveLessonProgress(progress) {
  localStorage.setItem(lessonProgressKey, JSON.stringify(progress));
}

function isLessonStageDone(chapter, stageId) {
  const progress = getLessonProgress();
  return Boolean(progress[chapter]?.[stageId]);
}

function markLessonStage(chapter, stageId, subject = "Maths", subjectIndex = 0) {
  const progress = getLessonProgress();
  progress[chapter] = progress[chapter] || {};
  progress[chapter][stageId] = true;
  saveLessonProgress(progress);
  showChapterLesson(subject, chapter, subjectIndex);
  renderQuestBoard(window.irlRpgData || {});
}

function unmarkLessonStage(chapter, stageId, subject = "Maths", subjectIndex = 0, returnToStep = false) {
  const progress = getLessonProgress();
  if (progress[chapter]) {
    delete progress[chapter][stageId];
    if (!Object.keys(progress[chapter]).length) delete progress[chapter];
  }
  saveLessonProgress(progress);

  if (returnToStep) {
    openStageExplain(subject, chapter, stageId, subjectIndex);
  } else {
    showChapterLesson(subject, chapter, subjectIndex);
  }
  renderQuestBoard(window.irlRpgData || {});
}

function createStarterLesson(subject, chapter) {
  const sourceMap = {
    Maths: [
      { label: "Khan Academy: Arithmetic", url: "https://www.khanacademy.org/math/arithmetic" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    English: [
      { label: "British Council: Grammar", url: "https://learnenglish.britishcouncil.org/free-resources/grammar" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    "General Awareness": [
      { label: "NCERT Textbooks", url: "https://ncert.nic.in/textbook.php" },
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ],
    Reasoning: [
      { label: "Official SSC website", url: "https://ssc.gov.in" }
    ]
  };

  const subjectPlan = {
    Maths: {
      goal: `Study ${chapter} like a book: concept, formula, solved example, SSC pattern, and timed practice.`,
      stages: [
        { id: "concept", label: "01 Concept", title: "Meaning and use", points: [`Understand what ${chapter} means in simple words.`, "Write where this topic appears in real questions.", "Learn the basic terms before formula."], example: "Read the concept, then make one small self-example using marks, money, speed, or work.", practice: "Write 5 easy examples from daily life." },
        { id: "formula", label: "02 Formula", title: "Formula notebook", points: ["Write the main formula.", "Write what each symbol means.", "Solve slowly without timer first."], example: "Use one direct formula question and show each step clearly.", practice: "Solve 10 beginner questions." },
        { id: "exam", label: "03 SSC Pattern", title: "Exam practice", points: ["Learn common SSC question types.", "Use short calculation methods only after concept is clear.", "Keep a mistake notebook."], example: "Take one exam-style question and solve it in under 90 seconds.", practice: "Solve 15 timed questions and mark weak type." }
      ]
    },
    Reasoning: {
      goal: `Study ${chapter} with pattern rules, examples, and SSC speed practice.`,
      stages: [
        { id: "rule", label: "01 Rule", title: "Understand the logic", points: ["Find the hidden rule.", "Write pattern in rough work.", "Check simple patterns before complex ones."], example: "If a sequence changes by +2, +4, +6, the next gap is usually +8.", practice: "Solve 10 easy pattern questions." },
        { id: "types", label: "02 Types", title: "Common question types", points: ["Learn 3 to 5 common types.", "Make a shortcut note for each type.", "Practice one type at a time."], example: "For coding-decoding, compare letters and positions first.", practice: "Solve 20 mixed questions." },
        { id: "speed", label: "03 Speed", title: "Timed SSC practice", points: ["Use a timer.", "Skip if stuck for more than 45 seconds.", "Review wrong answers after the set."], example: "15 questions in 10 minutes is a good first speed target.", practice: "Do one 10-minute drill." }
      ]
    },
    English: {
      goal: `Study ${chapter} with grammar rules, examples, error spotting, and revision practice.`,
      stages: [
        { id: "rule", label: "01 Rule", title: "Grammar rule", points: [`Learn the main rule for ${chapter}.`, "Write 3 correct examples.", "Write 1 wrong example and correct it."], example: "Correct: She goes to school. Wrong: She go to school.", practice: "Make a mini rule table in notebook." },
        { id: "usage", label: "02 Usage", title: "Sentence use", points: ["Read the full sentence.", "Check subject, verb, object, and modifiers.", "Notice signal words."], example: "Yesterday signals past tense: He went yesterday.", practice: "Correct 10 simple sentences." },
        { id: "ssc", label: "03 SSC Pattern", title: "Error spotting", points: ["Check subject-verb agreement first.", "Then check tense, preposition, article, and pronoun.", "Do not change a correct sentence."], example: "Each of the boys has a book. Not: have.", practice: "Solve 20 SSC error spotting questions." }
      ]
    },
    "General Awareness": {
      goal: `Study ${chapter} as static GK notes: facts, timeline, important terms, and daily revision.`,
      stages: [
        { id: "facts", label: "01 Facts", title: "Core facts", points: [`Read the basic facts of ${chapter}.`, "Make one-page notes.", "Underline names, dates, places, and terms."], example: "For history, write event - year - person - importance.", practice: "Write 20 one-line facts." },
        { id: "memory", label: "02 Memory", title: "Revision method", points: ["Use short notes, not long paragraphs.", "Revise after 1 day, 3 days, and 7 days.", "Convert facts into questions."], example: "Question: Who was the first President of India? Answer: Dr. Rajendra Prasad.", practice: "Make 15 flashcards." },
        { id: "exam", label: "03 SSC Pattern", title: "MCQ practice", points: ["Avoid guessing unless you can eliminate options.", "Revise repeated facts.", "Track weak areas."], example: "If two options are dates, check timeline order.", practice: "Solve 25 MCQs and revise wrong answers." }
      ]
    }
  };

  const plan = subjectPlan[subject] || subjectPlan.Maths;
  return {
    title: chapter,
    subject,
    goal: plan.goal,
    sources: sourceMap[subject] || [{ label: "Official SSC website", url: "https://ssc.gov.in" }],
    stages: plan.stages
  };
}

function buildStudyMaterial(subject, lesson, stage) {
  const topic = lesson.title;
  const pointText = stage.points.join(" ");
  const ruleName = subject === "Maths" ? "Formula" : subject === "Reasoning" ? "Pattern Rule" : subject === "English" ? "Grammar Rule" : "Memory Rule";
  const methodName = subject === "Maths" ? "Find given values -> choose formula -> calculate -> check units" : subject === "Reasoning" ? "Find pattern -> test rule -> remove wrong options -> answer" : subject === "English" ? "Read full sentence -> find grammar clue -> apply rule -> check meaning" : "Read fact -> connect topic -> make flashcard -> revise";
  const keywordName = subject === "Maths" ? "of, out of, more than, less than, total, difference" : subject === "Reasoning" ? "next, missing, same relation, odd one out, code, direction" : subject === "English" ? "is/are, has/have, yesterday, since/for, noun, verb, preposition" : "article, year, person, place, act, scheme, award, river, capital";
  const formulaLine = subject === "Maths"
    ? `Formula/Rule: learn the main rule for ${topic}. If the question gives a part and total, connect them carefully before calculating.`
    : `${ruleName}: for ${topic}, remember the rule first, then apply it to the sentence/question. Do not guess from feeling only.`;

  return {
    meaning: `${topic} - ${stage.title} means this: ${pointText} In simple words, this step teaches what the idea is and where SSC uses it. Read it once slowly, then say the meaning in your own words.`,
    formula: `${formulaLine} Method: ${methodName}. This is the part where most mistakes happen, so write the rule in your notebook before solving questions.`,
    example: `Example: ${stage.example} Do not just read it. Copy it once, underline the given values, then solve it again without looking.`,
    question: `Problem/Question practice: ${stage.practice} First solve slowly. After that, solve the same type again with a timer.`,
    trick: `Trick to master fast: watch the keywords: ${keywordName}. When you see these words, pause and choose the method. If stuck, ask: what is given, what is asked, what rule connects them?`
  };
}

function openStageExplain(subject, chapter, stageId, subjectIndex = 0) {
  const lesson = lessonCatalog[chapter] || createStarterLesson(subject, chapter);
  const stage = lesson.stages.find((item) => item.id === stageId);

  if (!stage) {
    showChapterLesson(subject, chapter, subjectIndex);
    return;
  }

  const subjectsBox = document.getElementById("subjects");
  const lessonBox = document.getElementById("lessonBox");
  const chapterList = document.getElementById("chapterList");
  const done = isLessonStageDone(lesson.title, stage.id);
  const safeSubject = subject.replace(/'/g, "\\'");
  const safeChapter = lesson.title.replace(/'/g, "\\'");
  const material = buildStudyMaterial(subject, lesson, stage);
  const readText = [
    `${stage.title}.`,
    material.meaning,
    material.formula,
    material.example,
    material.question,
    material.trick,
    "When this feels easy, tick mastered."
  ].join(" ").replace(/`/g, "'");

  if (subjectsBox) subjectsBox.style.display = "none";
  lessonBox.classList.add("lesson-detail-mode", "stage-explain-mode");
  document.getElementById("lessonTitle").textContent = `${lesson.title}: ${stage.title}`;
  document.getElementById("lessonIntro").textContent = "Study flow: meaning, formula or rule, example, question, then fast trick.";

  chapterList.innerHTML = `
    <div class="lesson-toolbar">
      <button class="secondary" onclick="showChapterLesson('${safeSubject}', '${safeChapter}', ${subjectIndex})">Back to ${lesson.title} course</button>
      <button onclick="openChapterInAI('${safeChapter}')">Ask Doubt</button>
      <button class="voice-button" onclick="lastAiAnswer = \`${readText}\`; readAIAnswer()">Read This Step</button>
    </div>
    <article class="teach-screen">
      <div class="teach-hero">
        ${getStageBadge(stage)}
        <h3>${stage.title}</h3>
        <p>${lesson.goal}</p>
      </div>
      <section class="study-material-card">
        <span>Study material order</span>
        <p>Start with meaning. Then learn the formula or rule. Then see one example. Then solve a problem. Last, use the trick and keyword method to become fast.</p>
      </section>
      <div class="teach-grid">
        <section class="teach-card lesson-paragraph">
          <h4>1. Meaning</h4>
          <p>${material.meaning}</p>
        </section>
        <section class="teach-card lesson-paragraph">
          <h4>2. Formula / Rule</h4>
          <p>${material.formula}</p>
          <ul>${stage.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        </section>
        <section class="teach-card lesson-paragraph">
          <h4>3. Example</h4>
          <p>${material.example}</p>
        </section>
        <section class="teach-card lesson-paragraph">
          <h4>4. Problem / Question</h4>
          <p>${material.question}</p>
        </section>
        <section class="teach-card master-check lesson-paragraph teach-wide-card">
          <h4>5. Trick to Master Fast</h4>
          <p>${material.trick}</p>
        </section>
      </div>
      <section class="study-flow-card">
        <strong>Use this method:</strong>
        <span>Meaning</span>
        <span>Formula/Rule</span>
        <span>Example</span>
        <span>Question</span>
        <span>Trick + Keywords</span>
      </section>
      <div class="master-actions">
        <button class="complete-stage tick-mastered" onclick="markLessonStage('${safeChapter}', '${stage.id}', '${safeSubject}', ${subjectIndex})">${done ? "Mastered" : "Tick Mastered"}</button>
        ${done ? `<button class="undo-stage" onclick="unmarkLessonStage('${safeChapter}', '${stage.id}', '${safeSubject}', ${subjectIndex}, true)">Not Learned Yet</button>` : ""}
        <button onclick="setAiQuestion('Teach me ${safeChapter}: ${stage.title} in this order: meaning, formula or rule, example, practice question, and fast trick with keywords.'); showView('ai-explainer')">Make AI Prompt</button>
        <button class="practice-stage" onclick="openStagePractice('${safeSubject}', '${safeChapter}', '${stage.id}', ${subjectIndex})">60s MCQ</button>
      </div>
    </article>
  `;
}
function stopPracticeChallengeTimer() {
  if (practiceChallengeTimer) {
    clearInterval(practiceChallengeTimer);
    practiceChallengeTimer = null;
  }
}

function normalizePracticeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/percent/g, "%")
    .replace(/[^a-z0-9.%/-]/g, "")
    .trim();
}

const practiceHistoryKey = "irlRpgPracticeHistory";

const practiceQuestionBank = [
  { chapter: "Percentage", stage: "noob", question: "You scored 40 marks out of 80. What is the percentage?", answer: "50%", options: ["40%", "45%", "50%", "60%"], accepted: ["50", "50%"], method: "Use percentage = part / whole x 100. Here part = 40 and whole = 80, so 40 / 80 x 100 = 50%." },
  { chapter: "Percentage", stage: "noob", question: "25% means what?", answer: "25 out of 100", options: ["25 out of 100", "25 out of 10", "25 out of 1000", "100 out of 25"], accepted: ["25 out of 100"], method: "Percent means per 100. So 25% means 25 for every 100." },
  { chapter: "Percentage", stage: "noob", question: "Which fraction is equal to 50%?", answer: "1/2", options: ["1/4", "1/2", "1/5", "3/4"], accepted: ["1/2", "half"], method: "50% means 50/100. Reduce 50/100 to 1/2." },
  { chapter: "Percentage", stage: "noob", question: "Which fraction is equal to 25%?", answer: "1/4", options: ["1/2", "1/3", "1/4", "1/5"], accepted: ["1/4"], method: "25% means 25/100. Reduce it to 1/4." },
  { chapter: "Percentage", stage: "noob", question: "30 out of 100 is equal to what percent?", answer: "30%", options: ["3%", "30%", "70%", "300%"], accepted: ["30", "30%"], method: "When the total is already 100, the part is the percentage. 30 out of 100 = 30%." },
  { chapter: "Percentage", stage: "noob", question: "Which word is closest to percentage?", answer: "Per 100", options: ["Per 10", "Per 100", "Per 1000", "Per year"], accepted: ["per 100"], method: "Percentage literally means per hundred, or per 100." },

  { chapter: "Percentage", stage: "basic", question: "Find 15% of 200.", answer: "30", options: ["15", "20", "30", "35"], accepted: ["30"], method: "Use part = percentage x whole / 100. So 15 x 200 / 100 = 30. Keyword is 'of', which means multiply." },
  { chapter: "Percentage", stage: "basic", question: "Find 20% of 350.", answer: "70", options: ["35", "50", "70", "90"], accepted: ["70"], method: "20% of 350 = 20 x 350 / 100 = 70." },
  { chapter: "Percentage", stage: "basic", question: "Find 35% of 900.", answer: "315", options: ["270", "300", "315", "350"], accepted: ["315"], method: "35% of 900 = 35 x 900 / 100 = 315." },
  { chapter: "Percentage", stage: "basic", question: "What is 12.5% of 480?", answer: "60", options: ["48", "50", "60", "80"], accepted: ["60"], method: "12.5% = 1/8. So 480 / 8 = 60." },
  { chapter: "Percentage", stage: "basic", question: "If 45 is 15% of a number, what is the number?", answer: "300", options: ["200", "250", "300", "350"], accepted: ["300"], method: "Whole = part x 100 / percentage. So 45 x 100 / 15 = 300." },
  { chapter: "Percentage", stage: "basic", question: "Convert 3/4 into percentage.", answer: "75%", options: ["25%", "50%", "75%", "80%"], accepted: ["75", "75%"], method: "3/4 x 100 = 75%." },

  { chapter: "Percentage", stage: "exam", question: "A price of 1000 is increased by 20%, then decreased by 10%. What is the final price?", answer: "1080", options: ["900", "1080", "1100", "1200"], accepted: ["1080"], method: "Successive percentage changes are multiplied. 1000 x 1.20 x 0.90 = 1080. Do not do 20 - 10 directly." },
  { chapter: "Percentage", stage: "exam", question: "A salary increases from 20000 to 24000. What is the percentage increase?", answer: "20%", options: ["10%", "15%", "20%", "25%"], accepted: ["20", "20%"], method: "Increase = 4000. Percentage increase = 4000 / 20000 x 100 = 20%." },
  { chapter: "Percentage", stage: "exam", question: "A number decreases from 500 to 400. What is the percentage decrease?", answer: "20%", options: ["10%", "20%", "25%", "40%"], accepted: ["20", "20%"], method: "Decrease = 100. Percentage decrease = 100 / 500 x 100 = 20%." },
  { chapter: "Percentage", stage: "exam", question: "A value is increased by 10% and then by 20%. What is the total percentage increase?", answer: "32%", options: ["30%", "31%", "32%", "35%"], accepted: ["32", "32%"], method: "Successive increase = 1.10 x 1.20 = 1.32, so total increase is 32%." },
  { chapter: "Percentage", stage: "exam", question: "If 60% of students passed and 80 failed, how many students were there?", answer: "200", options: ["120", "160", "200", "240"], accepted: ["200"], method: "If 60% passed, 40% failed. 40% = 80, so total = 80 x 100 / 40 = 200." },
  { chapter: "Percentage", stage: "exam", question: "A shop gives 20% discount on 500. What is the selling price?", answer: "400", options: ["300", "350", "400", "450"], accepted: ["400"], method: "Discount = 20% of 500 = 100. Selling price = 500 - 100 = 400." },

  { chapter: "Percentage", stage: "tricks", question: "Find 12.5% of 640.", answer: "80", options: ["64", "72", "80", "96"], accepted: ["80"], method: "12.5% means 1/8. So 640 / 8 = 80. Trick keyword: 12.5% = one eighth." },
  { chapter: "Percentage", stage: "tricks", question: "Find 25% of 760.", answer: "190", options: ["180", "190", "200", "210"], accepted: ["190"], method: "25% = 1/4. So 760 / 4 = 190." },
  { chapter: "Percentage", stage: "tricks", question: "Find 10% of 970.", answer: "97", options: ["9.7", "87", "97", "107"], accepted: ["97"], method: "10% means divide by 10. 970 / 10 = 97." },
  { chapter: "Percentage", stage: "tricks", question: "Find 5% of 840.", answer: "42", options: ["21", "40", "42", "84"], accepted: ["42"], method: "5% is half of 10%. 10% of 840 = 84, half is 42." },
  { chapter: "Percentage", stage: "tricks", question: "Find 1% of 5600.", answer: "56", options: ["5.6", "56", "560", "5600"], accepted: ["56"], method: "1% means divide by 100. 5600 / 100 = 56." },
  { chapter: "Percentage", stage: "tricks", question: "Find 16.66% of 300 approximately.", answer: "50", options: ["30", "45", "50", "60"], accepted: ["50"], method: "16.66% is about 1/6. 300 / 6 = 50." },

  { chapter: "Percentage", stage: "master", question: "If A is 25% more than B, then B is what percent less than A?", answer: "20%", options: ["15%", "20%", "25%", "30%"], accepted: ["20", "20%"], method: "Take B = 100, so A = 125. Difference = 25. B is less than A by 25 / 125 x 100 = 20%. Base changes to A." },
  { chapter: "Percentage", stage: "master", question: "If A is 20% less than B, then B is what percent more than A?", answer: "25%", options: ["20%", "25%", "30%", "40%"], accepted: ["25", "25%"], method: "Take B = 100, A = 80. Difference = 20. B is more than A by 20 / 80 x 100 = 25%." },
  { chapter: "Percentage", stage: "master", question: "A number is first increased by 25% and then decreased by 20%. Net change?", answer: "No change", options: ["5% increase", "5% decrease", "No change", "10% increase"], accepted: ["no change", "0", "0%"], method: "Multiply factors: 1.25 x 0.80 = 1.00. So there is no net change." },
  { chapter: "Percentage", stage: "master", question: "If 40% of x = 80, then x = ?", answer: "200", options: ["120", "160", "200", "240"], accepted: ["200"], method: "x = 80 x 100 / 40 = 200." },
  { chapter: "Percentage", stage: "master", question: "In an exam, 35% failed and 260 passed. Total students?", answer: "400", options: ["300", "350", "400", "450"], accepted: ["400"], method: "If 35% failed, 65% passed. 65% = 260, so total = 260 x 100 / 65 = 400." },
  { chapter: "Percentage", stage: "master", question: "A is 150% of B. If B = 80, A = ?", answer: "120", options: ["100", "110", "120", "150"], accepted: ["120"], method: "A = 150% of 80 = 150 x 80 / 100 = 120." },

  { chapter: "Ratio and Proportion", stage: "meaning", question: "Simplify the ratio 20:30.", answer: "2:3", options: ["1:3", "2:3", "3:2", "4:5"], accepted: ["2:3", "23"], method: "Divide both sides by the same number. 20 and 30 divide by 10, so 20:30 = 2:3." },
  { chapter: "Profit and Loss", stage: "formula", question: "CP is 800 and SP is 1000. What is the profit percent?", answer: "25%", options: ["20%", "25%", "30%", "35%"], accepted: ["25", "25%"], method: "Profit = SP - CP = 200. Profit% = profit / CP x 100 = 200 / 800 x 100 = 25%." },
  { chapter: "Series", stage: "patterns", question: "Find the next term: 2, 5, 10, 17, 26, ?", answer: "37", options: ["35", "36", "37", "39"], accepted: ["37"], method: "Differences are +3, +5, +7, +9. Next difference is +11, so 26 + 11 = 37." },
  { chapter: "Parts of Speech", stage: "names", question: "In 'The smart student quickly solved the question', what part of speech is 'quickly'?", answer: "Adverb", options: ["Noun", "Verb", "Adjective", "Adverb"], accepted: ["adverb"], method: "Quickly tells how the action was done. Words that describe a verb/action are adverbs." },
  { chapter: "Tenses", stage: "time", question: "Change to past tense: I study.", answer: "I studied", options: ["I study", "I studied", "I studying", "I will study"], accepted: ["istudied", "studied"], method: "Past tense means the action already happened. Study becomes studied, so the answer is 'I studied'." },
  { chapter: "Indian Polity", stage: "constitution", question: "What is the supreme law of India?", answer: "The Constitution of India", options: ["Parliament", "Supreme Court", "The Constitution of India", "Election Commission"], accepted: ["constitution", "constitutionofindia"], method: "The Constitution is the supreme law. It explains rights, duties, powers, and government structure." }
];

function cleanMcqNumber(value) {
  const fixed = Number(value.toFixed(2));
  return Number.isInteger(fixed) ? String(fixed) : String(fixed).replace(/\.00$/, "");
}

function cleanMcqPercent(value) {
  return `${cleanMcqNumber(value)}%`;
}

function makeMcqOptions(correct, distractors, seed = 0) {
  const unique = [];
  [correct, ...distractors].forEach((item) => {
    const text = String(item);
    if (!unique.includes(text)) unique.push(text);
  });
  let guard = 1;
  while (unique.length < 4) {
    unique.push(String(Number.parseFloat(String(correct)) + guard * 5));
    guard += 1;
  }
  const options = unique.slice(0, 4);
  const shift = Math.abs(seed) % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function addPracticeQuestion(item) {
  const exists = practiceQuestionBank.some((question) => question.chapter === item.chapter && question.stage === item.stage && question.question === item.question);
  if (!exists) practiceQuestionBank.push(item);
}

function addPercentageMcq(stage, question, answer, options, method) {
  addPracticeQuestion({
    chapter: "Percentage",
    stage,
    question,
    answer,
    options,
    accepted: [String(answer), String(answer).replace("%", "")],
    method
  });
}

function fillPercentageNoobQuestions() {
  const outOfHundred = [5, 10, 15, 20, 35, 40, 45, 55, 60, 65, 70, 80];
  outOfHundred.forEach((part, index) => {
    const answer = cleanMcqPercent(part);
    addPercentageMcq("noob", `${part} out of 100 is what percentage?`, answer, makeMcqOptions(answer, [cleanMcqPercent(part + 5), cleanMcqPercent(100 - part), cleanMcqPercent(Math.max(1, part - 5))], index), `Percent means out of 100. So ${part} out of 100 is ${part}%.`);
  });

  [["1/5", "20%"], ["1/10", "10%"], ["3/10", "30%"], ["2/5", "40%"], ["3/5", "60%"], ["4/5", "80%"], ["1/8", "12.5%"], ["3/8", "37.5%"], ["5/8", "62.5%"], ["7/8", "87.5%"], ["1/3", "33.33%"], ["2/3", "66.66%"]].forEach(([fraction, answer], index) => {
    addPercentageMcq("noob", `Which percentage is equal to ${fraction}?`, answer, makeMcqOptions(answer, ["25%", "50%", "75%", "100%"], index + 10), `Convert a fraction to percentage by multiplying by 100. ${fraction} x 100 = ${answer}.`);
  });
}

function fillPercentageBasicQuestions() {
  [[10, 450], [15, 600], [18, 500], [22, 300], [24, 250], [30, 700], [32, 400], [40, 850], [45, 200], [55, 600], [75, 320], [80, 150]].forEach(([percent, whole], index) => {
    const value = percent * whole / 100;
    const answer = cleanMcqNumber(value);
    addPercentageMcq("basic", `Find ${percent}% of ${whole}.`, answer, makeMcqOptions(answer, [cleanMcqNumber(value + 10), cleanMcqNumber(Math.max(1, value - 10)), cleanMcqNumber(value + 20)], index), `${percent}% of ${whole} = ${percent} x ${whole} / 100 = ${answer}. Keyword: "of" means multiply.`);
  });

  [[20, 60], [25, 90], [30, 150], [40, 220], [45, 135], [50, 275], [60, 360], [75, 450], [80, 640], [12.5, 50], [37.5, 150], [62.5, 250]].forEach(([percent, part], index) => {
    const whole = part * 100 / percent;
    const answer = cleanMcqNumber(whole);
    addPercentageMcq("basic", `If ${part} is ${cleanMcqPercent(percent)} of a number, what is the number?`, answer, makeMcqOptions(answer, [cleanMcqNumber(whole + 50), cleanMcqNumber(Math.max(1, whole - 50)), cleanMcqNumber(whole + 100)], index + 20), `Use Whole = Part x 100 / Percentage. So ${part} x 100 / ${percent} = ${answer}.`);
  });
}

function fillPercentageExamQuestions() {
  [[800, 10, "increase"], [1200, 15, "increase"], [2500, 20, "increase"], [600, 25, "increase"], [900, 10, "decrease"], [1500, 20, "decrease"], [2400, 25, "decrease"], [3600, 15, "decrease"]].forEach(([base, percent, type], index) => {
    const finalValue = type === "increase" ? base * (100 + percent) / 100 : base * (100 - percent) / 100;
    const answer = cleanMcqNumber(finalValue);
    const word = type === "increase" ? "increased" : "decreased";
    addPercentageMcq("exam", `${base} is ${word} by ${percent}%. What is the new value?`, answer, makeMcqOptions(answer, [cleanMcqNumber(finalValue + 100), cleanMcqNumber(Math.max(1, finalValue - 100)), cleanMcqNumber(base)], index), `${word} by ${percent}% means multiply by ${(type === "increase" ? 100 + percent : 100 - percent)}/100. New value = ${answer}.`);
  });

  [[500, 650], [750, 900], [1200, 960], [1600, 2000], [2500, 2250], [3200, 4000]].forEach(([oldValue, newValue], index) => {
    const change = newValue - oldValue;
    const percent = Math.abs(change) / oldValue * 100;
    const answer = cleanMcqPercent(percent);
    const word = change >= 0 ? "increase" : "decrease";
    addPercentageMcq("exam", `A value changes from ${oldValue} to ${newValue}. What is the percentage ${word}?`, answer, makeMcqOptions(answer, [cleanMcqPercent(percent + 5), cleanMcqPercent(Math.max(1, percent - 5)), cleanMcqPercent(percent + 10)], index + 10), `${word} = ${Math.abs(change)}. Percentage ${word} = ${Math.abs(change)} / ${oldValue} x 100 = ${answer}. Always use the old value as base.`);
  });

  [[30, 70, "failed"], [40, 120, "failed"], [25, 150, "failed"], [65, 260, "passed"], [75, 450, "passed"], [20, 80, "failed"], [55, 330, "passed"], [35, 140, "failed"], [80, 640, "passed"], [45, 180, "failed"]].forEach(([percent, count, type], index) => {
    const total = count * 100 / percent;
    const answer = cleanMcqNumber(total);
    addPercentageMcq("exam", `${cleanMcqPercent(percent)} students ${type}. If ${count} students ${type}, total students = ?`, answer, makeMcqOptions(answer, [cleanMcqNumber(total + 50), cleanMcqNumber(Math.max(1, total - 50)), cleanMcqNumber(total + 100)], index + 20), `Here ${percent}% = ${count}. Total = ${count} x 100 / ${percent} = ${answer}.`);
  });
}

function fillPercentageTrickQuestions() {
  [[10, 930, "divide by 10"], [5, 780, "half of 10%"], [1, 6500, "divide by 100"], [25, 880, "one fourth"], [50, 1460, "half"], [75, 360, "three fourths"], [12.5, 720, "one eighth"], [37.5, 640, "three eighths"], [62.5, 960, "five eighths"], [87.5, 800, "seven eighths"], [20, 450, "one fifth"], [40, 750, "two fifths"], [60, 550, "three fifths"], [80, 1250, "four fifths"], [33.33, 600, "one third"], [66.66, 900, "two thirds"], [16.66, 420, "one sixth"], [8.33, 960, "one twelfth"], [2.5, 1200, "half of 5%"], [7.5, 800, "5% + 2.5%"], [15, 360, "10% + 5%"], [35, 700, "25% + 10%"], [45, 600, "50% - 5%"], [90, 430, "100% - 10%"]].forEach(([percent, whole, trick], index) => {
    const value = percent * whole / 100;
    const answer = cleanMcqNumber(value);
    addPercentageMcq("tricks", `Using the fast trick, find ${cleanMcqPercent(percent)} of ${whole}.`, answer, makeMcqOptions(answer, [cleanMcqNumber(value + 20), cleanMcqNumber(Math.max(1, value - 20)), cleanMcqNumber(value + 40)], index), `${cleanMcqPercent(percent)} can be solved as ${trick}. So ${cleanMcqPercent(percent)} of ${whole} = ${answer}.`);
  });
}

function fillPercentageMasterQuestions() {
  [[10, "more"], [20, "more"], [25, "more"], [50, "more"], [75, "more"], [100, "more"], [10, "less"], [20, "less"], [25, "less"], [40, "less"], [50, "less"], [60, "less"]].forEach(([percent, type], index) => {
    const answerValue = type === "more" ? percent / (100 + percent) * 100 : percent / (100 - percent) * 100;
    const answer = cleanMcqPercent(answerValue);
    const question = type === "more" ? `If A is ${percent}% more than B, then B is what percent less than A?` : `If A is ${percent}% less than B, then B is what percent more than A?`;
    addPercentageMcq("master", question, answer, makeMcqOptions(answer, [cleanMcqPercent(percent), cleanMcqPercent(answerValue + 5), cleanMcqPercent(Math.max(1, answerValue - 5))], index), type === "more" ? `Take B = 100. Then A = ${100 + percent}. Difference = ${percent}. Less percent is ${percent} / ${100 + percent} x 100 = ${answer}. Base changes to A.` : `Take B = 100. Then A = ${100 - percent}. Difference = ${percent}. More percent is ${percent} / ${100 - percent} x 100 = ${answer}. Base changes to A.`);
  });

  [[10, 10], [20, 20], [25, 20], [30, 10], [40, 25], [50, 20], [15, 15], [12.5, 20], [25, 25], [60, 25], [75, 20], [100, 50]].forEach(([increase, decrease], index) => {
    const net = (1 + increase / 100) * (1 - decrease / 100) * 100 - 100;
    const answer = Math.abs(net) < 0.01 ? "No change" : `${cleanMcqPercent(Math.abs(net))} ${net > 0 ? "increase" : "decrease"}`;
    addPercentageMcq("master", `A value is increased by ${increase}% and then decreased by ${decrease}%. What is the net change?`, answer, makeMcqOptions(answer, ["No change", `${cleanMcqPercent(increase - decrease)} increase`, `${cleanMcqPercent(Math.abs(increase - decrease))} decrease`], index + 20), `Successive percentage changes are multiplied: ${(1 + increase / 100).toFixed(2)} x ${(1 - decrease / 100).toFixed(2)}. Net change = ${answer}. Do not just subtract percentages blindly.`);
  });
}

function fillPercentagePracticeBank() {
  fillPercentageNoobQuestions();
  fillPercentageBasicQuestions();
  fillPercentageExamQuestions();
  fillPercentageTrickQuestions();
  fillPercentageMasterQuestions();
}

fillPercentagePracticeBank();
addPercentageMcq("master", "If A is 30% more than B, then B is what percent less than A?", "23.08%", makeMcqOptions("23.08%", ["20%", "25%", "30%"], 91), "Take B = 100. Then A = 130. Difference = 30. B is less than A by 30 / 130 x 100 = 23.08%. Base changes to A.");
addPercentageMcq("master", "A value is increased by 40% and then decreased by 10%. What is the net change?", "26% increase", makeMcqOptions("26% increase", ["30% increase", "4% decrease", "No change"], 92), "Successive percentage changes are multiplied. 1.40 x 0.90 = 1.26, so the net change is 26% increase.");
function getPracticeHistory(key) {
  try {
    return JSON.parse(localStorage.getItem(practiceHistoryKey))?.[key] || [];
  } catch (_) {
    return [];
  }
}

function savePracticeHistory(key, question) {
  let history = {};
  try {
    history = JSON.parse(localStorage.getItem(practiceHistoryKey)) || {};
  } catch (_) {
    history = {};
  }
  history[key] = [...(history[key] || []), question].slice(-60);
  localStorage.setItem(practiceHistoryKey, JSON.stringify(history));
}

function pickPracticeQuestion(pool, key) {
  const history = getPracticeHistory(key);
  const fresh = pool.filter((item) => !history.includes(item.question));
  const choices = fresh.length ? fresh : pool;
  const selected = choices[Math.floor(Math.random() * choices.length)];
  savePracticeHistory(key, selected.question);
  return selected;
}

function getPracticeStageCount(lesson, stage) {
  return practiceQuestionBank.filter((item) => item.chapter === lesson.title && item.stage === stage.id).length;
}

function getPracticeBankNote(lesson, stage) {
  const stageCount = getPracticeStageCount(lesson, stage);
  if (stageCount) {
    const levelName = stage.label.replace(/^\d+\s*/, "");
    return `${stageCount} questions in this ${levelName} level bank. Random question, no repeats until the pool cycles.`;
  }
  const chapterCount = practiceQuestionBank.filter((item) => item.chapter === lesson.title).length;
  return `${chapterCount} mixed questions in this chapter bank. Random question, no repeats until the pool cycles.`;
}

function getStageChallenge(subject, lesson, stage) {
  const chapterPool = practiceQuestionBank.filter((item) => item.chapter === lesson.title);
  const stagePool = practiceQuestionBank.filter((item) => item.chapter === lesson.title && item.stage === stage.id);
  if (stagePool.length) return pickPracticeQuestion(stagePool, `${lesson.title}:${stage.id}`);

  if (chapterPool.length) return pickPracticeQuestion(chapterPool, `${lesson.title}:mixed`);

  const fallbackWords = stage.title.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  return {
    chapter: lesson.title,
    stage: stage.id,
    question: `Quick check: what is the main idea of '${stage.title}'?`,
    answer: stage.points[0],
    options: [stage.points[0], "Skip the concept", "Only memorize answers", "None of these"],
    accepted: fallbackWords,
    method: `This step is about ${stage.title}. Main idea: ${stage.points.join(" ")} Example: ${stage.example}`
  };
}
function buildMcqOptions(answer) {
  const presets = {
    "50%": ["40%", "45%", "50%", "60%"],
    "30": ["15", "20", "30", "35"],
    "1080": ["900", "1080", "1100", "1200"],
    "80": ["64", "72", "80", "96"],
    "20%": ["15%", "20%", "25%", "30%"],
    "2:3": ["1:3", "2:3", "3:2", "4:5"],
    "25%": ["20%", "25%", "30%", "35%"],
    "37": ["35", "36", "37", "39"],
    "Adverb": ["Noun", "Verb", "Adjective", "Adverb"],
    "I studied": ["I study", "I studied", "I studying", "I will study"],
    "The Constitution of India": ["Parliament", "Supreme Court", "The Constitution of India", "Election Commission"]
  };

  if (presets[answer]) return presets[answer];
  return [answer, "None of these", "Cannot say", "All of these"];
}

function renderMcqOptions(challenge) {
  const options = challenge.options || buildMcqOptions(challenge.answer);
  const labels = ["A", "B", "C", "D"];
  return options.map((option, index) => `
    <button class="mcq-option" onclick="submitStagePractice('${String(option).replace(/'/g, "\\'")}')">
      <span>${labels[index]}</span>
      <strong>${option}</strong>
    </button>
  `).join("");
}
function isPracticeAnswerCorrect(answer, challenge) {
  const normalized = normalizePracticeAnswer(answer);
  return challenge.accepted.some((item) => normalized.includes(normalizePracticeAnswer(item)));
}

function openStagePractice(subject, chapter, stageId, subjectIndex = 0) {
  const lesson = lessonCatalog[chapter] || createStarterLesson(subject, chapter);
  const stage = lesson.stages.find((item) => item.id === stageId);
  if (!stage) return;

  stopPracticeChallengeTimer();
  const subjectsBox = document.getElementById("subjects");
  const lessonBox = document.getElementById("lessonBox");
  const chapterList = document.getElementById("chapterList");
  const safeSubject = subject.replace(/'/g, "\\'");
  const safeChapter = lesson.title.replace(/'/g, "\\'");
  const challenge = getStageChallenge(subject, lesson, stage);
  const challengeLabel = `${stage.label} Practice`;
  const bankNote = getPracticeBankNote(lesson, stage);
  currentPracticeChallenge = { subject, chapter: lesson.title, stageId, subjectIndex, lesson, stage, challenge, timeLeft: 60 };

  if (subjectsBox) subjectsBox.style.display = "none";
  lessonBox.classList.add("lesson-detail-mode", "stage-explain-mode");
  document.getElementById("lessonTitle").textContent = `${lesson.title}: 60s MCQ`;
  document.getElementById("lessonIntro").textContent = "Difficulty scales with the lesson step: Noob to Master. Pick one MCQ answer before the timer ends.";

  chapterList.innerHTML = `
    <div class="lesson-toolbar">
      <button class="secondary" onclick="stopPracticeChallengeTimer(); openStageExplain('${safeSubject}', '${safeChapter}', '${stage.id}', ${subjectIndex})">Back to lesson</button>
    </div>
    <article class="practice-screen">
      <div class="practice-top">
        <span class="practice-level-label">${challengeLabel}</span>
        <strong id="practiceTimer">60</strong>
      </div>
      <h3>${challenge.question}</h3>
      <p class="practice-bank-note">${bankNote}</p>
      <div class="mcq-options">
        ${renderMcqOptions(challenge)}
      </div>
      <div class="practice-actions">
        <button class="voice-button" onclick="lastAiAnswer = '${challenge.question.replace(/'/g, "\\'")}'; readAIAnswer()">Read Question</button>
      </div>
    </article>
  `;


  practiceChallengeTimer = setInterval(() => {
    if (!currentPracticeChallenge) return;
    currentPracticeChallenge.timeLeft -= 1;
    const timerBox = document.getElementById("practiceTimer");
    if (timerBox) timerBox.textContent = String(currentPracticeChallenge.timeLeft);
    if (currentPracticeChallenge.timeLeft <= 0) {
      showPracticeResult("timeout", "");
    }
  }, 1000);
}

function submitStagePractice(answer) {
  if (!currentPracticeChallenge) return;
  const status = isPracticeAnswerCorrect(answer, currentPracticeChallenge.challenge) ? "correct" : "wrong";
  showPracticeResult(status, answer);
}

function showPracticeResult(status, answer) {
  if (!currentPracticeChallenge) return;
  stopPracticeChallengeTimer();

  const { subject, chapter, stageId, subjectIndex, lesson, stage, challenge } = currentPracticeChallenge;
  const material = buildStudyMaterial(subject, lesson, stage);
  const safeSubject = subject.replace(/'/g, "\\'");
  const safeChapter = chapter.replace(/'/g, "\\'");
  const statusText = status === "correct" ? "Correct" : status === "wrong" ? "Wrong" : "Time Over";
  const statusClass = status === "correct" ? "result-correct" : status === "wrong" ? "result-wrong" : "result-timeout";
  const bankNote = getPracticeBankNote(lesson, stage);

  document.getElementById("lessonTitle").textContent = `${lesson.title}: Practice Result`;
  document.getElementById("lessonIntro").textContent = "Now learn the full method. This part matters more than the score.";
  document.getElementById("chapterList").innerHTML = `
    <article class="practice-result ${statusClass}">
      <div class="result-badge">${statusText}</div>
      <h3>${challenge.question}</h3>
      <p class="practice-bank-note">${bankNote}</p>
      <div class="result-grid">
        <section>
          <span>Your answer</span>
          <strong>${answer ? answer : "No answer"}</strong>
        </section>
        <section>
          <span>Correct answer</span>
          <strong>${challenge.answer}</strong>
        </section>
      </div>
      <div class="full-explain-card">
        <h4>Full Explanation</h4>
        <p>${challenge.method}</p>
        <p>${material.formula}</p>
        <p>${material.trick}</p>
      </div>
      <div class="master-actions">
        <button onclick="openStagePractice('${safeSubject}', '${safeChapter}', '${stageId}', ${subjectIndex})">Try Again 60s MCQ</button>
        <button class="secondary" onclick="openStageExplain('${safeSubject}', '${safeChapter}', '${stageId}', ${subjectIndex})">Back to Lesson</button>
        <button class="complete-stage tick-mastered" onclick="markLessonStage('${safeChapter}', '${stageId}', '${safeSubject}', ${subjectIndex})">Tick Mastered</button>
      </div>
    </article>
  `;
}
function showChapterLesson(subject, chapter, subjectIndex = 0) {
  const lesson = lessonCatalog[chapter] || createStarterLesson(subject, chapter);
  const subjectsBox = document.getElementById("subjects");
  const lessonBox = document.getElementById("lessonBox");
  const chapterList = document.getElementById("chapterList");

  if (subjectsBox) subjectsBox.style.display = "none";
  lessonBox.classList.add("lesson-detail-mode");
  lessonBox.classList.remove("stage-explain-mode");
  document.getElementById("lessonTitle").textContent = `${lesson.title} Course`;
  document.getElementById("lessonIntro").textContent = lesson.goal;

  const doneCount = lesson.stages.filter((stage) => isLessonStageDone(lesson.title, stage.id)).length;
  const progressPercent = Math.round((doneCount / lesson.stages.length) * 100);
  const guide = getChapterGuide(subject, lesson.title);

  chapterList.innerHTML = `
    <div class="lesson-toolbar">
      <button class="secondary" onclick="showLesson(${subjectIndex})">Back to ${subject} chapters</button>
      <button onclick="openChapterInAI('${lesson.title.replace(/'/g, "\\'")}')">Ask Doubt</button>
    </div>
    <div class="chapter-map-card">
      <span>${guide.level} - ${guide.type}</span>
      <strong>Why learn this:</strong> ${guide.why}
      <div>Connects with: ${guide.connects.map((topic) => `<b>${topic}</b>`).join(" ")}</div>
    </div>
    <div class="lesson-progress-card">
      <span>${doneCount}/${lesson.stages.length} steps complete</span>
      <div class="bar"><div style="width:${progressPercent}%"></div></div>
    </div>
  `;

  lesson.stages.forEach((stage) => {
    const done = isLessonStageDone(lesson.title, stage.id);
    const stageCard = document.createElement("article");
    stageCard.className = `lesson-stage ${done ? "stage-done" : ""}`;
    stageCard.innerHTML = `
      <div class="stage-head">
        ${getStageBadge(stage)}
        <strong>${stage.title}</strong>
      </div>
      <ul>${stage.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      <div class="example-box"><strong>Example:</strong> ${stage.example}</div>
      <div class="practice-box"><strong>Practice:</strong> ${stage.practice}</div>
      <div class="stage-actions">
        <button class="explain-stage" onclick="openStageExplain('${subject.replace(/'/g, "\\'")}', '${lesson.title.replace(/'/g, "\\'")}', '${stage.id}', ${subjectIndex})">Explain</button>
        <button class="complete-stage" onclick="markLessonStage('${lesson.title.replace(/'/g, "\\'")}', '${stage.id}', '${subject.replace(/'/g, "\\'")}', ${subjectIndex})">${done ? "Completed" : "Mark Complete"}</button>
        ${done ? `<button class="undo-stage" onclick="unmarkLessonStage('${lesson.title.replace(/'/g, "\\'")}', '${stage.id}', '${subject.replace(/'/g, "\\'")}', ${subjectIndex})">Not Learned Yet</button>` : ""}
      </div>
    `;
    chapterList.appendChild(stageCard);
  });

  const sourceBox = document.createElement("div");
  sourceBox.className = "source-box";
  sourceBox.innerHTML = `<strong>Study sources:</strong> ${lesson.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}`;
  chapterList.appendChild(sourceBox);
}

function openChapterInAI(chapter) {
  setAiQuestion(`I have a doubt in ${chapter}. Detect the subject and chapter, then make a clean SSC exam prompt with examples and practice questions.`);
  showView("ai-explainer");
}
const currentAffairsStudyCards = [
  { title: "Government Schemes", text: "If news mentions a ministry, scheme, launch, portal, benefit, or target group, write: scheme name, ministry, aim, beneficiaries, and one fact." },
  { title: "Appointments and Awards", text: "For SSC, remember who, post or award, organization, country or state, and why it was in news." },
  { title: "Economy and Budget", text: "Track RBI, inflation, GDP, budget, taxes, banking, and major reports. Convert every item into one MCQ fact." },
  { title: "Science and Environment", text: "Mark missions, satellites, diseases, species, protected areas, climate reports, and discoveries." }
];

function setupNewsTabs() {
  document.querySelectorAll(".news-tab").forEach((button) => {
    button.addEventListener("click", () => showNewsTab(button.dataset.newsTab));
  });
}

function showNewsTab(tabId) {
  document.querySelectorAll(".news-tab").forEach((button) => button.classList.toggle("active", button.dataset.newsTab === tabId));
  document.querySelectorAll(".news-pane").forEach((pane) => pane.classList.toggle("active-news-pane", pane.id === tabId));
}

function getExamActionFromTitle(title) {
  const text = String(title || "").toLowerCase();
  if (/admit card|city|intimation|hall ticket/.test(text)) return "Check login, exam city, admit card, ID proof, reporting time, and travel plan.";
  if (/notification|vacancy|recruitment/.test(text)) return "Read eligibility, vacancy, dates, fee, age limit, and syllabus before applying.";
  if (/answer key|response/.test(text)) return "Download response sheet, calculate score, and check objection window.";
  if (/result|cut.?off|marks/.test(text)) return "Check roll number, marks, cutoff, next stage, and document list.";
  if (/calendar|schedule|exam date/.test(text)) return "Add dates to planner and reverse-plan mock tests and revision.";
  return "Open the source, verify date/details, then write one action item in your notebook.";
}

function getCurrentAffairsFocus(title) {
  const text = String(title || "").toLowerCase();
  if (/scheme|yojana|minister|ministry|cabinet|government/.test(text)) return "Possible SSC angle: scheme/ministry/aim/beneficiary.";
  if (/rbi|bank|inflation|gdp|budget|tax|economy/.test(text)) return "Possible SSC angle: economy term, institution, report, number.";
  if (/space|isro|science|mission|satellite|environment|climate/.test(text)) return "Possible SSC angle: science/environment fact and organization.";
  if (/award|appointed|president|prime minister|chief|rank/.test(text)) return "Possible SSC angle: person, post, award, place, rank.";
  if (/sports|championship|cup|medal/.test(text)) return "Possible SSC angle: sport, winner, venue, trophy.";
  return "Possible SSC angle: who, what, where, why, and one static GK link.";
}

function fallbackExamNews() {
  return [
    { title: "SSC official website", source: "ssc.gov.in", link: "https://ssc.gov.in", date: "Check daily", summary: "Use this for notification, registration, admit card, result, answer key, and exam calendar.", study: "Do not trust random dates. Verify every deadline on the official SSC website." },
    { title: "Registration watch", source: "Candidate portal", link: "https://ssc.gov.in", date: "Action", summary: "When a notification opens, check eligibility, age limit, fee, documents, and last date.", study: "Keep Aadhaar, photo, signature, qualification details, and category certificate ready." },
    { title: "Exam date watch", source: "SSC calendar", link: "https://ssc.gov.in", date: "Planning", summary: "Use tentative dates to plan study blocks and mock tests.", study: "Reverse plan: syllabus -> chapter practice -> sectional mocks -> full mocks -> revision." }
  ];
}

function fallbackCurrentNews() {
  return [
    { title: "Daily PIB / government news scan", source: "PIB", link: "https://www.pib.gov.in", date: "Daily", summary: "Read government schemes, cabinet decisions, reports, awards, science, environment, and economy updates.", study: "Make one-line MCQ notes: scheme, ministry, aim, beneficiary, place, date." },
    { title: "Current affairs revision method", source: "IRL RPG", link: "https://www.pib.gov.in", date: "Daily", summary: "Do not read news like entertainment. Convert it into facts SSC can ask.", study: "Use 5W: who, what, where, when, why. Add one static GK connection." },
    { title: "Weekly current affairs test", source: "IRL RPG", link: "https://ssc.gov.in", date: "Weekly", summary: "After 7 days, solve 50 MCQs from the same topics.", study: "Mark mistakes and revise only weak areas before the next mock." }
  ];
}

function cleanNewsText(value) {
  const decoder = document.createElement("textarea");
  decoder.innerHTML = String(value ?? "");
  return decoder.value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeNewsLink(value, fallback = "https://ssc.gov.in") {
  const link = cleanNewsText(value);
  return /^https?:\/\//i.test(link) ? link : fallback;
}

function getNewsArticleBlocks(item) {
  if (item.mode === "exam") {
    return [
      { heading: "What this update means", text: item.summary },
      { heading: "What you must check", text: item.study },
      { heading: "Student action", text: "Open the official source, verify the date, write the deadline in your planner, then connect the update to syllabus, admit card, result, or registration work." },
      { heading: "Exam safety rule", text: "For SSC dates, vacancies, admit cards, answer keys, and results, trust the official SSC website first. News is a signal; official notice is final." }
    ];
  }

  return [
    { heading: "What happened", text: item.summary },
    { heading: "Why SSC may ask", text: item.study },
    { heading: "Make one MCQ note", text: "Write one line with who, what, where, when, why, and one static GK connection. That turns news into exam memory." },
    { heading: "Quick example", text: "If the news is about a government scheme, remember the ministry, aim, beneficiary, launch place/date, and one important fact." }
  ];
}

function readNewsItemAloud(newsId) {
  const item = newsReaderItems[newsId];
  if (!item) return;
  speakWithBrowserVoice(`${item.title}. ${item.summary}. ${item.study}`);
}

function openNewsReader(newsId) {
  const item = newsReaderItems[newsId];
  const reader = document.getElementById("newsReader");
  if (!item || !reader) return;

  const blocks = getNewsArticleBlocks(item);
  reader.hidden = false;
  reader.innerHTML = `
    <article class="newspaper-page">
      <div class="newspaper-topline">
        <span>${item.mode === "exam" ? "Exam Desk" : "Current Affairs Desk"}</span>
        <button class="news-close-button" onclick="closeNewsReader()">Close</button>
      </div>
      <h2>${escapeHtml(item.title)}</h2>
      <div class="newspaper-meta">
        <span>${escapeHtml(item.source)}</span>
        <span>${escapeHtml(item.date)}</span>
      </div>
      <p class="newspaper-lead">${escapeHtml(item.summary)}</p>
      <div class="newspaper-columns">
        ${blocks.map((block) => `
          <section>
            <h3>${escapeHtml(block.heading)}</h3>
            <p>${escapeHtml(block.text)}</p>
          </section>
        `).join("")}
      </div>
      <div class="newspaper-actions">
        <button onclick="explainNewsItem('${newsId}')">Explain for SSC</button>
        <button class="voice-button" onclick="readNewsItemAloud('${newsId}')">Read Aloud</button>
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">Open source</a>
      </div>
    </article>
  `;
  reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeNewsReader() {
  const reader = document.getElementById("newsReader");
  if (!reader) return;
  reader.hidden = true;
  reader.innerHTML = "";
}

function explainNewsItem(newsId) {
  const item = newsReaderItems[newsId];
  if (!item) return;
  setAiQuestion(`Explain this news for SSC exam preparation in simple language. Title: ${item.title}. Summary: ${item.summary}. Study angle: ${item.study}. Give: 1 meaning, 2 why it matters, 3 possible MCQ facts, 4 what to write in notebook.`);
  showView("ai-explainer");
  setTimeout(() => askAI(), 100);
}

function renderNewsCards(containerId, items, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const fallback = mode === "exam" ? fallbackExamNews() : fallbackCurrentNews();
  const fallbackLink = mode === "exam" ? "https://ssc.gov.in" : "https://www.pib.gov.in";
  const newsItems = (items && items.length ? items : fallback).slice(0, 8);
  container.innerHTML = newsItems.map((item, index) => {
    const title = cleanNewsText(item.title || "Latest update");
    const summary = cleanNewsText(item.summary || "Open source and verify the full update.");
    const source = cleanNewsText(item.source || "Source");
    const date = cleanNewsText(item.date || "Latest");
    const link = safeNewsLink(item.link, fallbackLink);
    const study = cleanNewsText(item.study || (mode === "exam" ? getExamActionFromTitle(title) : getCurrentAffairsFocus(title)));
    const newsId = `${containerId}-${index}`;
    newsReaderItems[newsId] = { title, summary, source, date, link, study, mode };
    return `
      <article class="news-card">
        <div class="news-card-top"><span>${mode === "exam" ? "Exam Update" : "Current Affairs"}</span><small>${escapeHtml(date)}</small></div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(summary)}</p>
        <div class="news-study-note"><strong>Study angle:</strong> ${escapeHtml(study)}</div>
        <div class="news-card-actions">
          <button onclick="openNewsReader('${newsId}')">Read in App</button>
          <button class="voice-button" onclick="explainNewsItem('${newsId}')">Explain</button>
          <a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">Open source</a>
        </div>
        <div class="news-card-bottom"><small>${escapeHtml(source)}</small></div>
      </article>
    `;
  }).join("");
}

function renderExamStudyFeed() {
  const profile = getProfile();
  const target = profile?.targets?.[0] || "SSC CGL";
  const exam = examHub.find((item) => target.includes(item.name.replace("SSC ", ""))) || examHub[0];
  const cards = [
    { title: `${exam.name} next study block`, summary: exam.plan, study: "Open Study Library and finish one core chapter before next mock.", source: "Profile path", link: "#" },
    { title: "Before registration", summary: "Check eligibility, age limit, photo/signature rules, fee, and final date.", study: "Make a document checklist now, not on the last day.", source: "SSC action", link: "https://ssc.gov.in" },
    { title: "Before exam date", summary: "Finish syllabus, then focus on speed, accuracy, and mistake revision.", study: "Mock -> review mistakes -> revise weak rule -> next mock.", source: "IRL RPG", link: "#" }
  ];
  renderNewsCards("examStudyFeed", cards, "exam");
}

function renderCurrentAffairsStudyFeed() {
  const container = document.getElementById("currentAffairsStudyFeed");
  if (!container) return;
  container.innerHTML = currentAffairsStudyCards.map((card) => `
    <article class="news-card compact-news-card">
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.text)}</p>
      <button onclick="setAiQuestion('Make a perfect SSC MCQ prompt for ${mockEscape(card.title)} current affairs.'); showView('ai-explainer')">Make AI Notes</button>
    </article>
  `).join("");
}

async function loadNewsHub(force = false) {
  const status = document.getElementById("newsStatus");
  if (status) status.textContent = force ? "Refreshing live news..." : "Loading latest updates...";

  try {
    const res = await fetch(`/api/news${force ? "?refresh=1" : ""}`);
    const data = await res.json();
    renderNewsCards("examNewsFeed", data.examUpdates, "exam");
    renderNewsCards("currentAffairsFeed", data.currentAffairs, "current");
    renderExamStudyFeed();
    renderCurrentAffairsStudyFeed();
    if (status) status.textContent = `${data.mode === "live" ? "Live" : "Fallback"} updates loaded. Last checked: ${data.lastUpdated || "today"}.`;
  } catch (error) {
    renderNewsCards("examNewsFeed", fallbackExamNews(), "exam");
    renderNewsCards("currentAffairsFeed", fallbackCurrentNews(), "current");
    renderExamStudyFeed();
    renderCurrentAffairsStudyFeed();
    if (status) status.textContent = "Offline fallback loaded. Check official SSC for final dates.";
  }
}

function renderExamHub() {
  const examCards = document.getElementById("examCards");
  if (!examCards) return;
  examCards.innerHTML = "";
  examHub.forEach((exam, index) => {
    const button = document.createElement("button");
    button.className = "exam-card";
    button.innerHTML = `<span>${exam.level}</span><strong>${exam.name}</strong><small>${exam.bestFor}</small>`;
    button.onclick = () => showExam(index);
    examCards.appendChild(button);
  });
  showExam(0);
  loadNewsHub(false);
}

function showExam(index) {
  const exam = examHub[index];
  if (!exam) return;
  document.getElementById("examTitle").textContent = exam.name;
  document.getElementById("examIntro").textContent = exam.intro;
  document.getElementById("examLevel").textContent = exam.level;
  document.getElementById("examStages").textContent = exam.stages;
  document.getElementById("examBestFor").textContent = exam.bestFor;
  document.getElementById("examPlan").innerHTML = `<strong>Preparation route:</strong> ${exam.plan} <br><strong>Register/check updates:</strong> Use official SSC only: <a href="https://ssc.gov.in" target="_blank" rel="noreferrer">ssc.gov.in</a>`;
  renderPills("examSyllabus", exam.syllabus);
  renderPills("examEvents", exam.events);
}

function renderPills(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const span = document.createElement("span");
    span.className = "chapter";
    span.textContent = item;
    container.appendChild(span);
  });
}


const mockHistoryKey = "irlRpgMockHistory";
const mockCooldownKey = "irlRpgMockCooldownUntil";
let mockTimer = null;
let currentMock = null;

const mockQuestionBank = [
  { id: "r1", subject: "Reasoning", level: "Noob", askedIn: "SSC CGL/CHSL past-year pattern", question: "Find the next number: 3, 6, 12, 24, ?", options: ["30", "36", "48", "54"], answer: "48", method: "The number is doubled each time: 3 x 2 = 6, 6 x 2 = 12, 12 x 2 = 24, so 24 x 2 = 48." },
  { id: "r2", subject: "Reasoning", level: "Noob", askedIn: "SSC MTS past-year pattern", question: "Which one is different: Apple, Mango, Potato, Banana?", options: ["Apple", "Mango", "Potato", "Banana"], answer: "Potato", method: "Apple, Mango, and Banana are fruits. Potato is a vegetable, so it is different." },
  { id: "r3", subject: "Reasoning", level: "Basic", askedIn: "SSC CHSL past-year pattern", question: "If CAT is coded as DBU, then DOG is coded as?", options: ["EPH", "DPI", "FQH", "CNE"], answer: "EPH", method: "Each letter moves one step forward: D->E, O->P, G->H. So DOG = EPH." },
  { id: "r4", subject: "Reasoning", level: "Basic", askedIn: "SSC CGL past-year pattern", question: "Complete the analogy: Hand : Glove :: Foot : ?", options: ["Shoe", "Cap", "Ring", "Watch"], answer: "Shoe", method: "A glove is worn on a hand. A shoe is worn on a foot." },
  { id: "r5", subject: "Reasoning", level: "Exam", askedIn: "SSC CPO past-year pattern", question: "A is north of B. C is east of B. In which direction is A from C?", options: ["North-east", "North-west", "South-east", "South-west"], answer: "North-west", method: "Place B in the center. A is above B. C is right of B. From C, A is up-left, so north-west." },
  { id: "r6", subject: "Reasoning", level: "Exam", askedIn: "SSC GD past-year pattern", question: "Find the odd pair: 4-16, 5-25, 6-36, 7-50", options: ["4-16", "5-25", "6-36", "7-50"], answer: "7-50", method: "The second number should be the square of the first. 7 squared is 49, not 50." },
  { id: "r7", subject: "Reasoning", level: "Master", askedIn: "SSC CGL Tier-I pattern", question: "In a row, Rahul is 12th from left and 18th from right. Total students?", options: ["28", "29", "30", "31"], answer: "29", method: "Total = left position + right position - 1. So 12 + 18 - 1 = 29." },
  { id: "r8", subject: "Reasoning", level: "Master", askedIn: "SSC CHSL Tier-I pattern", question: "If 2 + 3 = 13, 3 + 4 = 25, then 4 + 5 = ?", options: ["36", "39", "41", "45"], answer: "41", method: "Pattern: a^2 + b^2. 2^2+3^2=13, 3^2+4^2=25, so 4^2+5^2=16+25=41." },

  { id: "e1", subject: "English", level: "Noob", askedIn: "SSC CHSL past-year pattern", question: "Choose the correct article: He is ___ honest man.", options: ["a", "an", "the", "no article"], answer: "an", method: "Honest starts with a vowel sound because h is silent, so use 'an honest man'." },
  { id: "e2", subject: "English", level: "Noob", askedIn: "SSC MTS past-year pattern", question: "Find the noun: The student reads daily.", options: ["The", "student", "reads", "daily"], answer: "student", method: "A noun names a person, place, thing, or idea. Student is a person." },
  { id: "e3", subject: "English", level: "Basic", askedIn: "SSC CGL past-year pattern", question: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes", method: "With singular subject 'She' in simple present tense, use verb+s/es: goes." },
  { id: "e4", subject: "English", level: "Basic", askedIn: "SSC CHSL past-year pattern", question: "Find the synonym of 'rapid'.", options: ["Slow", "Quick", "Weak", "Late"], answer: "Quick", method: "Rapid means fast or quick." },
  { id: "e5", subject: "English", level: "Exam", askedIn: "SSC CPO past-year pattern", question: "Choose the correct spelling.", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], answer: "Accommodate", method: "Correct spelling is Accommodate: double c and double m." },
  { id: "e6", subject: "English", level: "Exam", askedIn: "SSC GD past-year pattern", question: "Identify the error: He do not like tea.", options: ["He", "do not", "like", "tea"], answer: "do not", method: "With 'He', use 'does not'. Correct sentence: He does not like tea." },
  { id: "e7", subject: "English", level: "Master", askedIn: "SSC CGL Tier-I pattern", question: "Choose the antonym of 'scarce'.", options: ["Rare", "Limited", "Plentiful", "Short"], answer: "Plentiful", method: "Scarce means not enough. The opposite is plentiful." },
  { id: "e8", subject: "English", level: "Master", askedIn: "SSC CHSL Tier-I pattern", question: "Choose the correct passive voice: They completed the work.", options: ["The work completed them", "The work was completed by them", "The work is complete by them", "The work has complete"], answer: "The work was completed by them", method: "Object becomes subject. Simple past active becomes was/were + past participle in passive voice." },

  { id: "g1", subject: "General Awareness", level: "Noob", askedIn: "SSC MTS past-year pattern", question: "Who is known as the Father of the Indian Constitution?", options: ["Mahatma Gandhi", "B. R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"], answer: "B. R. Ambedkar", method: "Dr. B. R. Ambedkar chaired the Drafting Committee of the Constitution." },
  { id: "g2", subject: "General Awareness", level: "Noob", askedIn: "SSC GD past-year pattern", question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Venus", "Jupiter"], answer: "Mars", method: "Mars appears reddish because of iron oxide on its surface." },
  { id: "g3", subject: "General Awareness", level: "Basic", askedIn: "SSC CHSL past-year pattern", question: "The capital of India is?", options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"], answer: "New Delhi", method: "New Delhi is the capital of India." },
  { id: "g4", subject: "General Awareness", level: "Basic", askedIn: "SSC CGL past-year pattern", question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon dioxide", method: "Plants use carbon dioxide and water to make food during photosynthesis." },
  { id: "g5", subject: "General Awareness", level: "Exam", askedIn: "SSC CPO past-year pattern", question: "Article 21 of the Indian Constitution is related to?", options: ["Right to Equality", "Right to Life and Personal Liberty", "Right to Education", "Right against Exploitation"], answer: "Right to Life and Personal Liberty", method: "Article 21 protects life and personal liberty." },
  { id: "g6", subject: "General Awareness", level: "Exam", askedIn: "SSC CGL Tier-I pattern", question: "Which organ purifies blood in the human body?", options: ["Heart", "Kidney", "Lungs", "Stomach"], answer: "Kidney", method: "Kidneys filter waste products from blood and form urine." },
  { id: "g7", subject: "General Awareness", level: "Master", askedIn: "SSC CHSL Tier-I pattern", question: "The Battle of Plassey was fought in which year?", options: ["1757", "1764", "1857", "1947"], answer: "1757", method: "The Battle of Plassey was fought in 1757 and helped the East India Company gain power in Bengal." },
  { id: "g8", subject: "General Awareness", level: "Master", askedIn: "SSC CGL Tier-I pattern", question: "Which schedule of the Constitution contains languages?", options: ["First", "Fifth", "Eighth", "Tenth"], answer: "Eighth", method: "The Eighth Schedule lists recognized languages of India." },

  { id: "m1", subject: "Maths", level: "Noob", askedIn: "SSC CGL/CHSL past-year pattern", question: "What is 10% of 250?", options: ["15", "20", "25", "30"], answer: "25", method: "10% means divide by 10. 250 / 10 = 25." },
  { id: "m2", subject: "Maths", level: "Basic", askedIn: "SSC MTS past-year pattern", question: "Simplify the ratio 18:24.", options: ["2:3", "3:4", "4:3", "6:8"], answer: "3:4", method: "Divide both by 6. 18:24 = 3:4." },
  { id: "m3", subject: "Maths", level: "Exam", askedIn: "SSC CGL Tier-I pattern", question: "If CP = 500 and SP = 600, profit percent is?", options: ["10%", "15%", "20%", "25%"], answer: "20%", method: "Profit = 600 - 500 = 100. Profit% = 100/500 x 100 = 20%." },
  { id: "m4", subject: "Maths", level: "Master", askedIn: "SSC CHSL Tier-I pattern", question: "A train covers 180 km in 3 hours. Speed is?", options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], answer: "60 km/h", method: "Speed = distance/time = 180/3 = 60 km/h." }
];

function stopMockTimer() {
  if (mockTimer) {
    clearInterval(mockTimer);
    mockTimer = null;
  }
}

function getMockCooldownUntil() {
  return Number(localStorage.getItem(mockCooldownKey) || 0);
}

function setMockCooldown() {
  localStorage.setItem(mockCooldownKey, String(Date.now() + 60 * 60 * 1000));
}

function getMockCooldownText() {
  const left = Math.max(0, getMockCooldownUntil() - Date.now());
  if (!left) return "";
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

function getMockHistory() {
  try {
    return JSON.parse(localStorage.getItem(mockHistoryKey)) || [];
  } catch (_) {
    return [];
  }
}

function saveMockHistory(ids) {
  const next = [...getMockHistory(), ...ids].slice(-220);
  localStorage.setItem(mockHistoryKey, JSON.stringify(next));
}

function mockEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, " ");
}

function shuffleItems(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function getProfileMockSubjects() {
  const profile = getProfile();
  const targets = profile?.targets || [];
  if (targets.some((target) => ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "SSC GD"].includes(target))) {
    return ["Maths", "Reasoning", "English", "General Awareness"];
  }
  if (targets.includes("SSC JE")) return ["Maths", "Reasoning", "General Awareness"];
  if (targets.includes("SSC Stenographer")) return ["English", "Reasoning", "General Awareness"];
  return ["Maths", "Reasoning", "English", "General Awareness"];
}

function getMockSubjectsForTest(test) {
  if (test.id === "maths") return ["Maths"];
  if (test.id === "reasoning") return ["Reasoning"];
  if (test.id === "english") return ["English"];
  if (test.id === "ga") return ["General Awareness"];
  if (test.id === "profile") return getProfileMockSubjects();
  return ["Maths", "Reasoning", "English", "General Awareness"];
}

function convertPracticeQuestionToMock(item, index) {
  const subject = item.chapter === "Percentage" || item.chapter === "Ratio and Proportion" || item.chapter === "Profit and Loss" ? "Maths" : item.chapter === "Series" ? "Reasoning" : item.chapter === "Parts of Speech" || item.chapter === "Tenses" ? "English" : "General Awareness";
  return {
    id: `practice-${index}-${item.chapter}-${item.stage}`,
    subject,
    level: item.stage || "Practice",
    askedIn: `SSC ${subject} past-year pattern`,
    question: item.question,
    options: item.options || buildMcqOptions(item.answer),
    answer: item.answer,
    method: item.method
  };
}

function getMockQuestionPool(test) {
  const subjects = getMockSubjectsForTest(test);
  const converted = practiceQuestionBank.map(convertPracticeQuestionToMock);
  const all = [...mockQuestionBank, ...converted];
  const pool = all.filter((item) => subjects.includes(item.subject));
  return pool.length >= 20 ? pool : all;
}

function pickMockQuestions(test) {
  const pool = getMockQuestionPool(test);
  const history = getMockHistory();
  const fresh = shuffleItems(pool.filter((item) => !history.includes(item.id)));
  const old = shuffleItems(pool.filter((item) => history.includes(item.id)));
  const selected = [...fresh, ...old].slice(0, 20);
  saveMockHistory(selected.map((item) => item.id));
  return selected;
}

function isMockAnswerCorrect(question, answer) {
  return normalizePracticeAnswer(answer) === normalizePracticeAnswer(question.answer);
}

function renderMockCooldown() {
  const box = document.getElementById("mockCooldownBox");
  if (!box) return;
  const text = getMockCooldownText();
  if (!text) {
    box.innerHTML = "";
    box.classList.remove("active");
    return;
  }
  box.classList.add("active");
  box.innerHTML = `<strong>Cooldown active:</strong> Come back after ${text} for the next mock. Finish review, rest, then attack again.`;
}

function renderMockTests() {
  const container = document.getElementById("mockTestCards");
  const stage = document.getElementById("mockTestStage");
  if (!container) return;

  stopMockTimer();
  currentMock = null;
  if (stage) stage.innerHTML = "";
  container.style.display = "grid";
  renderMockCooldown();

  container.innerHTML = "";
  mockTests.forEach((test) => {
    const card = document.createElement("button");
    card.className = "mock-card";
    card.innerHTML = `<span>${test.subject} - ${test.time}</span><strong>${test.title}</strong><small>${test.questions} questions - ${test.focus}</small>`;
    card.onclick = () => startMockTest(test.id);
    container.appendChild(card);
  });
}

function startMockTest(testId) {
  const cooldownText = getMockCooldownText();
  if (cooldownText) {
    renderMockCooldown();
    return;
  }

  const test = mockTests.find((item) => item.id === testId) || mockTests[0];
  const questions = pickMockQuestions(test);
  currentMock = {
    test,
    questions,
    answers: Array(questions.length).fill(""),
    markedReview: Array(questions.length).fill(false),
    visited: Array(questions.length).fill(false),
    currentIndex: 0,
    timeLeft: 10 * 60,
    submitted: false,
    reviewIndex: 0,
    mistakes: []
  };
  currentMock.visited[0] = true;

  const cards = document.getElementById("mockTestCards");
  if (cards) cards.style.display = "none";
  renderMockRunner();
  stopMockTimer();
  mockTimer = setInterval(() => {
    if (!currentMock || currentMock.submitted) return;
    currentMock.timeLeft -= 1;
    const timer = document.getElementById("mockTimer");
    if (timer) timer.textContent = formatMockTime(currentMock.timeLeft);
    if (currentMock.timeLeft <= 0) finishMockTest("timeout");
  }, 1000);
}

function formatMockTime(seconds) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getMockStatus(index) {
  if (!currentMock) return "not-visited";
  const answered = Boolean(currentMock.answers[index]);
  const marked = Boolean(currentMock.markedReview[index]);
  const visited = Boolean(currentMock.visited[index]);
  if (answered && marked) return "answered-review";
  if (marked) return "review";
  if (answered) return "answered";
  if (visited) return "not-answered";
  return "not-visited";
}

function getMockStatusText(status) {
  return {
    "answered": "Answered",
    "not-answered": "Not answered",
    "review": "Marked for review",
    "answered-review": "Answered + review",
    "not-visited": "Not visited"
  }[status] || "Not visited";
}

function getMockCounts() {
  const counts = { answered: 0, "not-answered": 0, review: 0, "answered-review": 0, "not-visited": 0 };
  currentMock.questions.forEach((_, index) => {
    counts[getMockStatus(index)] += 1;
  });
  return counts;
}

function getMockSections() {
  return [...new Set(currentMock.questions.map((question) => question.subject))];
}

function answerMockQuestion(index, answer) {
  if (!currentMock || currentMock.submitted) return;
  currentMock.answers[index] = answer;
  currentMock.visited[index] = true;
  renderMockRunner();
}

function setMockQuestion(index) {
  if (!currentMock || currentMock.submitted) return;
  currentMock.currentIndex = Math.max(0, Math.min(index, currentMock.questions.length - 1));
  currentMock.visited[currentMock.currentIndex] = true;
  renderMockRunner();
}

function clearMockAnswer() {
  if (!currentMock || currentMock.submitted) return;
  currentMock.answers[currentMock.currentIndex] = "";
  renderMockRunner();
}

function saveAndNextMock() {
  if (!currentMock || currentMock.submitted) return;
  currentMock.markedReview[currentMock.currentIndex] = false;
  moveMockQuestion(1);
}

function markMockReviewAndNext() {
  if (!currentMock || currentMock.submitted) return;
  currentMock.markedReview[currentMock.currentIndex] = true;
  moveMockQuestion(1);
}

function moveMockQuestion(direction) {
  if (!currentMock || currentMock.submitted) return;
  const nextIndex = currentMock.currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < currentMock.questions.length) {
    currentMock.currentIndex = nextIndex;
    currentMock.visited[nextIndex] = true;
  }
  renderMockRunner();
}

function renderMockRunner() {
  const stage = document.getElementById("mockTestStage");
  if (!stage || !currentMock) return;
  const counts = getMockCounts();
  const current = currentMock.questions[currentMock.currentIndex];
  const labels = ["A", "B", "C", "D"];
  stage.innerHTML = `
    <article class="mock-exam-shell">
      <header class="mock-exam-topbar">
        <div><span>Mock Test</span><strong>${currentMock.test.title}</strong></div>
        <div><span>SSC CBT Practice Window</span><strong>Question ${currentMock.currentIndex + 1} / ${currentMock.questions.length}</strong></div>
        <div><span>Time Left</span><strong id="mockTimer">${formatMockTime(currentMock.timeLeft)}</strong></div>
        <button class="mock-submit" onclick="finishMockTest('submitted')">Submit</button>
      </header>

      <div class="mock-section-tabs">
        ${getMockSections().map((section) => `<span>${escapeHtml(section)}</span>`).join("")}
      </div>

      <div class="mock-exam-body">
        <section class="mock-main-question">
          <div class="mock-question-top"><span>Question ${currentMock.currentIndex + 1}</span><small>${escapeHtml(current.askedIn)}</small></div>
          <div class="mock-question-meta"><b>${escapeHtml(current.subject)}</b><b>${escapeHtml(current.level)}</b><b>${getMockStatusText(getMockStatus(currentMock.currentIndex))}</b></div>
          <h3>${escapeHtml(current.question)}</h3>
          <div class="mock-answer-grid">
            ${current.options.map((option, optionIndex) => `
              <button class="mock-option ${currentMock.answers[currentMock.currentIndex] === option ? "is-selected" : ""}" onclick="answerMockQuestion(${currentMock.currentIndex}, '${mockEscape(option)}')">
                <span>${labels[optionIndex]}</span><strong>${escapeHtml(option)}</strong>
              </button>
            `).join("")}
          </div>
          <div class="mock-exam-actions">
            <button class="secondary" onclick="moveMockQuestion(-1)">Previous</button>
            <button class="secondary" onclick="clearMockAnswer()">Clear Response</button>
            <button class="warning" onclick="markMockReviewAndNext()">Mark for Review & Next</button>
            <button onclick="saveAndNextMock()">Save & Next</button>
          </div>
        </section>

        <aside class="mock-palette-panel">
          <h3>Question Palette</h3>
          <div class="mock-counts">
            <span><b>${counts.answered}</b> Answered</span>
            <span><b>${counts["not-answered"]}</b> Not answered</span>
            <span><b>${counts.review + counts["answered-review"]}</b> Review</span>
            <span><b>${counts["not-visited"]}</b> Not visited</span>
          </div>
          <div class="mock-palette-grid">
            ${currentMock.questions.map((_, index) => {
              const status = getMockStatus(index);
              return `<button class="mock-palette-btn ${status} ${index === currentMock.currentIndex ? "current" : ""}" onclick="setMockQuestion(${index})">${index + 1}</button>`;
            }).join("")}
          </div>
          <div class="mock-legend">
            <span><i class="answered"></i>Answered</span>
            <span><i class="not-answered"></i>Not answered</span>
            <span><i class="review"></i>Review</span>
            <span><i class="not-visited"></i>Not visited</span>
          </div>
        </aside>
      </div>
      <p class="practice-bank-note">This is a practice version of the SSC CBT setup: one question screen, palette, timer, save/next, review marks, and final submit.</p>
    </article>
  `;
}

function isMockAnswerCorrect(question, answer) {
  return normalizePracticeAnswer(answer) === normalizePracticeAnswer(question.answer);
}

function getMistakeMasterTip(question) {
  const text = `${question.question} ${question.method}`.toLowerCase();

  if (/1\/3|fraction|percentage|percent/.test(text)) {
    return "Use the fraction-to-percent rule: fraction x 100. If you see 1/3, think 100 divided by 3 = 33.33%. Do not choose 75% unless the fraction is 3/4.";
  }

  if (/profit|loss|discount|marked price|selling price|cost price/.test(text)) {
    return "For profit/loss questions, write CP, SP, profit/loss, then apply percentage. Never mix cost price and selling price.";
  }

  if (question.subject === "Maths") {
    return "Do not jump to options. Write Given, Asked, Formula. Substitute the numbers, calculate slowly, then check if the answer size makes sense.";
  }

  if (question.subject === "Reasoning") {
    return "Pause before options. Find the pattern in the question, write the rule in 3 words, then test only the option that follows that rule.";
  }

  if (question.subject === "English") {
    return "Read for meaning first. Then check subject, verb, tense, article/preposition, and spelling. Do not answer by sound only.";
  }

  return "Make a two-line flashcard: question fact on top, correct answer plus one reason below. Revise it tomorrow and after 3 days.";
}

function getMistakeIrlExample(question) {
  const text = `${question.question} ${question.method}`.toLowerCase();

  if (/1\/3|fraction|percentage|percent/.test(text)) {
    return "IRL example: if 3 friends split 100 rupees equally, one friend gets about 33.33 rupees. That is why 1/3 is 33.33%.";
  }

  if (/profit|loss|discount/.test(text)) {
    return "IRL example: a shop discount or profit is always compared with a base price. First find the base, then apply the percentage.";
  }

  if (question.subject === "Maths") {
    return "IRL example: marks, discounts, game stats, money split, and progress bars all use the same Maths idea: part, total, and relation.";
  }

  if (question.subject === "Reasoning") {
    return "IRL example: like finding a route pattern in a game map. Do not guess; observe the movement rule first.";
  }

  if (question.subject === "English") {
    return "IRL example: before sending a message, you check whether it sounds right. SSC English is that habit plus grammar rules.";
  }

  return "IRL example: remember it like a phone contact: one name plus one key detail. Small repeated memory beats one long reading.";
}

function getMistakeHomework(question) {
  if (question.subject === "Maths") {
    return "Redo this exact question once. Then change the numbers and solve one similar question without looking at options.";
  }

  if (question.subject === "Reasoning") {
    return "Write the pattern rule in 3 words. Solve this again, then create one new pattern with the same rule.";
  }

  if (question.subject === "English") {
    return "Copy the rule once, underline the clue word, then make one new sentence using the same rule.";
  }

  return "Turn this into a tiny flashcard and revise it tomorrow before the next mock.";
}

function getMistakeLessonText(item) {
  const question = item.question;
  return [
    `Mistake ${currentMock.reviewIndex + 1}. ${question.question}`,
    `Your answer was ${item.answer}. Correct answer is ${question.answer}.`,
    `Why this is the answer: ${question.method}`,
    `Method for next time: ${getMistakeMasterTip(question)}`,
    `Real life example: ${getMistakeIrlExample(question)}`,
    `Retry mission: ${getMistakeHomework(question)}`
  ].join(" ");
}

function readCurrentMistakeLesson() {
  if (lastMistakeLessonText) speakWithBrowserVoice(lastMistakeLessonText);
}

function explainCurrentMistake() {
  if (!currentMock) return;
  const item = currentMock.mistakes[currentMock.reviewIndex];
  if (!item) return;
  setAiQuestion(`Explain this SSC mock mistake simply. Question: ${item.question.question}. My answer: ${item.answer}. Correct answer: ${item.question.answer}. Method: ${item.question.method}. Teach me step by step and give one similar practice question.`);
  showView("ai-explainer");
  setTimeout(() => askAI(), 100);
}
function finishMockTest(reason) {
  if (!currentMock) return;
  currentMock.submitted = true;
  stopMockTimer();

  currentMock.mistakes = currentMock.questions
    .map((question, index) => ({ question, index, answer: currentMock.answers[index] || "No answer" }))
    .filter((item) => !isMockAnswerCorrect(item.question, item.answer));

  renderMockResult(reason);
}

function renderMockResult(reason) {
  const stage = document.getElementById("mockTestStage");
  if (!stage || !currentMock) return;
  const correct = currentMock.questions.length - currentMock.mistakes.length;
  const score = Math.round((correct / currentMock.questions.length) * 100);
  const reasonText = reason === "timeout" ? "Time over" : "Submitted";
  if (!currentMock.mistakes.length) setMockCooldown();
  stage.innerHTML = `
    <article class="practice-result ${score >= 70 ? "result-correct" : "result-wrong"}">
      <div class="result-badge">${reasonText}</div>
      <h3>${currentMock.test.title} Result</h3>
      <div class="result-grid">
        <section><span>Score</span><strong>${correct}/20</strong></section>
        <section><span>Accuracy</span><strong>${score}%</strong></section>
        <section><span>Mistakes</span><strong>${currentMock.mistakes.length}</strong></section>
      </div>
      <div class="full-explain-card">
        <h4>${currentMock.mistakes.length ? "Mistake classroom unlocked" : "Clean run"}</h4>
        <p>${currentMock.mistakes.length ? "Now each mistake becomes a mini lesson: correct answer, easy master method, and an IRL example." : "No mistakes. Cooldown started. Rest for one hour before the next mock."}</p>
      </div>
      <div class="master-actions">
        ${currentMock.mistakes.length ? `<button onclick="startMockReview()">Teach My Mistakes One by One</button>` : `<button onclick="renderMockTests()">Back to Mock Menu</button>`}
        <button class="secondary" onclick="setAiQuestion('Explain my mock mistakes and make a revision plan for ${mockEscape(currentMock.test.title)}.'); showView('ai-explainer')">Make AI Plan</button>
      </div>
    </article>
  `;
  renderMockCooldown();
}

function startMockReview() {
  if (!currentMock || !currentMock.mistakes.length) return;
  currentMock.reviewIndex = 0;
  renderMockReviewQuestion();
}

function renderMockReviewQuestion() {
  const stage = document.getElementById("mockTestStage");
  if (!stage || !currentMock) return;
  const item = currentMock.mistakes[currentMock.reviewIndex];
  const total = currentMock.mistakes.length;
  const isLast = currentMock.reviewIndex === total - 1;
  lastMistakeLessonText = getMistakeLessonText(item);

  stage.innerHTML = `
    <article class="practice-result result-timeout mistake-classroom">
      <div class="result-badge">Mistake ${currentMock.reviewIndex + 1}/${total}</div>
      <h3>${escapeHtml(item.question.question)}</h3>
      <p class="practice-bank-note">${escapeHtml(item.question.askedIn)}</p>
      <div class="result-grid">
        <section><span>Your answer</span><strong>${escapeHtml(item.answer)}</strong></section>
        <section><span>Correct answer</span><strong>${escapeHtml(item.question.answer)}</strong></section>
      </div>

      <div class="mistake-teacher-board">
        <section class="mistake-step answer-step">
          <span class="mistake-step-number">1</span>
          <div>
            <h4>Why this is the answer</h4>
            <p>${escapeHtml(item.question.method)}</p>
          </div>
        </section>
        <section class="mistake-step method-step">
          <span class="mistake-step-number">2</span>
          <div>
            <h4>Method to use next time</h4>
            <p>${escapeHtml(getMistakeMasterTip(item.question))}</p>
          </div>
        </section>
        <section class="mistake-step irl-step">
          <span class="mistake-step-number">3</span>
          <div>
            <h4>IRL example so it sticks</h4>
            <p>${escapeHtml(getMistakeIrlExample(item.question))}</p>
          </div>
        </section>
        <section class="mistake-step homework-step">
          <span class="mistake-step-number">4</span>
          <div>
            <h4>Retry mission</h4>
            <p>${escapeHtml(getMistakeHomework(item.question))}</p>
          </div>
        </section>
      </div>

      <div class="mistake-review-note">
        <strong>How to master this:</strong>
        <span>Read step 1, say step 2 out loud, imagine step 3, then do step 4 before the next mock.</span>
      </div>

      <div class="master-actions">
        <button onclick="nextMockReviewQuestion()">${isLast ? "Finish Review + Start Cooldown" : "Next Mistake"}</button>
        <button class="voice-button" onclick="readCurrentMistakeLesson()">Read This Lesson</button>
        <button class="secondary" onclick="explainCurrentMistake()">Ask AI This Doubt</button>
      </div>
    </article>
  `;
}
function nextMockReviewQuestion() {
  if (!currentMock) return;
  if (currentMock.reviewIndex < currentMock.mistakes.length - 1) {
    currentMock.reviewIndex += 1;
    renderMockReviewQuestion();
    return;
  }
  finishMockReview();
}

function finishMockReview() {
  setMockCooldown();
  const stage = document.getElementById("mockTestStage");
  if (stage) {
    stage.innerHTML = `
      <article class="practice-result result-correct">
        <div class="result-badge">Review Done</div>
        <h3>Cooldown started</h3>
        <div class="full-explain-card">
          <h4>Come back after 1 hour</h4>
          <p>You finished the mock and corrected mistakes. Rest now, revise weak rules, then take the next mock after cooldown.</p>
        </div>
        <div class="master-actions"><button onclick="renderMockTests()">Back to Mock Menu</button></div>
      </article>
    `;
  }
  renderMockCooldown();
}

function cancelMockTest() {
  stopMockTimer();
  currentMock = null;
  renderMockTests();
}
function getCompletedLessonStageCount() {
  const progress = getLessonProgress();
  return Object.values(progress).reduce((total, stages) => total + Object.keys(stages || {}).length, 0);
}

function getCompletedChapterCount() {
  const progress = getLessonProgress();
  return Object.keys(progress).filter((chapter) => {
    const lesson = lessonCatalog[chapter];
    if (!lesson) return Object.keys(progress[chapter] || {}).length > 0;
    return lesson.stages.every((stage) => progress[chapter]?.[stage.id]);
  }).length;
}

function getQuestRank(level = 1, xp = 0) {
  const power = Number(level || 1) * 100 + Number(xp || 0);
  if (power >= 800) return "Rank S";
  if (power >= 560) return "Rank A";
  if (power >= 360) return "Rank B";
  if (power >= 200) return "Rank C";
  if (power >= 90) return "Rank D";
  return "Rank E";
}

function getNextLessonQuest() {
  const percentage = lessonCatalog.Percentage;
  const firstOpenStage = percentage.stages.find((stage) => !isLessonStageDone("Percentage", stage.id));
  if (firstOpenStage) {
    return {
      type: "main",
      rank: firstOpenStage.label,
      title: `Foundation Quest: Percentage - ${firstOpenStage.title}`,
      text: "Percentage supports Profit/Loss, SI/CI, DI, marks, discount, and comparison questions. Clear it first so Maths stops feeling random.",
      reward: "+25 XP + Maths core unlock",
      action: "Open Lesson",
      view: "study-library"
    };
  }

  if (!isLessonStageDone("Series", "start")) {
    return {
      type: "main",
      rank: "Logic",
      title: "Pattern Quest: Reasoning Series",
      text: "After Percentage, train pattern sense. Series helps analogy, coding-decoding, and classification speed.",
      reward: "+20 XP + logic boost",
      action: "Open Library",
      view: "study-library"
    };
  }

  return {
    type: "main",
    rank: "Advance",
    title: "Next Chapter Chain",
    text: "Pick the weakest chapter from Study Library and clear one step. The board will keep moving your path forward.",
    reward: "+20 XP + path progress",
    action: "Open Library",
    view: "study-library"
  };
}

function getProfileTargetText(profile) {
  if (!profile?.targets?.length) return "SSC basics path";
  return `${profile.targets[0]} + basics`;
}

function buildQuestBoardQuests(data = {}) {
  const profile = getProfile();
  const completedStages = getCompletedLessonStageCount();
  const completedChapters = getCompletedChapterCount();
  const mockHistory = typeof getMockHistory === "function" ? getMockHistory() : [];
  const cooldown = typeof getMockCooldownText === "function" ? getMockCooldownText() : "";

  const main = [getNextLessonQuest()];
  const daily = [
    {
      type: "daily",
      rank: "Doubt",
      title: "Doubt Slayer Contract",
      text: "Ask AI one doubt from the chapter you touched today. Simple question is fine: 'explain this like I am new'.",
      reward: "+10 clarity",
      action: "Ask AI",
      ai: "Explain my weakest SSC topic simply and give one example."
    },
    {
      type: "daily",
      rank: "Recall",
      title: "Notebook Rune",
      text: "Write one formula/rule, one example, and one mistake to avoid. This turns screen reading into real memory.",
      reward: "+10 memory",
      action: "Open Library",
      view: "study-library"
    }
  ];
  const system = [];

  if (!profile) {
    system.push({
      type: "system",
      rank: "Setup",
      title: "Register Adventurer Profile",
      text: "Create your profile and choose SSC target. Then the board can tune quests for CGL, CHSL, MTS, GD, CPO, or basics.",
      reward: "Path unlock",
      action: "Open Settings",
      view: "settings"
    });
  } else {
    system.push({
      type: "system",
      rank: "Target",
      title: `${getProfileTargetText(profile)} route active`,
      text: getProfilePlan(profile),
      reward: "Smart quest filter",
      action: "Edit Profile",
      view: "settings"
    });
  }

  if (cooldown) {
    system.push({
      type: "system",
      rank: "Rest",
      title: "Mock cooldown active",
      text: `Your mock recovery timer is running. Come back in ${cooldown}; revise mistakes before the next battle.`,
      reward: "Accuracy buff",
      action: "Mock Menu",
      view: "mock-tests"
    });
  } else {
    daily.push({
      type: "daily",
      rank: "Trial",
      title: "Exam Hall Trial",
      text: "Attempt one 20-question, 10-minute mock. Questions follow your selected profile target and avoid repeating old sets.",
      reward: "+35 XP + mistake lessons",
      action: "Start Mock",
      view: "mock-tests"
    });
  }

  if (completedStages < 3) {
    system.push({
      type: "system",
      rank: "Weak Core",
      title: "Foundation warning",
      text: "Your lesson core is still light. Clear 3 lesson steps before pushing too many mocks.",
      reward: "Stable basics",
      action: "Study Now",
      view: "study-library"
    });
  } else {
    main.push({
      type: "main",
      rank: "Chain",
      title: "Chapter Chain Progress",
      text: `You cleared ${completedStages} lesson steps and ${completedChapters} full chapters. Keep the chain alive with one explain step and one MCQ set.`,
      reward: "+20 XP streak",
      action: "Continue",
      view: "study-library"
    });
  }

  if (!mockHistory.length) {
    main.push({
      type: "main",
      rank: "First Trial",
      title: "First Mock Contract",
      text: "Take your first profile mock. After it, the mistake classroom teaches every wrong question one by one.",
      reward: "Mock record unlock",
      action: "Open Mock",
      view: "mock-tests"
    });
  } else {
    system.push({
      type: "system",
      rank: "Archive",
      title: "Question memory active",
      text: `${mockHistory.length} mock questions are remembered, so the app avoids serving the same set again and again.`,
      reward: "Fresh practice",
      action: "Open Mock",
      view: "mock-tests"
    });
  }

  return { main, daily, system };
}

function renderQuestCards(containerId, quests) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = quests.map((quest, index) => {
    const action = quest.ai
      ? `setAiQuestion('${mockEscape(quest.ai)}'); showView('ai-explainer')`
      : `showView('${quest.view || "dashboard"}')`;
    return `
      <article class="board-quest-card quest-${quest.type}">
        <div class="quest-card-top">
          <span class="quest-rank">${escapeHtml(quest.rank)}</span>
          <small>#${String(index + 1).padStart(2, "0")}</small>
        </div>
        <h3>${escapeHtml(quest.title)}</h3>
        <p>${escapeHtml(quest.text)}</p>
        <div class="quest-card-bottom">
          <strong>${escapeHtml(quest.reward)}</strong>
          <button onclick="${action}">${escapeHtml(quest.action)}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderQuestBoard(data = {}) {
  const board = document.getElementById("progress");
  if (!board) return;

  const profile = getProfile();
  const level = Number(data.level || 1);
  const xp = Number(data.xp || 0);
  const xpNeed = level * 100;
  const completedStages = getCompletedLessonStageCount();
  const rank = getQuestRank(level, xp);
  const target = getProfileTargetText(profile);
  const nextReward = completedStages < 5 ? "Foundation badge" : "Mock streak badge";

  const nameBox = document.getElementById("questAdventurerName");
  const targetBox = document.getElementById("questTargetPath");
  const rankBox = document.getElementById("questBoardRank");
  const rewardBox = document.getElementById("questNextReward");
  const intro = document.getElementById("questBoardIntro");

  if (nameBox) nameBox.textContent = profile?.name || "Learner";
  if (targetBox) targetBox.textContent = target;
  if (rankBox) rankBox.textContent = rank;
  if (rewardBox) rewardBox.textContent = nextReward;
  if (intro) intro.textContent = `System scan: ${completedStages} lesson steps cleared, ${xp}/${xpNeed} XP, target path ${target}.`;

  const quests = buildQuestBoardQuests(data);
  renderQuestCards("mainQuestList", quests.main);
  renderQuestCards("dailyQuestList", quests.daily);
  renderQuestCards("systemQuestList", quests.system);
}
function showView(viewId) {
  document.querySelectorAll(".app-view").forEach((view) => {
    view.classList.toggle("active-view", view.id === viewId);
  });

  document.querySelectorAll(".nav-button").forEach((item) => {
    item.classList.toggle("active", item.dataset.target === viewId);
  });

  if (viewId === "progress") renderQuestBoard(window.irlRpgData || {});
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.target));
  });

  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.open));
  });
}
function setAiQuestion(question) {
  document.getElementById("aiQuestion").value = question;
}

function detectDoubtRoute(question) {
  const text = String(question || "").toLowerCase();
  const route = { subject: "SSC", chapter: "General Doubt", confidence: "Medium" };

  if (/percentage|percent|%|\bof\b|profit|loss|ratio|interest|speed|distance|work|time|marks|discount|cp|sp|\d+\s*[+\-*x/]\s*\d+/.test(text)) {
    route.subject = "Maths";
    route.chapter = "Basic Calculation";
    if (/percentage|percent|%|\bof\b|marks|discount|1\/3|3\/4/.test(text)) route.chapter = "Percentage";
    if (/ratio|proportion/.test(text)) route.chapter = "Ratio and Proportion";
    if (/profit|loss|cp|sp|discount/.test(text)) route.chapter = "Profit and Loss";
    if (/interest|si|ci|compound/.test(text)) route.chapter = "Simple/Compound Interest";
    if (/speed|distance|train|boat/.test(text)) route.chapter = "Speed, Time and Distance";
    if (/work|pipe|cistern|efficiency/.test(text)) route.chapter = "Time and Work";
    route.confidence = "High";
  }

  if (/series|coding|decoding|syllogism|blood relation|direction|analogy|odd one/.test(text)) {
    route.subject = "Reasoning";
    route.chapter = "Reasoning Basics";
    if (/series/.test(text)) route.chapter = "Series";
    if (/coding|decoding/.test(text)) route.chapter = "Coding-Decoding";
    if (/syllogism|statement|conclusion/.test(text)) route.chapter = "Syllogism";
    route.confidence = "High";
  }

  if (/grammar|tense|verb|noun|pronoun|adjective|adverb|sentence|error|synonym|antonym|vocabulary|comprehension/.test(text)) {
    route.subject = "English";
    route.chapter = "Grammar";
    if (/tense/.test(text)) route.chapter = "Tenses";
    if (/noun|pronoun|adjective|adverb|parts of speech/.test(text)) route.chapter = "Parts of Speech";
    if (/error|sentence|verb/.test(text)) route.chapter = "Error Spotting / Subject-Verb Agreement";
    route.confidence = "High";
  }

  if (/current affairs|scheme|award|appointment|minister|history|polity|geography|constitution|science|economy/.test(text)) {
    route.subject = "General Awareness";
    route.chapter = "Current Affairs / Static GK";
    if (/constitution|polity/.test(text)) route.chapter = "Polity";
    if (/history/.test(text)) route.chapter = "History";
    if (/geography/.test(text)) route.chapter = "Geography";
    if (/scheme|award|appointment|minister/.test(text)) route.chapter = "Current Affairs";
    route.confidence = "High";
  }

  return route;
}

function buildExternalPrompt(question) {
  const style = document.getElementById("aiStyle")?.value || "exam focused";
  const route = detectDoubtRoute(question);
  return [
    "You are an SSC exam tutor for India.",
    "Do not answer casually. Teach exactly for SSC exam preparation.",
    `Detected subject: ${route.subject}`,
    `Detected chapter: ${route.chapter}`,
    `Explanation style: ${style}`,
    "",
    "Question/doubt:",
    question,
    "",
    "Answer in this exact format:",
    "1. Direct Answer",
    "2. Subject + Chapter",
    "3. Meaning in simple words",
    "4. Formula / Rule",
    "5. SSC Exam Pattern: how this appears in exams",
    "6. Fast Method: easy method with keywords",
    "7. Common Mistake",
    "8. Practice: 3 MCQs from easy to exam level with answers"
  ].join("\n");
}

function prepareDoubtPrompt() {
  const questionBox = document.getElementById("aiQuestion");
  const answerBox = document.getElementById("aiAnswer");
  const aiMode = document.getElementById("aiMode");
  const question = questionBox.value.trim();

  if (!question) {
    answerBox.textContent = "Type or speak a doubt first.";
    return "";
  }

  const route = detectDoubtRoute(question);
  const prompt = buildExternalPrompt(question);
  lastAiAnswer = prompt;
  aiMode.textContent = `${route.subject} -> ${route.chapter}`;
  answerBox.textContent = [
    `Detected: ${route.subject} -> ${route.chapter}`,
    `Confidence: ${route.confidence}`,
    "",
    "Copy this prompt into DeepSeek, ChatGPT, or Gemini:",
    "",
    prompt
  ].join("\n");
  return prompt;
}

async function copyDoubtPrompt() {
  const prompt = prepareDoubtPrompt();
  if (!prompt) return;
  const answerBox = document.getElementById("aiAnswer");
  const aiMode = document.getElementById("aiMode");

  try {
    await navigator.clipboard.writeText(prompt);
    aiMode.textContent = "Prompt copied";
  } catch (error) {
    aiMode.textContent = "Copy manually";
  }

  answerBox.textContent = `${answerBox.textContent}\n\nPrompt ready. Open your AI site and paste it.`;
}

function openExternalAI(provider) {
  const prompt = prepareDoubtPrompt();
  if (!prompt) return;

  const links = {
    deepseek: "https://chat.deepseek.com/",
    chatgpt: "https://chat.openai.com/",
    gemini: "https://gemini.google.com/app"
  };

  navigator.clipboard?.writeText(prompt).catch(() => {});
  window.open(links[provider] || links.deepseek, "_blank", "noopener,noreferrer");
  document.getElementById("aiMode").textContent = "Prompt copied";
}
function buildClientFallbackAnswer(question) {
  const topic = question || "this SSC topic";
  const lower = topic.toLowerCase();
  let rule = "Use this method: meaning -> formula/rule -> example -> practice -> mistake check.";
  let example = "If the question gives part and total, connect them before calculating.";
  let practice = "Write the given values, choose the rule, solve one easy MCQ, then solve one exam-level MCQ.";

  if (lower.includes("percentage") || lower.includes("percent") || lower.includes("%")) {
    rule = "Percentage = Part / Whole x 100. To find a percent of a number: Percent x Number / 100.";
    example = "40 marks out of 80 = 40 / 80 x 100 = 50%.";
    practice = "Solve: 15% of 200, 12.5% of 480, and what percent is 45 out of 90?";
  } else if (lower.includes("ratio")) {
    rule = "For a:b, total parts = a + b. One part value = total / total parts.";
    example = "Ratio 3:2 and total 50 means one part is 10, so values are 30 and 20.";
    practice = "Solve: A:B = 5:7 and total is 72.";
  } else if (lower.includes("tense") || lower.includes("english")) {
    rule = "Find subject and verb, then check tense and agreement.";
    example = "He go is wrong. He goes is correct because singular subject takes singular verb.";
    practice = "Mark subject, verb, and tense in 5 sentences.";
  }

  return [
    `Built-in SSC Brain: ${topic}`,
    "",
    "1. Meaning: First understand what the question is asking in simple words.",
    `2. Formula / Rule: ${rule}`,
    `3. Example: ${example}`,
    "4. Common mistake: Do not jump to the answer. Circle keywords and given values first.",
    `5. Practice task: ${practice}`,
    "",
    "Fast method: read -> circle keywords -> choose rule -> substitute -> calculate -> check options.",
    "",
    "This answer works inside the app. External AI is optional."
  ].join("\n");
}
async function askAI() {
  const questionBox = document.getElementById("aiQuestion");
  const answerBox = document.getElementById("aiAnswer");
  const aiMode = document.getElementById("aiMode");
  const question = questionBox.value.trim();
  const style = document.getElementById("aiStyle").value;

  if (!question) {
    answerBox.textContent = "Type or speak a question first.";
    return;
  }

  const route = detectDoubtRoute(question);
  aiMode.textContent = `${route.subject} -> ${route.chapter}`;
  answerBox.textContent = `Detected: ${route.subject} -> ${route.chapter}\n\nMaking built-in help...`;

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, style })
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("AI route is not active. Stop the server with Ctrl + C, run node server.js again, then refresh.");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "AI request failed.");

    lastAiAnswer = data.answer;
    const modeLabels = { gemini: "Gemini", ai: "AI", local: "Ollama", offline: "Built-in", "built-in": "Built-in" };
    aiMode.textContent = modeLabels[data.mode] || "Built-in";
    answerBox.textContent = data.answer;
  } catch (error) {
    const fallback = buildClientFallbackAnswer(question);
    lastAiAnswer = fallback;
    aiMode.textContent = "Built-in";
    answerBox.textContent = fallback;
  }
}

function startVoiceQuestion() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const aiMode = document.getElementById("aiMode");

  if (!SpeechRecognition) {
    aiMode.textContent = "No mic support";
    document.getElementById("aiAnswer").textContent = "Voice input is not supported here. Try Chrome browser at http://localhost:3000.";
    return;
  }

  if (recognition) recognition.stop();

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  aiMode.textContent = "Listening";
  recognition.start();

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    document.getElementById("aiQuestion").value = text;
    aiMode.textContent = "Ready";
  };

  recognition.onerror = () => {
    aiMode.textContent = "Mic error";
  };

  recognition.onend = () => {
    if (aiMode.textContent === "Listening") aiMode.textContent = "Ready";
  };
}

async function readAIAnswer() {
  const answerBox = document.getElementById("aiAnswer");
  const aiMode = document.getElementById("aiMode");
  const text = (lastAiAnswer || answerBox.textContent || "").trim();

  if (!text || text === "Ask a question to start.") {
    answerBox.textContent = "Ask AI first, then I can read the answer.";
    return;
  }

  stopVoice();
  aiMode.textContent = "Voice";

  try {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("audio/")) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        aiMode.textContent = "Ready";
      };
      audio.onerror = () => {
        aiMode.textContent = "Voice error";
      };
      await audio.play();
      return;
    }

    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.error || "OpenAI voice is not ready.");
    }

    throw new Error("Voice route is not active. Restart server with Ctrl + C, then node server.js.");
  } catch (error) {
    aiMode.textContent = "Browser voice";
    speakWithBrowserVoice(text);
  }
}

function refreshVoiceList() {
  if (!window.speechSynthesis) return;

  browserVoices = window.speechSynthesis.getVoices();
  const select = document.getElementById("voiceSelect");
  if (!select || !browserVoices.length) return;

  const currentValue = select.value;
  select.innerHTML = "";

  browserVoices
    .filter((voice) => /en-|English|India|Hindi|Google|Microsoft/i.test(`${voice.name} ${voice.lang}`))
    .forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${voice.name} (${voice.lang})`;
      select.appendChild(option);
    });

  const preferredIndex = browserVoices.findIndex((voice) =>
    /google.*(female|english|india|uk)|female|zira|susan|samantha|heera|neerja|aria|jenny/i.test(`${voice.name} ${voice.lang}`)
  );

  if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
    select.value = currentValue;
  } else if (preferredIndex >= 0) {
    select.value = String(preferredIndex);
  }
}

function getSelectedBrowserVoice() {
  refreshVoiceList();
  const select = document.getElementById("voiceSelect");
  const selectedIndex = select ? Number(select.value) : -1;

  if (Number.isInteger(selectedIndex) && browserVoices[selectedIndex]) {
    return browserVoices[selectedIndex];
  }

  return browserVoices.find((voice) =>
    /google.*(female|english|india|uk)|female|zira|susan|samantha|heera|neerja|aria|jenny/i.test(`${voice.name} ${voice.lang}`)
  ) || browserVoices.find((voice) => /Google/i.test(voice.name)) || browserVoices[0];
}

function speakWithBrowserVoice(text) {
  if (!window.speechSynthesis) {
    document.getElementById("aiAnswer").textContent = "Speech output is not supported in this browser.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const preferredVoice = getSelectedBrowserVoice();

  if (preferredVoice) {
    utterance.voice = preferredVoice;
    utterance.lang = preferredVoice.lang || "en-IN";
  } else {
    utterance.lang = "en-IN";
  }

  utterance.rate = 0.9;
  utterance.pitch = 1.08;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function stopVoice() {
  if (recognition) recognition.stop();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.getElementById("aiMode").textContent = "Ready";
}

function renderTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  document.getElementById("timer").textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    time--;
    renderTimer();
    if (time <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Study session complete!");
      resetTimer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  time = 25 * 60;
  renderTimer();
}

setupThemeControls();
setupProfileControls();
loadData();
renderLearningSpace();
renderExamHub();
setupNewsTabs();
renderMockTests();
renderQuestBoard(window.irlRpgData || {});
setupNavigation();
renderTimer();
refreshVoiceList();
if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = refreshVoiceList;




















