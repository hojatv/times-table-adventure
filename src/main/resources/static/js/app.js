const state = {
    mode: "quiz",
    stars: 0,
    coins: 0,
    table: "mixed",
    current: null,
    selectedCards: [],
    raceStep: 0,
    raceGoal: 6,
    raceResetTimer: null,
    raceStartedAt: null,
    raceTimer: null,
    raceFinished: false,
    bestRaceTime: Number(localStorage.getItem("bestRaceTime")) || null
};

const byId = (id) => document.getElementById(id);
const tables = Array.from({ length: 11 }, (_, index) => index + 2);
const factors = Array.from({ length: 11 }, (_, index) => index + 2);
let audioContext = null;

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
}

function nextProblem() {
    const left = state.table === "mixed" ? randomItem(tables) : Number(state.table);
    const right = randomItem(factors);
    return { left, right, answer: left * right };
}

function addStar(amount = 1) {
    state.stars += amount;
    byId("stars").textContent = state.stars;
}

function playCoinSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return;
    }

    audioContext = audioContext || new AudioContext();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    gain.connect(audioContext.destination);

    [880, 1320].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.25, now + index * 0.07 + 0.12);
        oscillator.connect(gain);
        oscillator.start(now + index * 0.07);
        oscillator.stop(now + index * 0.07 + 0.16);
    });
}

function animateCoinBurst(amount) {
    const burst = byId("coin-burst");
    const coin = document.createElement("span");
    coin.className = "coin-pop";
    coin.textContent = `+${amount} 🪙`;
    burst.append(coin);
    window.setTimeout(() => coin.remove(), 900);
}

function addCoins(amount) {
    state.coins += amount;
    byId("coins").textContent = state.coins;
    playCoinSound();
    animateCoinBurst(amount);
}

function setFeedback(elementId, text, type) {
    const element = byId(elementId);
    element.textContent = text;
    element.className = `feedback ${type || ""}`.trim();
}

function formatSeconds(milliseconds) {
    return `${(milliseconds / 1000).toFixed(1).replace(".", ",")} s`;
}

function updateBestRaceTime() {
    byId("race-best").textContent = state.bestRaceTime ? formatSeconds(state.bestRaceTime) : "-";
}

function updateRaceTime() {
    const elapsed = state.raceStartedAt ? Date.now() - state.raceStartedAt : 0;
    byId("race-time").textContent = formatSeconds(elapsed);
}

function stopRaceTimer() {
    window.clearInterval(state.raceTimer);
    state.raceTimer = null;
}

function startRaceTimer() {
    stopRaceTimer();
    state.raceStartedAt = Date.now();
    updateRaceTime();
    state.raceTimer = window.setInterval(updateRaceTime, 100);
}

function finishRaceTimer() {
    const elapsed = state.raceStartedAt ? Date.now() - state.raceStartedAt : 0;
    stopRaceTimer();
    byId("race-time").textContent = formatSeconds(elapsed);

    if (!state.bestRaceTime || elapsed < state.bestRaceTime) {
        state.bestRaceTime = elapsed;
        localStorage.setItem("bestRaceTime", String(elapsed));
        updateBestRaceTime();
        return true;
    }

    return false;
}

function startQuiz() {
    state.current = nextProblem();
    byId("question").textContent = `${state.current.left} x ${state.current.right} = ?`;
    const wrongAnswers = new Set();

    while (wrongAnswers.size < 3) {
        const offset = Math.floor(Math.random() * 17) - 8;
        const candidate = Math.max(2, state.current.answer + offset);
        if (candidate !== state.current.answer) {
            wrongAnswers.add(candidate);
        }
    }

    byId("answers").replaceChildren(...shuffle([state.current.answer, ...wrongAnswers]).map((answer) => {
        const button = document.createElement("button");
        button.className = "answer";
        button.type = "button";
        button.textContent = answer;
        button.addEventListener("click", () => {
            if (answer === state.current.answer) {
                addStar();
                addCoins(5);
                setFeedback("quiz-feedback", "Richtig. Die nächste Aufgabe ist bereit.", "good");
                startQuiz();
            } else {
                setFeedback("quiz-feedback", "Versuche es noch einmal. Schau dir die Reihe genau an.", "try");
            }
        });
        return button;
    }));
}

function startMemory() {
    state.selectedCards = [];
    const problems = shuffle(factors).slice(0, 4).map((right) => {
        const left = state.table === "mixed" ? randomItem(tables) : Number(state.table);
        return { id: crypto.randomUUID(), left, right, answer: left * right };
    });
    const cards = shuffle(problems.flatMap((problem) => [
        { id: problem.id, text: `${problem.left} x ${problem.right}`, kind: "question" },
        { id: problem.id, text: String(problem.answer), kind: "answer" }
    ]));

    byId("memory-grid").replaceChildren(...cards.map((card) => {
        const button = document.createElement("button");
        button.className = "memory-card";
        button.type = "button";
        button.textContent = card.text;
        button.dataset.id = card.id;
        button.dataset.kind = card.kind;
        button.addEventListener("click", () => selectMemoryCard(button));
        return button;
    }));
    setFeedback("memory-feedback", "Finde alle passenden Paare.", "");
}

