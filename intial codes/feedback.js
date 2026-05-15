const feedbackState = loadGameState();
const feedbackChallenge = currentChallenge(feedbackState);

renderHud(feedbackState);

const feedbackBox = document.getElementById("feedbackBox");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackText = document.getElementById("feedbackText");
const feedbackCaption = document.getElementById("feedbackCaption");
const continueButton = document.getElementById("continueButton");

if (feedbackState.lastCorrect) {
  feedbackBox.classList.remove("wrong");
  feedbackTitle.textContent = "Correct!";
  feedbackText.textContent = feedbackChallenge.feedback;
  feedbackCaption.textContent = "Player learns from feedback";
} else {
  feedbackBox.classList.add("wrong");
  feedbackTitle.textContent = "Oops!";
  feedbackText.textContent = feedbackChallenge.wrong;
  feedbackCaption.textContent = "Mistake creates learning opportunity";
}

continueButton.textContent =
  feedbackState.lives <= 0 || feedbackState.current >= challenges.length - 1 ? "See Rewards" : "Next Challenge";

continueButton.addEventListener("click", () => {
  if (feedbackState.lives <= 0 || feedbackState.current >= challenges.length - 1) {
    saveGameState(feedbackState);
    window.location.href = "success.html";
    return;
  }

  feedbackState.current += 1;
  feedbackState.timer = missionTime;
  saveGameState(feedbackState);
  window.location.href = "run.html";
});

document.getElementById("pauseButton").disabled = true;
document.getElementById("restartButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});
