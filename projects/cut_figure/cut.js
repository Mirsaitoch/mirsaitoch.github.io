const startPage = document.getElementById("startPage");
const gamePage = document.getElementById("gamePage");
const endPage = document.getElementById("endPage");
const rankingPage = document.getElementById("rankingPage");

const playerNameInput = document.getElementById("playerName");
const welcomeMessage = document.getElementById("welcomeMessage");
const finalScore = document.getElementById("finalScore");
const rankingList = document.getElementById("rankingList");
const finishGameButton = document.getElementById("finishGameButton");
const nextRoundButton = document.getElementById("nextRoundButton");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

let score = 0;
let playerName = "";
let polygon = [];
let isDrawing = false;
let startX, startY, endX, endY;
let gameInProgress = true;
let hasCut = false;

let currentLevel = 1;
let currentRound = 0;

const difficultySettings = {
    easy: { sides: 3, size: 100 },
    medium: { sides: 4, size: 150 },
    hard: { sides: 5, size: 200 }
};


function startNewLevel() {
    console.log(currentRound, currentLevel)
    if (currentRound < 3) {
        currentRound++;
    } else {
        if (currentLevel < 3) {
            currentRound = 1
            currentLevel++;
        }
        if (currentLevel === 3 && currentRound === 3 ) {
            finishGame()
        }
    }

    let difficulty = "easy";
    if (currentLevel === 2) difficulty = "medium";
    if (currentLevel === 3) difficulty = "hard";

    polygon = generateRandomPolygon(difficulty);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon(polygon);
    nextRoundButton.classList.add("hidden");
    infoDiv.textContent = `Round ${currentRound} of Level ${currentLevel}: Draw a line to cut the shape.`;
    hasCut = false;
}

function startNewRound() {
    startNewLevel();
}

function splitPolygonAndCalculate() {
    if (hasCut) return;

    const lineStart = { x: startX, y: startY };
    const lineEnd = { x: endX, y: endY };

    const { left, right } = splitPolygon(polygon, lineStart, lineEnd);

    const totalArea = calculatePolygonArea(polygon);
    const leftArea = calculatePolygonArea(left);
    const rightArea = calculatePolygonArea(right);

    const percentageLeft = (leftArea / totalArea) * 100;
    const percentageRight = (rightArea / totalArea) * 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon(left, 'lightblue');
    drawPolygon(right, 'lightgreen');

    infoDiv.textContent = `Area 1: ${percentageLeft.toFixed(2)}%, Area 2: ${percentageRight.toFixed(2)}%`;

    if (Math.abs(percentageLeft - 50) <= 5 && Math.abs(percentageRight - 50) <= 5) {
        score++;
        infoDiv.textContent += " - Perfect Split! \n Score: " + String(score);
    } else if (Math.abs(percentageLeft - 50) > 20 || Math.abs(percentageRight - 50) > 20) {
        score--;
        infoDiv.textContent += " - Bad Split! \n Score: " + String(score);
    } else {
        infoDiv.textContent += " Score: " + String(score);
    }

    hasCut = true;
    nextRoundButton.classList.remove("hidden");
}

nextRoundButton.addEventListener('click', startNewRound);

const rankings = JSON.parse(localStorage.getItem("rankings")) || [];

function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }
    startPage.classList.add("hidden");
    gamePage.classList.remove("hidden");
    welcomeMessage.textContent = `Welcome, ${playerName}!`;
    score = 0;
    console.log("score")
    startNewRound();
}

function drawPolygon(poly, color = 'lightblue') {
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function generateRandomPolygon(difficulty) {
    const { sides, size } = difficultySettings[difficulty];
    const polygon = [];
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
        const angle = angleStep * i + (Math.random() * 0.5 - 0.25) * Math.PI;
        const radius = size + (Math.random() * 50 - 25);
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        polygon.push({ x, y });
    }

    return polygon;
}


// Формула площади Гаусса
function calculatePolygonArea(poly) {
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
        let j = (i + 1) % poly.length;
        area += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
    }
    return Math.abs(area / 2);
}

function lineIntersect(p1, p2, p3, p4) {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
    if (det === 0) return null;
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / det;
    const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / det;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    }
    return null;
}

function splitPolygon(polygon, lineStart, lineEnd) {
    const left = [], right = [];
    let intersections = [];
    let currentSide;

    for (let i = 0; i < polygon.length; i++) {
        const curr = polygon[i];
        const next = polygon[(i + 1) % polygon.length];
        const intersection = lineIntersect(lineStart, lineEnd, curr, next);

        if (i === 0) {
            currentSide = (lineEnd.x - lineStart.x) * (curr.y - lineStart.y) - (lineEnd.y - lineStart.y) * (curr.x - lineStart.x);
        }

        const nextSide = (lineEnd.x - lineStart.x) * (next.y - lineStart.y) - (lineEnd.y - lineStart.y) * (next.x - lineStart.x);
        if (currentSide >= 0) left.push(curr);
        else right.push(curr);

        if (intersection) {
            left.push(intersection);
            right.push(intersection);
            intersections.push(intersection);
        }

        currentSide = nextSide;
    }

    if (intersections.length !== 2) return { left: polygon, right: [] }; 

    return { left, right };
}

function finishGame() {
    currentRound = 0
    currentLevel = 0
    gamePage.classList.add("hidden");
    endPage.classList.remove("hidden");
    finalScore.textContent = `${playerName}, your final score is ${score}!`;
    rankings.push({ name: playerName, score });
    localStorage.setItem("rankings", JSON.stringify(rankings));
}

function showRanking() {
    endPage.classList.add("hidden");
    rankingPage.classList.remove("hidden");
    rankingList.innerHTML = "";
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        rankingList.appendChild(li);
    });
}

function restartGame() {
    endPage.classList.add("hidden");
    startPage.classList.remove("hidden");
    playerNameInput.value = "";
}

function returnToStart() {
    rankingPage.classList.add("hidden");
    startPage.classList.remove("hidden");
}

canvas.addEventListener('mousedown', (e) => {
    if (hasCut) return;
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || hasCut) return;
    endX = e.offsetX;
    endY = e.offsetY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon(polygon);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing || hasCut) return;
    endX = e.offsetX;
    endY = e.offsetY;
    isDrawing = false;
    splitPolygonAndCalculate();
});

nextRoundButton.addEventListener('click', startNewRound);
finishGameButton.addEventListener('click', finishGame);