function selectMemoryCard(card) {
    if (card.classList.contains("matched") || state.selectedCards.includes(card)) {
        return;
    }

    card.classList.add("selected");
    state.selectedCards.push(card);

    if (state.selectedCards.length !== 2) {
        return;
    }

    const [first, second] = state.selectedCards;
    const isMatch = first.dataset.id === second.dataset.id && first.dataset.kind !== second.dataset.kind;

    window.setTimeout(() => {
        if (isMatch) {
            first.classList.add("matched");
            second.classList.add("matched");
            addStar();
            addCoins(3);
            setFeedback("memory-feedback", "Passt zusammen. Weiter so.", "good");
        } else {
            setFeedback("memory-feedback", "Das ist kein Paar. Probiere eine andere Karte.", "try");
        }

        first.classList.remove("selected");
        second.classList.remove("selected");
        state.selectedCards = [];

        if (!document.querySelector(".memory-card:not(.matched)")) {
            setFeedback("memory-feedback", "Alles gefunden. Gleich kommt ein neues Feld.", "good");
            window.setTimeout(startMemory, 900);
        }
    }, 520);
}

function moveRocket() {
    const track = byId("rocket").parentElement;
    const rocket = byId("rocket");
    const finishOffset = 64;
    const maxDistance = Math.max(0, track.clientWidth - rocket.offsetWidth - finishOffset);
    const progress = Math.min(state.raceStep / state.raceGoal, 1);
    rocket.style.transform = `translateX(${Math.round(maxDistance * progress)}px)`;
}

function startRace() {
    window.clearTimeout(state.raceResetTimer);
    if (!state.raceStartedAt) {
        startRaceTimer();
    }
    updateBestRaceTime();
    state.current = nextProblem();
    byId("race-question").textContent = `${state.current.left} x ${state.current.right} = ?`;
    byId("race-answer").value = "";
    moveRocket();
}

function submitRace(event) {
    event.preventDefault();
    if (state.raceFinished) {
        return;
    }

    const answer = Number(byId("race-answer").value);

    if (answer === state.current.answer) {
        state.raceStep += 1;
        addStar();
        addCoins(5);
        moveRocket();
        if (state.raceStep >= state.raceGoal) {
            const isRecord = finishRaceTimer();
            const recordText = isRecord ? " Neue Bestzeit!" : "";
            state.raceFinished = true;
            setFeedback("race-feedback", `Ziel erreicht in ${byId("race-time").textContent}.${recordText} Drücke Neu starten für ein neues Rennen.`, "good");
            byId("race-answer").value = "";
        } else {
            setFeedback("race-feedback", "Richtig. Die Rakete fliegt weiter.", "good");
            startRace();
        }
    } else {
        state.raceStep = Math.max(0, state.raceStep - 1);
        setFeedback("race-feedback", "Prüfe deine Antwort und versuche es noch einmal.", "try");
        startRace();
    }
}

window.addEventListener("resize", () => {
    if (state.mode === "race") {
        moveRocket();
    }
});

function switchMode(mode) {
    if (mode !== "race") {
        stopRaceTimer();
    }
    state.mode = mode;
    document.querySelectorAll(".mode").forEach((button) => {
        button.classList.toggle("active", button.dataset.mode === mode);
    });
    document.querySelectorAll(".game").forEach((game) => {
        game.classList.toggle("active", game.id === `${mode}-game`);
    });

    if (mode === "quiz") startQuiz();
    if (mode === "memory") startMemory();
    if (mode === "race") {
        state.raceStep = 0;
        state.raceStartedAt = null;
        state.raceFinished = false;
        setFeedback("race-feedback", "Antworte richtig, damit die Rakete weiterfliegt.", "");
        startRace();
    }
}

function resetGame() {
    window.clearTimeout(state.raceResetTimer);
    stopRaceTimer();
    state.stars = 0;
    state.coins = 0;
    state.current = null;
    state.selectedCards = [];
    state.raceStep = 0;
    state.raceStartedAt = null;
    state.raceFinished = false;
    byId("stars").textContent = "0";
    byId("coins").textContent = "0";
    byId("race-time").textContent = "0,0 s";
    updateBestRaceTime();
    setFeedback("quiz-feedback", "Wähle die richtige Antwort.", "");
    setFeedback("memory-feedback", "Finde alle passenden Paare.", "");
    setFeedback("race-feedback", "Antworte richtig, damit die Rakete weiterfliegt.", "");
    switchMode(state.mode);
}

document.querySelectorAll(".mode").forEach((button) => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
});

byId("table-select").addEventListener("change", (event) => {
    state.table = event.target.value;
    switchMode(state.mode);
});

byId("race-form").addEventListener("submit", submitRace);
byId("reset-game").addEventListener("click", resetGame);
updateBestRaceTime();
startQuiz();
