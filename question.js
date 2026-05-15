const questionState = loadGameState();
const questionChallenge = currentChallenge(questionState);

renderHud(questionState);
document.getElementById("decisionQuestion").textContent = questionChallenge.question;
document.getElementById("decisionScenario").textContent = `${questionChallenge.from} | ${questionChallenge.subject} | ${questionChallenge.headline}`;

const decisionGrid = document.getElementById("decisionGrid");
decisions.forEach((decision) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `decision-button ${decision.className}`;
  button.textContent = decision.label;
  button.addEventListener("click", () => {
    const correct = decision.id === questionChallenge.correct;
    questionState.lastAnswer = decision.id;
    questionState.lastCorrect = correct;
    if (correct) {
      questionState.score += 10;
    } else {
      questionState.lives = Math.max(0, questionState.lives - 1);
    }
    saveGameState(questionState);
    window.location.href = "feedback.html";
  });
  decisionGrid.appendChild(button);
});

document.getElementById("pauseButton").disabled = true;
document.getElementById("restartButton").addEventListener("click", () => {
  resetGameState();
  window.location.href = "tutorial.html";
});
