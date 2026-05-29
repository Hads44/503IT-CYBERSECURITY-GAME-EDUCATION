const runnerBaseY = 42;
const storageKey = "cyberRunProfile";
const lanes = [-1, 0, 1];
let laneWidth = 180;

const phishingScenarios = [
  {
    type: "email",
    title: "University Account Deletion Warning",
    sender: "support@uni-alert.com",
    subject: "URGENT: Your university account will be deleted",
    message: "Your university mailbox will be deleted today. Verify your account immediately at secure-uni-login.com to avoid losing access.",
    answer: "phishing",
    feedback: "This is phishing. It uses fear, a fake sender domain, and a suspicious login link.",
    clues: ["Fake sender domain: uni-alert.com", "Urgency tactic: deleted today", "Suspicious login domain outside the university"],
  },
  {
    type: "email",
    title: "Library Reservation Ready",
    sender: "library@youruniversity.edu",
    subject: "Reserved book available for collection",
    message: "Your reserved book is ready. Please sign in through the official library portal or bring your student card to the library desk.",
    answer: "safe",
    feedback: "This is likely safe. The sender uses an official domain and points to normal university channels.",
    clues: ["Official university domain", "No pressure to enter payment details", "Uses expected library process"],
  },
  {
    type: "sms",
    title: "Tuition Refund SMS",
    sender: "UniPay",
    message: "Your tuition refund is waiting. Claim in 30 minutes or it expires: bit.ly/unipay-refund-now",
    answer: "phishing",
    feedback: "This is phishing. Refund scams often use shortened links and false deadlines.",
    clues: ["Shortened link hides destination", "False time pressure", "Unexpected finance request"],
  },
  {
    type: "whatsapp",
    title: "WhatsApp Delivery Scam",
    sender: "Campus Courier",
    message: "Your student parcel is held. Pay GBP 1.49 redelivery fee now: campus-drop.help/pay",
    answer: "phishing",
    feedback: "This is phishing. Delivery fee scams use small payments to steal card details.",
    clues: ["Unexpected payment request", "Suspicious non-university URL", "Pressure to act now"],
  },
  {
    type: "login",
    title: "Fake Password Reset Portal",
    sender: "University Security",
    message: "Session expired. Re-enter your username, password, and MFA code to continue.",
    answer: "phishing",
    feedback: "This is phishing. Real MFA prompts should come from the official portal, not a surprise page.",
    clues: ["Asks for password and MFA together", "No trusted university URL", "Unexpected reset screen"],
  },
  {
    type: "dm",
    title: "Discord Scholarship DM",
    sender: "Campus Admin",
    message: "You won a student grant. Send your login email and password so we can activate it on your account.",
    answer: "phishing",
    feedback: "This is phishing. No legitimate admin needs your password.",
    clues: ["Requests password directly", "Too-good-to-be-true grant", "Private DM instead of official channel"],
  },
  {
    type: "instagram",
    title: "Instagram Verification Scam",
    sender: "student_union_help",
    message: "Your society page will be removed. Verify ownership at insta-campus-verify.net before midnight.",
    answer: "phishing",
    feedback: "This is phishing. Fake verification pages copy social platforms to steal logins.",
    clues: ["Fake verification domain", "Threat of account removal", "Sent through an unofficial DM"],
  },
  {
    type: "email",
    title: "Lecturer Project Update",
    sender: "lecturer.name@youruniversity.edu",
    subject: "Project feedback posted",
    message: "Your project feedback has been posted on the official learning portal. Please review it before Friday's seminar.",
    answer: "safe",
    feedback: "This looks safe. It uses the real domain and sends you to the usual learning portal.",
    clues: ["Official sender", "Expected course context", "No strange attachment or payment request"],
  },
];

const achievements = [
  { id: "firstCatch", label: "First Catch", detail: "Answer one cyber question correctly.", test: (s) => s.correctAnswers >= 1 },
  { id: "combo3", label: "Combo x3", detail: "Build a combo of three or more.", test: (s) => s.comboBest >= 3 },
  { id: "score100", label: "100 Points", detail: "Reach 100 points in one run.", test: (s) => s.score >= 100 },
  { id: "cleanRun", label: "No Mistakes", detail: "Get four correct reads with no mistakes.", test: (s) => s.correctAnswers >= 4 && s.mistakes === 0 },
  { id: "speedster", label: "Speedster", detail: "Survive until the run gets fast.", test: (s) => s.speedMultiplier >= 1.8 },
  { id: "analyst", label: "Threat Analyst", detail: "Answer six cyber questions correctly.", test: (s) => s.correctAnswers >= 6 },
];

