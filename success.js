const successState = loadGameState();

renderHud(successState);
document.getElementById("finalScore").textContent = successState.score;

const success = successState.lives > 0;
document.getElementById("missionResultTitle").textContent = success ? "Mission Success!" : "Mission Complete";
document.getElementById("missionResultText").textContent = success
  ? "You protected Cyber City and earned a score reward."
  : "Good effort. Try again to unlock the top reward.";

if (successState.score >= 100) {
  document.getElementById("rewardStatus").textContent = "Elite Score Reward";
  document.getElementById("rewardBadge").textContent = "Phishing Detector Champion";
  document.getElementById("rewardMessage").textContent = "Mission success bonus unlocked: expert badge earned.";
} else if (successState.score >= 50) {
  document.getElementById("rewardStatus").textContent = "Strong Score Reward";
  document.getElementById("rewardBadge").textContent = "Cyber Safety Defender";
  document.getElementById("rewardMessage").textContent = "Great work. You spotted key threats and earned a defender reward.";
} else {
  document.getElementById("rewardStatus").textContent = "Starter Score Reward";
  document.getElementById("rewardBadge").textContent = "Cyber Run Rookie";
  document.getElementById("rewardMessage").textContent = "Keep practicing to grow your score and unlock bigger rewards.";
}

document.getElementById("playAgainButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});

document.getElementById("exitButton").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("pauseButton").disabled = true;
document.getElementById("restartButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});
