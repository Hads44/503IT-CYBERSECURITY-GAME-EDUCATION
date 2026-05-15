const state = loadGameState();
state.timer = missionTime;
saveGameState(state);
renderHud(state);

const challenge = currentChallenge(state);
const runnerRow = document.getElementById("runnerRow");
const runnerPlayer = document.getElementById("runnerPlayer");
const emailCard = document.getElementById("emailCard");
const runnerPickup = document.getElementById("runnerPickup");
const runPrompt = document.getElementById("runPrompt");

document.getElementById("emailFrom").textContent = challenge.from;
document.getElementById("emailSubject").textContent = challenge.subject;
document.getElementById("emailHeadline").textContent = challenge.headline;
document.getElementById("bytebotClue").textContent = challenge.clue;

let paused = false;
let frameId = null;
let timerId = null;
let lastTime = performance.now();
let jump = 0;
let velocity = 0;
let pickups = 0;
let threatX = Math.min(1040, Math.max(860, runnerRow.clientWidth + 120));
let pickupX = 420;
let pickupY = 92;
let speed = 240;

runnerRow.style.setProperty("--runner-jump", "0px");
runnerRow.style.setProperty("--threat-x", `${threatX}px`);
runnerRow.style.setProperty("--pickup-x", `${pickupX}px`);
runnerRow.style.setProperty("--pickup-y", `${pickupY}px`);

function tickTimer() {
  if (paused) return;
  state.timer -= 1;
  saveGameState(state);
  renderHud(state);
  if (state.timer <= 0) goToQuestion();
}

function updateRunner(now) {
  if (paused) {
    lastTime = now;
    frameId = requestAnimationFrame(updateRunner);
    return;
  }

  const dt = Math.min(0.034, (now - lastTime) / 1000 || 0);
  lastTime = now;
  const currentSpeed = speed + pickups * 18 + state.current * 12;
  threatX -= currentSpeed * dt;
  pickupX -= currentSpeed * dt;
  jump += velocity * dt;
  velocity -= 1850 * dt;

  if (jump < 0) {
    jump = 0;
    velocity = 0;
    runnerPlayer.classList.remove("jumping");
  }

  runnerRow.style.setProperty("--runner-jump", `${jump}px`);
  runnerRow.style.setProperty("--threat-x", `${threatX}px`);
  runnerRow.style.setProperty("--pickup-x", `${pickupX}px`);
  runnerRow.style.setProperty("--pickup-y", `${pickupY}px`);

  if (isCollectingPickup()) collectPickup();
  if (pickups >= 3 || isHitByThreat()) goToQuestion();

  if (threatX < -170) {
    threatX = Math.min(900, Math.max(650, runnerRow.clientWidth + 120));
  }

  if (pickupX < -90) {
    pickupX = Math.min(960, Math.max(700, runnerRow.clientWidth + 260));
    pickupY = pickPickupHeight();
  }

  frameId = requestAnimationFrame(updateRunner);
}

function runnerJump() {
  if (paused || jump > 8) return;
  velocity = 980;
  runnerPlayer.classList.add("jumping");
}

function collectPickup() {
  if (runnerPickup.classList.contains("collected")) return;
  pickups += 1;
  state.score += 5;
  saveGameState(state);
  renderHud(state);
  runnerPickup.classList.add("collected");
  runPrompt.textContent = `+5 points collected. ${Math.max(0, 3 - pickups)} more before the cyber choice.`;
  pickupX = Math.min(780, Math.max(520, runnerRow.clientWidth * 0.52));
  pickupY = pickPickupHeight();
  threatX = Math.max(threatX, runnerRow.clientWidth + 260);
  window.setTimeout(() => runnerPickup.classList.remove("collected"), 260);
}

function pickPickupHeight() {
  return [78, 98, 118][Math.floor(Math.random() * 3)];
}

function isCollectingPickup() {
  return rectsOverlap(runnerPlayer.getBoundingClientRect(), runnerPickup.getBoundingClientRect(), 10);
}

function isHitByThreat() {
  if (jump > 72) return false;
  return rectsOverlap(runnerPlayer.getBoundingClientRect(), emailCard.getBoundingClientRect(), 34);
}

function rectsOverlap(first, second, padding = 0) {
  return (
    first.left + padding < second.right &&
    first.right - padding > second.left &&
    first.top + padding < second.bottom &&
    first.bottom - padding > second.top
  );
}

function goToQuestion() {
  window.clearInterval(timerId);
  window.cancelAnimationFrame(frameId);
  saveGameState(state);
  window.location.href = "question.html";
}

document.getElementById("pauseButton").addEventListener("click", (event) => {
  paused = !paused;
  event.currentTarget.textContent = paused ? "Resume" : "Pause";
  runPrompt.textContent = paused
    ? "Paused. Press Resume to keep running."
    : "Space = jump. Collect green points. Avoid the red threat.";
});

document.getElementById("restartButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});

window.addEventListener(
  "keydown",
  (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      runnerJump();
    }
  },
  true,
);

timerId = window.setInterval(tickTimer, 1000);
frameId = requestAnimationFrame(updateRunner);