const dom = {
  app: document.getElementById("app"),
  menuScreen: document.getElementById("menuScreen"),
  gameScreen: document.getElementById("gameScreen"),
  startButton: document.getElementById("startButton"),
  byteBotButton: document.getElementById("byteBotButton"),
  runnerStage: document.getElementById("runnerStage"),
  objectLayer: document.getElementById("objectLayer"),
  runner: document.getElementById("runner"),
  score: document.getElementById("score"),
  level: document.getElementById("level"),
  combo: document.getElementById("combo"),
  speed: document.getElementById("speed"),
  lives: document.getElementById("lives"),
  highScore: document.getElementById("highScore"),
  playerRank: document.getElementById("playerRank"),
  awarenessLevel: document.getElementById("awarenessLevel"),
  achievementCount: document.getElementById("achievementCount"),
  playerNameInput: document.getElementById("playerNameInput"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  profileSaved: document.getElementById("profileSaved"),
  pauseButton: document.getElementById("pauseButton"),
  pausePanel: document.getElementById("pausePanel"),
  resumeButton: document.getElementById("resumeButton"),
  restartButton: document.getElementById("restartButton"),
  quitButton: document.getElementById("quitButton"),
  guidePanel: document.getElementById("guidePanel"),
  closeGuideButton: document.getElementById("closeGuideButton"),
  summaryPanel: document.getElementById("summaryPanel"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryPilot: document.getElementById("summaryPilot"),
  summaryRank: document.getElementById("summaryRank"),
  summaryAchievementProgress: document.getElementById("summaryAchievementProgress"),
  summaryProgressBar: document.getElementById("summaryProgressBar"),
  summaryScore: document.getElementById("summaryScore"),
  summaryCombo: document.getElementById("summaryCombo"),
  summaryCorrect: document.getElementById("summaryCorrect"),
  summaryMistakes: document.getElementById("summaryMistakes"),
  summaryMessage: document.getElementById("summaryMessage"),
  summaryAchievements: document.getElementById("summaryAchievements"),
  saveRunButton: document.getElementById("saveRunButton"),
  playAgainButton: document.getElementById("playAgainButton"),
  backMenuButton: document.getElementById("backMenuButton"),
  achievementToast: document.getElementById("achievementToast"),
  achievementToastText: document.getElementById("achievementToastText"),
  phishingDialog: document.getElementById("phishingDialog"),
  threatTitle: document.getElementById("threatTitle"),
  decisionTimer: document.getElementById("decisionTimer"),
  simulationCard: document.getElementById("simulationCard"),
  decisionPanel: document.getElementById("decisionPanel"),
  decisionQuestion: document.getElementById("decisionQuestion"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackText: document.getElementById("feedbackText"),
  feedbackClues: document.getElementById("feedbackClues"),
  continueButton: document.getElementById("continueButton"),
};

const game = {
  state: "menu",
  score: 0,
  level: 1,
  lives: 3,
  combo: 1,
  comboBest: 1,
  correctAnswers: 0,
  mistakes: 0,
  lane: 0,
  targetLane: 0,
  x: 0,
  speed: 420,
  speedMultiplier: 1,
  spawnTimer: 0,
  pickupTimer: 0,
  questionCooldown: 0,
  lastTime: 0,
  frameId: 0,
  objects: [],
  pool: [],
  activeThreat: null,
  answerResolved: false,
  decisionTime: 15,
  decisionDeadline: 0,
  resumeGrace: 0,
  muted: false,
  reducedMotion: false,
  runUnlockedAchievements: [],
  toastTimer: 0,
  decisionTimerId: 0,
};

let audioContext;
let musicNode;
let audioUnlocked = false;

function loadProfile() {
  try {
    return normalizeProfile(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    return normalizeProfile();
  }
}

function saveProfile(profile) {
  localStorage.setItem(storageKey, JSON.stringify(normalizeProfile(profile)));
}

function normalizeProfile(profile = {}) {
  return {
    name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim().slice(0, 18) : "Guest Pilot",
    highScore: Number.isFinite(profile.highScore) ? profile.highScore : 0,
    lastScore: Number.isFinite(profile.lastScore) ? profile.lastScore : 0,
    bestLevel: Number.isFinite(profile.bestLevel) ? profile.bestLevel : 1,
    totalRuns: Number.isFinite(profile.totalRuns) ? profile.totalRuns : 0,
    achievements: profile.achievements && typeof profile.achievements === "object" ? profile.achievements : {},
  };
}

function getEnteredPlayerName() {
  const typedName = dom.playerNameInput.value.trim();
  return typedName ? typedName.slice(0, 18) : "Guest Pilot";
}

function savePlayerProgress(showNotice = true) {
  const profile = loadProfile();
  profile.name = getEnteredPlayerName();
  profile.highScore = Math.max(profile.highScore || 0, Math.floor(game.score || 0));
  profile.lastScore = Math.floor(game.score || profile.lastScore || 0);
  profile.bestLevel = Math.max(profile.bestLevel || 1, game.level || 1);
  profile.achievements = profile.achievements || {};
  saveProfile(profile);
  updateMenuStats();
  if (showNotice) {
    dom.profileSaved.textContent = `Saved for ${profile.name}.`;
    showAchievementToast("Progress Saved");
  }
}

function updateMenuStats() {
  const profile = loadProfile();
  const unlocked = achievements.filter((item) => profile.achievements[item.id]).length;
  dom.playerNameInput.value = profile.name;
  dom.highScore.textContent = profile.highScore || 0;
  dom.achievementCount.textContent = `${unlocked}/${achievements.length}`;
  dom.awarenessLevel.textContent = `Level ${Math.max(1, Math.floor((profile.highScore || 0) / 100) + 1)}`;
  dom.playerRank.textContent =
    profile.highScore >= 300 ? "Phishing Specialist" : profile.highScore >= 150 ? "Cyber Defender" : "Cyber Rookie";
}

function startGame() {
  savePlayerProgress(false);
  refreshLaneWidth();
  Object.assign(game, {
    state: "running",
    score: 0,
    level: 1,
    lives: 3,
    combo: 1,
    comboBest: 1,
    correctAnswers: 0,
    mistakes: 0,
    lane: 0,
    targetLane: 0,
    x: 0,
    speed: 420,
    speedMultiplier: 1,
    spawnTimer: 0.6,
    pickupTimer: 0.9,
    questionCooldown: 0,
    objects: [],
    activeThreat: null,
    answerResolved: false,
    decisionTime: 15,
    decisionDeadline: 0,
    resumeGrace: 0,
    runUnlockedAchievements: [],
  });
  clearObjects();
  dom.menuScreen.classList.remove("active");
  dom.gameScreen.classList.add("active");
  dom.summaryPanel.classList.add("hidden");
  dom.guidePanel.classList.add("hidden");
  dom.app.classList.add("running");
  dom.pausePanel.classList.add("hidden");
  updateHud();
  if (audioUnlocked) playMusic();
  game.lastTime = performance.now();
  cancelAnimationFrame(game.frameId);
  game.frameId = requestAnimationFrame(update);
}

function update(now) {
  const dt = Math.min(0.033, (now - game.lastTime) / 1000 || 0);
  game.lastTime = now;

  if (game.state === "running") {
    updateRunner(dt);
    updateObjects(dt);
    updateSpawning(dt);
    updateScore(dt);
    updateHud();
  }

  game.frameId = requestAnimationFrame(update);
}

function updateRunner(dt) {
  refreshLaneWidth();
  game.lane += (game.targetLane - game.lane) * Math.min(1, dt * 12);
  game.x = game.lane * laneWidth;

  dom.runner.style.transform = `translate3d(calc(-50% + ${game.x}px), 0, 0)`;
}

function refreshLaneWidth() {
  laneWidth = Math.min(206, window.innerWidth * 0.28);
}

function updateObjects(dt) {
  const runnerBox = getRunnerBox();
  if (game.resumeGrace > 0) game.resumeGrace -= dt;
  game.objects.forEach((object) => {
    object.z -= game.speed * game.speedMultiplier * dt;
    object.el.style.transform = `translate3d(calc(-50% + ${object.lane * laneWidth}px), ${-object.z}px, 0) scale(${object.scale})`;
    object.el.style.opacity = object.z < -60 ? "0" : "1";

    if (game.resumeGrace <= 0 && !object.hit && object.z < 92 && object.z > -42) {
      const objectBox = getObjectBox(object);
      if (overlaps(runnerBox, objectBox)) handleCollision(object);
    }
  });

  game.objects = game.objects.filter((object) => {
    if (object.z > -130 && !object.remove) return true;
    recycleObject(object);
    return false;
  });
}

function updateSpawning(dt) {
  game.spawnTimer -= dt;
  game.pickupTimer -= dt;
  if (game.questionCooldown > 0) game.questionCooldown -= dt;

  if (game.spawnTimer <= 0) {
    spawnThreatOrObstacle();
    game.spawnTimer = Math.max(0.72, 1.85 - game.speedMultiplier * 0.12 - game.level * 0.04);
  }

  if (game.pickupTimer <= 0) {
    spawnPickup();
    game.pickupTimer = Math.max(0.62, 1.05 - game.level * 0.04) + Math.random() * 0.46;
  }
}

function updateScore() {
  game.speedMultiplier = Math.min(2.25, 1 + (game.level - 1) * 0.14 + game.score / 1050);
}

function spawnThreatOrObstacle() {
  const lane = pickSpawnLane();
  if (lane === null || hasObjectNearSpawn(lane)) return;
  const type = "threat";
  const scenario = phishingScenarios[Math.floor(Math.random() * phishingScenarios.length)];
  const object = getPooledObject(type);
  object.type = type;
  object.scenario = scenario;
  object.lane = lane;
  object.z = 620;
  object.scale = 1;
  object.hit = false;
  object.remove = false;
  object.el.className = `world-object ${type}`;
  object.el.innerHTML = `<small>${escapeHtml(scenario.sender)}</small><b>${escapeHtml(scenario.title)}</b><span>Open</span>`;
  dom.objectLayer.appendChild(object.el);
  game.objects.push(object);
}

function spawnPickup() {
  const lane = pickSpawnLane();
  if (lane === null || hasObjectNearSpawn(lane)) return;
  const object = getPooledObject("pickup");
  object.type = "pickup";
  object.lane = lane;
  object.z = 620;
  object.scale = 1;
  object.hit = false;
  object.remove = false;
  object.el.className = "world-object pickup";
  object.el.textContent = "+5";
  dom.objectLayer.appendChild(object.el);
  game.objects.push(object);
}

function pickSpawnLane() {
  const blocked = new Set(game.objects.filter((object) => object.z > 420).map((object) => object.lane));
  const available = lanes.filter((lane) => !blocked.has(lane));
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function hasObjectNearSpawn(lane) {
  return game.objects.some((object) => object.lane === lane && object.z > 470);
}

function getPooledObject(type) {
  const object = game.pool.pop() || { el: document.createElement("div") };
  object.el.className = `world-object ${type}`;
  return object;
}

function recycleObject(object) {
  object.el.remove();
  object.el.innerHTML = "";
  game.pool.push(object);
}

function clearObjects() {
  game.objects.forEach((object) => object.el.remove());
  game.pool.forEach((object) => object.el.remove());
  game.objects = [];
  game.pool = [];
  dom.objectLayer.innerHTML = "";
}

function handleCollision(object) {
  if (game.state !== "running" || object.hit) return;
  object.hit = true;

  if (object.type === "pickup") {
    object.remove = true;
    game.score += 5;
    game.combo = Math.min(8, game.combo + 1);
    game.comboBest = Math.max(game.comboBest, game.combo);
    checkAchievements(false);
    beep(740, 0.05, "triangle");
    return;
  }

  triggerThreat(object.scenario, "collision", object.lane);
  object.remove = true;
}

function getRunnerBox() {
  const x = game.x;
  return {
    left: x - 34,
    right: x + 34,
    bottom: runnerBaseY,
    top: runnerBaseY + 148,
  };
}

function getObjectBox(object) {
  const x = object.lane * laneWidth;
  if (object.type === "pickup") {
    return { left: x - 20, right: x + 20, bottom: runnerBaseY + 112, top: runnerBaseY + 152 };
  }
  return { left: x - 54, right: x + 54, bottom: runnerBaseY, top: runnerBaseY + 92 };
}

function overlaps(a, b) {
  const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const overlapY = Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom);
  return overlapX > 12 && overlapY > 12;
}

function triggerThreat(scenario, reason, lane = game.lane) {
  if (game.state !== "running") return;
  game.state = "question";
  game.activeThreat = scenario;
  game.answerResolved = false;
  game.decisionTime = 15;
  game.decisionDeadline = 0;
  dom.decisionTimer.textContent = "15";
  dom.runner.classList.add("hit");
  dom.app.classList.remove("running");
  hitFeedback();
  spawnImpactExplosion(lane);
  renderScenario(scenario, reason);
  setTimeout(() => {
    if (game.state !== "question") return;
    openDialog();
    startDecisionTimer();
  }, 260);
}

function spawnImpactExplosion(lane) {
  const explosion = document.createElement("div");
  explosion.className = "impact-explosion";
  explosion.style.left = `calc(50% + ${lane * laneWidth}px)`;
  dom.runnerStage.appendChild(explosion);
  setTimeout(() => explosion.remove(), 620);
}

function renderScenario(scenario, reason) {
  dom.threatTitle.textContent = reason === "collision" ? "Threat Box Intercepted" : scenario.title;
  dom.decisionQuestion.textContent = "What should you do with this message?";
  game.answerResolved = false;
  game.decisionTime = 15;
  game.decisionDeadline = 0;
  dom.decisionTimer.textContent = "15";
  dom.decisionPanel.classList.remove("hidden");
  dom.feedbackPanel.classList.add("hidden");
  dom.feedbackPanel.classList.remove("shown");
  dom.phishingDialog.querySelectorAll("[data-choice]").forEach((button) => {
    button.disabled = false;
  });
  dom.simulationCard.className = "simulation-card";
  dom.simulationCard.innerHTML = buildSimulation(scenario);
}

function buildSimulation(scenario) {
  const appName = scenario.sender.includes("youruniversity.edu") ? "Outlook" : "Gmail";
  const imageSrc = buildEmailExampleImage(scenario, appName);
  const thirdLabel = scenario.answer === "safe" ? "Context" : "Urgency";
  return `<div class="email-example-wrap"><img class="email-example-image" src="${imageSrc}" alt="Email example for phishing question" /><div class="email-clue-overlay"><span class="flag clue-sender">Sender</span><span class="flag clue-action">Link or action</span><span class="flag clue-urgency">${thirdLabel}</span></div></div>`;
}

function buildEmailExampleImage(scenario, appName) {
  const subject = scenario.subject || scenario.title;
  const actionText = scenario.answer === "safe" ? "Open official portal" : "Verify account";
  const senderInitials = scenario.sender.slice(0, 2).toUpperCase();
  const fromColor = scenario.answer === "safe" ? "#166534" : "#991b1b";
  const alertLabel = scenario.answer === "safe" ? "Trusted sender" : "External sender";
  const buttonColor = scenario.answer === "safe" ? "#2563eb" : "#dc2626";
  const domain = scenario.sender.split("@")[1] || scenario.sender;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="620" viewBox="0 0 1040 620">
    <defs>
      <linearGradient id="topbar" x1="0" x2="1"><stop stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0f172a" flood-opacity=".2"/></filter>
    </defs>
    <rect width="1040" height="620" rx="26" fill="#edf2f7"/>
    <rect x="0" y="0" width="1040" height="66" rx="26" fill="url(#topbar)"/>
    <circle cx="30" cy="33" r="8" fill="#ef4444"/><circle cx="58" cy="33" r="8" fill="#f59e0b"/><circle cx="86" cy="33" r="8" fill="#22c55e"/>
    <rect x="132" y="17" width="528" height="32" rx="16" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="156" y="38" font-family="Segoe UI, Arial" font-size="15" font-weight="700" fill="#64748b">mail.${svgText(appName.toLowerCase())}.com/inbox</text>
    <text x="802" y="39" font-family="Segoe UI, Arial" font-size="20" font-weight="900" fill="#334155">${svgText(appName)}</text>
    <rect x="34" y="92" width="210" height="472" rx="18" fill="#ffffff" filter="url(#shadow)"/>
    <rect x="58" y="126" width="142" height="40" rx="20" fill="#dbeafe"/>
    <text x="92" y="152" font-family="Segoe UI, Arial" font-size="16" font-weight="900" fill="#1d4ed8">Inbox</text>
    <text x="58" y="210" font-family="Segoe UI, Arial" font-size="15" font-weight="800" fill="#64748b">Starred</text>
    <text x="58" y="250" font-family="Segoe UI, Arial" font-size="15" font-weight="800" fill="#64748b">Sent</text>
    <text x="58" y="290" font-family="Segoe UI, Arial" font-size="15" font-weight="800" fill="#64748b">Archive</text>
    <rect x="274" y="92" width="730" height="472" rx="18" fill="#ffffff" filter="url(#shadow)"/>
    <rect x="274" y="92" width="730" height="58" rx="18" fill="#f8fafc"/>
    <text x="304" y="128" font-family="Segoe UI, Arial" font-size="18" font-weight="900" fill="#334155">Inbox</text>
    <text x="904" y="128" font-family="Segoe UI, Arial" font-size="14" font-weight="800" fill="#94a3b8">Today, 09:42</text>
    <line x1="274" y1="150" x2="1004" y2="150" stroke="#e2e8f0"/>
    <circle cx="334" cy="204" r="31" fill="#2563eb"/>
    <text x="334" y="214" text-anchor="middle" font-family="Segoe UI, Arial" font-size="22" font-weight="900" fill="#ffffff">${svgText(senderInitials)}</text>
    <text x="386" y="188" font-family="Segoe UI, Arial" font-size="16" font-weight="900" fill="#0f172a">${svgText(scenario.sender)}</text>
    <text x="386" y="214" font-family="Segoe UI, Arial" font-size="13" font-weight="700" fill="#64748b">to me via ${svgText(domain)}</text>
    <rect x="768" y="177" width="160" height="34" rx="17" fill="${scenario.answer === "safe" ? "#dcfce7" : "#fee2e2"}"/>
    <text x="848" y="199" text-anchor="middle" font-family="Segoe UI, Arial" font-size="13" font-weight="900" fill="${fromColor}">${svgText(alertLabel)}</text>
    <text x="314" y="274" font-family="Segoe UI, Arial" font-size="30" font-weight="900" fill="#111827">${svgText(subject)}</text>
    <foreignObject x="314" y="306" width="610" height="112">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Segoe UI, Arial; font-size: 21px; line-height: 1.42; color: #334155; font-weight: 650;">${svgHtml(scenario.message)}</div>
    </foreignObject>
    <rect x="314" y="436" width="214" height="48" rx="9" fill="${buttonColor}"/>
    <text x="421" y="467" text-anchor="middle" font-family="Segoe UI, Arial" font-size="17" font-weight="900" fill="#ffffff">${svgText(actionText)}</text>
    <rect x="548" y="436" width="190" height="48" rx="9" fill="#f1f5f9" stroke="#cbd5e1"/>
    <text x="643" y="467" text-anchor="middle" font-family="Segoe UI, Arial" font-size="15" font-weight="900" fill="#475569">View details</text>
    <rect x="314" y="508" width="246" height="28" rx="14" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="330" y="527" font-family="Segoe UI, Arial" font-size="13" font-weight="800" fill="#64748b">Attachment: account-notice.pdf</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function svgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgHtml(value) {
  return svgText(value).replace(/\n/g, "<br />");
}

function markFlags(text) {
  return escapeHtml(text)
    .replace(/secure-uni-login\.com|bit\.ly\/unipay-refund-now/gi, '<span class="sim-link flag">$&</span>')
    .replace(/campus-drop\.help\/pay|insta-campus-verify\.net/gi, '<span class="sim-link flag">$&</span>')
    .replace(/immediately|30 minutes|password|MFA code|deleted today|before midnight|Pay GBP 1\.49|will be removed/gi, '<span class="sim-warning flag">$&</span>');
}

function openDialog() {
  if (!dom.phishingDialog.open) dom.phishingDialog.showModal();
  dom.decisionPanel.classList.remove("hidden");
}

function startDecisionTimer() {
  clearDecisionTimer();
  game.decisionTime = 15;
  game.decisionDeadline = performance.now() + 15000;
  dom.decisionTimer.textContent = "15";
  game.decisionTimerId = window.setInterval(() => updateDecisionTimer(performance.now()), 200);
  updateDecisionTimer(performance.now());
}

function updateDecisionTimer(now) {
  if (dom.feedbackPanel.classList.contains("shown")) return;
  if (!game.decisionDeadline) return;
  const remaining = Math.max(0, Math.ceil((game.decisionDeadline - now) / 1000));
  if (remaining !== game.decisionTime) {
    game.decisionTime = remaining;
    dom.decisionTimer.textContent = remaining;
  }
  if (remaining <= 0) answerThreat("timeout");
}

function clearDecisionTimer() {
  if (!game.decisionTimerId) return;
  window.clearInterval(game.decisionTimerId);
  game.decisionTimerId = 0;
}

const choiceLabels = {
  report: "Report",
  open: "Open",
  ignore: "Ignore",
  reply: "Reply",
  timeout: "No action before the timer ended",
};

const actionFeedback = {
  report: {
    phishing: "Reporting is the right move for a suspicious message because it warns IT and protects other students.",
    safe: "Reporting a legitimate message is not the best choice. Check the sender and context before flagging it.",
  },
  open: {
    phishing: "Opening a phishing link can lead to fake login pages, stolen passwords, or malware.",
    safe: "Opening the normal university portal is the right action when the sender and context are trusted.",
  },
  ignore: {
    phishing: "Ignoring avoids clicking, but reporting is better because it helps remove the threat for everyone.",
    safe: "Ignoring a real university message can make you miss important course or account information.",
  },
  reply: {
    phishing: "Replying confirms your account is active and may encourage more scam attempts.",
    safe: "Replying is only useful when the message asks for a normal response. This one should be handled through the official portal.",
  },
  timeout: {
    phishing: "Running out of time is risky. When unsure, do not click; report the message.",
    safe: "Running out of time means you missed a legitimate message. Check official context quickly.",
  },
};

function getCorrectChoice(scenario) {
  return scenario.answer === "safe" ? "open" : "report";
}

function answerThreat(choice) {
  if (game.answerResolved || dom.feedbackPanel.classList.contains("shown")) return;
  const scenario = game.activeThreat;
  if (!scenario) return;
  game.answerResolved = true;
  clearDecisionTimer();
  game.state = "question";
  dom.phishingDialog.querySelectorAll("[data-choice]").forEach((button) => {
    button.disabled = true;
  });
  const correctChoice = getCorrectChoice(scenario);
  const correct = choice === correctChoice;
  const selectedLabel = choiceLabels[choice] || "Unknown action";
  const correctLabel = choiceLabels[correctChoice];
  const feedbackType = scenario.answer === "safe" ? "safe" : "phishing";
  const selectedFeedback = actionFeedback[choice]?.[feedbackType] || "That action is not recommended for this message.";
  dom.simulationCard.classList.add("revealed");
  dom.decisionPanel.classList.add("hidden");
  dom.feedbackPanel.classList.toggle("correct", correct);
  dom.feedbackPanel.classList.toggle("wrong", !correct);
  dom.feedbackPanel.classList.remove("hidden");
  dom.feedbackPanel.classList.add("shown");
  dom.feedbackTitle.innerHTML = `<span class="result-mark">${correct ? "OK" : "!"}</span><span>${correct ? "Correct Decision" : "Threat Lesson"}</span>`;
  dom.feedbackText.innerHTML = `
    <span class="result-summary">${correct ? "Nice work. You made the safest cyber move." : "Careful. That action could put the account at risk."}</span>
    <span>${escapeHtml(selectedFeedback)} ${escapeHtml(scenario.feedback)}</span>
  `;
  dom.feedbackClues.innerHTML = `
    <li class="choice-card chosen"><span>You chose</span><strong>${escapeHtml(selectedLabel)}</strong></li>
    <li class="choice-card best"><span>Best action</span><strong>${escapeHtml(correctLabel)}</strong></li>
    ${scenario.clues.map((clue) => `<li class="clue-chip">${escapeHtml(clue)}</li>`).join("")}
  `;

  if (correct) {
    game.correctAnswers += 1;
    game.level += 1;
    game.combo = Math.min(8, game.combo + 1);
    game.comboBest = Math.max(game.comboBest, game.combo);
    game.score += 5;
    showAchievementToast(`Level ${game.level}`);
    beep(880, 0.08, "sine");
  } else {
    game.mistakes += 1;
    game.combo = 1;
    game.lives -= 1;
    beep(160, 0.12, "sawtooth");
  }
  checkAchievements(false);
  updateHud();
}

function resumeFromThreat() {
  clearDecisionTimer();
  dom.feedbackPanel.classList.remove("shown");
  dom.phishingDialog.close();
  dom.runner.classList.remove("hit");
  game.resumeGrace = 0.7;
  game.questionCooldown = 2.5;
  if (game.lives <= 0) {
    endRun();
    return;
  }
  game.state = "running";
  game.lastTime = performance.now();
  dom.app.classList.add("running");
}

function updateHud() {
  dom.score.textContent = Math.floor(game.score);
  dom.level.textContent = game.level;
  dom.combo.textContent = `x${game.combo}`;
  dom.speed.textContent = game.speedMultiplier.toFixed(1);
  dom.lives.textContent = "\u2665".repeat(Math.max(0, game.lives)) + "\u2661".repeat(Math.max(0, 3 - game.lives));
  dom.lives.setAttribute("aria-label", `${game.lives} lives remaining`);
}

function hitFeedback() {
  dom.app.classList.remove("shake");
  void dom.app.offsetWidth;
  dom.app.classList.add("shake");
  beep(110, 0.08, "square");
}

function endRun() {
  if (game.state === "menu") return;
  clearDecisionTimer();
  game.state = "gameover";
  dom.app.classList.remove("running");
  const profile = loadProfile();
  profile.name = getEnteredPlayerName();
  profile.highScore = Math.max(profile.highScore || 0, Math.floor(game.score));
  profile.lastScore = Math.floor(game.score);
  profile.bestLevel = Math.max(profile.bestLevel || 1, game.level);
  profile.totalRuns = (profile.totalRuns || 0) + 1;
  profile.achievements = profile.achievements || {};
  checkAchievements(true, profile);
  saveProfile(profile);
  updateMenuStats();
  clearObjects();
  renderSummary();
  dom.pausePanel.classList.add("hidden");
  dom.summaryPanel.classList.remove("hidden");
}

function quitRun() {
  clearObjects();
  dom.app.classList.remove("running");
  returnToMenu();
}

function returnToMenu() {
  dom.summaryPanel.classList.add("hidden");
  dom.pausePanel.classList.add("hidden");
  dom.guidePanel.classList.add("hidden");
  dom.gameScreen.classList.remove("active");
  dom.menuScreen.classList.add("active");
  game.state = "menu";
  updateMenuStats();
}

function checkAchievements(silent, profile = loadProfile()) {
  profile.achievements = profile.achievements || {};
  achievements.forEach((achievement) => {
    if (!profile.achievements[achievement.id] && achievement.test(game)) {
      profile.achievements[achievement.id] = true;
      if (!game.runUnlockedAchievements.includes(achievement.label)) {
        game.runUnlockedAchievements.push(achievement.label);
      }
      if (!silent) showAchievementToast(achievement.label);
    }
  });
  saveProfile(profile);
  updateMenuStats();
}

function showAchievementToast(label) {
  dom.achievementToastText.textContent = label;
  dom.achievementToast.classList.remove("hidden");
  clearTimeout(game.toastTimer);
  game.toastTimer = setTimeout(() => dom.achievementToast.classList.add("hidden"), 2600);
}

function renderSummary() {
  const profile = loadProfile();
  const earnedCount = achievements.filter((achievement) => profile.achievements?.[achievement.id]).length;
  const rank =
    profile.highScore >= 300 ? "Phishing Specialist" : profile.highScore >= 150 ? "Cyber Defender" : "Cyber Rookie";
  dom.summaryTitle.textContent = game.lives <= 0 ? "Achievement Report" : "Training Report";
  dom.summaryPilot.textContent = `Pilot: ${profile.name}`;
  dom.summaryRank.textContent = rank;
  dom.summaryAchievementProgress.textContent = `${earnedCount}/${achievements.length} badges`;
  dom.summaryProgressBar.style.width = `${Math.round((earnedCount / achievements.length) * 100)}%`;
  dom.summaryScore.textContent = Math.floor(game.score);
  dom.summaryCombo.textContent = `x${game.comboBest}`;
  dom.summaryCorrect.textContent = game.correctAnswers;
  dom.summaryMistakes.textContent = game.mistakes;
  dom.summaryMessage.textContent =
    `Progress saved for ${profile.name}. You earned ${earnedCount}/${achievements.length} achievements. ` +
    (game.runUnlockedAchievements.length > 0
      ? `New unlocks: ${game.runUnlockedAchievements.join(", ")}.`
      : "Keep dodging threats and reading email clues to unlock more badges.");
  dom.summaryAchievements.innerHTML = achievements
    .map((achievement) => {
      const earned = Boolean(profile.achievements?.[achievement.id]);
      const newUnlock = game.runUnlockedAchievements.includes(achievement.label);
      return `<article class="achievement-card ${earned ? "earned" : "locked"} ${newUnlock ? "new" : ""}">
        <div class="achievement-medal">${earned ? "CLEAR" : "LOCK"}</div>
        <div>
          <strong>${escapeHtml(achievement.label)}</strong>
          <p>${escapeHtml(achievement.detail)}</p>
          <span>${earned ? (newUnlock ? "New unlock" : "Unlocked") : "Locked"}</span>
        </div>
      </article>`;
    })
    .join("");
}

function pauseGame() {
  if (game.state !== "running") return;
  game.state = "paused";
  dom.pausePanel.classList.remove("hidden");
  dom.app.classList.remove("running");
}

function resumeGame() {
  if (game.state !== "paused") return;
  game.state = "running";
  game.lastTime = performance.now();
  dom.pausePanel.classList.add("hidden");
  dom.app.classList.add("running");
}

function openGuide() {
  dom.guidePanel.classList.remove("hidden");
}

function closeGuide() {
  dom.guidePanel.classList.add("hidden");
}

function moveLane(direction) {
  if (game.state !== "running") return;
  game.targetLane = Math.max(lanes[0], Math.min(lanes[lanes.length - 1], game.targetLane + direction));
}

function playMusic() {
  if (game.muted || musicNode || !audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.value = 55;
  gain.gain.value = 0.018;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  musicNode = oscillator;
}

function beep(frequency, duration, type) {
  if (game.muted || !audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.045;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration);
}

function getAudioContext() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function unlockAudio(event) {
  if (event && event.isTrusted === false) return;
  if (audioUnlocked || game.muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  ctx.resume()
    .then(() => {
      audioUnlocked = true;
      if (game.state === "running") playMusic();
    })
    .catch(() => {});
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

dom.startButton.addEventListener("click", startGame);
dom.saveProfileButton.addEventListener("click", () => savePlayerProgress(true));
dom.byteBotButton.addEventListener("click", openGuide);
dom.closeGuideButton.addEventListener("click", closeGuide);
dom.pauseButton.addEventListener("click", pauseGame);
dom.resumeButton.addEventListener("click", resumeGame);
dom.restartButton.addEventListener("click", startGame);
dom.quitButton.addEventListener("click", quitRun);
dom.playAgainButton.addEventListener("click", startGame);
dom.backMenuButton.addEventListener("click", returnToMenu);
dom.saveRunButton.addEventListener("click", () => savePlayerProgress(true));
dom.continueButton.addEventListener("click", resumeFromThreat);
dom.phishingDialog.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const choiceButton = target?.closest("[data-choice]");
  if (!choiceButton) return;
  event.preventDefault();
  answerThreat(choiceButton.dataset.choice);
});

window.answerThreat = answerThreat;
document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "left") moveLane(-1);
    if (action === "right") moveLane(1);
  });
});

window.addEventListener("keydown", (event) => {
  unlockAudio(event);
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    event.preventDefault();
    moveLane(-1);
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    event.preventDefault();
    moveLane(1);
  }
  if (event.code === "Escape") (game.state === "paused" ? resumeGame : pauseGame)();
});

window.addEventListener("pointerdown", unlockAudio);

let touchStartX = 0;
let touchStartY = 0;
dom.runnerStage.addEventListener("pointerdown", (event) => {
  touchStartX = event.clientX;
  touchStartY = event.clientY;
});
dom.runnerStage.addEventListener("pointerup", (event) => {
  const dx = event.clientX - touchStartX;
  if (Math.abs(dx) > 28) moveLane(dx > 0 ? 1 : -1);
});

updateMenuStats();
