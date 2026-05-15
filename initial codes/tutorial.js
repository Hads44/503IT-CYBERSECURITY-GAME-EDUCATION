const tutorialState = loadGameState();
tutorialState.timer = missionTime;
saveGameState(tutorialState);
renderHud(tutorialState);

document.getElementById("tutorialButton").addEventListener("click", () => {
  window.location.href = "run.html";
});

document.getElementById("restartButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});

document.getElementById("pauseButton").disabled = true;
