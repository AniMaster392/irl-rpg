let time = 25 * 60;
let timerInterval = null;

async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  document.getElementById("level").textContent = data.level;
  document.getElementById("xp").textContent = data.xp + " / " + data.level * 100;

  const percent = Math.min((data.xp / (data.level * 100)) * 100, 100);
  document.getElementById("xpBar").style.width = percent + "%";

  const questsBox = document.getElementById("quests");
  questsBox.innerHTML = "";

  data.quests.forEach((quest) => {
    const div = document.createElement("div");
    div.className = "quest";

    div.innerHTML = `
      <span>${quest.title} <b>+${quest.xp} XP</b></span>
      <button onclick="completeQuest(${quest.id})">Complete</button>
    `;

    questsBox.appendChild(div);
  });
}

async function completeQuest(id) {
  await fetch("/api/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  });

  loadData();
}

function renderTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  document.getElementById("timer").textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
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

loadData();
renderTimer();