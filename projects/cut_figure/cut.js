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
const menu = document.getElementById("menu");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

let score = 0;
let playerName = "";
let polygon = [];
let isDrawing = false;
let startX, startY, endX, endY;
let hasCut = false;

let currentLevel = 1;
let currentRound = 0;

const difficultySettings = {
    easy: { sides: 3, size: 100, cuts: 1 },
    medium: { sides: 4, size: 150, cuts: 1 },
    hard: { sides: 5, size: 200, cuts: 2 }
};

function startNewLevel() {
    if (currentRound < 3) {
        currentRound++;
    } else {
        if (currentLevel < 3) {
            currentRound = 1;
            currentLevel++;
        }
        if (currentLevel === 3 && currentRound === 3) {
            finishGame();
            return;
        }
    }

    let difficulty = "easy";
    if (currentLevel === 2) difficulty = "medium";
    if (currentLevel === 3) difficulty = "hard";

    polygon = generateRandomPolygon(difficulty);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon(polygon);

    infoDiv.textContent =
        currentLevel === 3
            ? `Раунд ${currentRound} уровня ${currentLevel}: Разделите фигуру на три равные части.`
            : `Раунд ${currentRound} уровня ${currentLevel}: Разделите фигуру на две равные части.`;


    firstCutComplete = false;
    firstCutParts = null;
    nextRoundButton.classList.add("hidden");
    canvas.style.border = "1px solid black";
    hasCut = false;
}


function startNewRound() {
    startNewLevel();
}

function splitPolygonAndCalculate() {
    const lineStart = { x: startX, y: startY };
    const lineEnd = { x: endX, y: endY };

    if (currentLevel === 3) {
        if (!firstCutComplete) {
            const { left, right } = splitPolygon(polygon, lineStart, lineEnd);

            if (!left.length || !right.length) {
                infoDiv.textContent = "Первый разрез некорректный. Попробуйте снова.";
                canvas.style.border = "3px solid red";
                return;
            }

            firstCutComplete = true;
            firstPart = left;
            secondPart = right;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPolygon(left, "lightblue");
            drawPolygon(right, "lightgreen");

            infoDiv.textContent = "Первый разрез выполнен. Теперь сделайте второй разрез.";
            return;
        } else {
            const { left: leftSplit, right: rightSplit } = splitPolygon(firstPart, lineStart, lineEnd);
            let thirdPart;

            if (!leftSplit.length || !rightSplit.length) {
                const secondSplit = splitPolygon(secondPart, lineStart, lineEnd);
                if (secondSplit.left.length && secondSplit.right.length) {
                    thirdPart = secondSplit.right;
                    firstPart = secondSplit.left;
                } else {
                    infoDiv.textContent = "Второй разрез некорректный. Попробуйте снова.";
                    canvas.style.border = "3px solid red";
                    return;
                }
            } else {
                thirdPart = rightSplit;
                firstPart = leftSplit;
            }

            const totalArea = calculatePolygonArea(polygon);
            const areas = [
                calculatePolygonArea(firstPart),
                calculatePolygonArea(secondPart),
                calculatePolygonArea(thirdPart),
            ];
            const percentages = areas.map((area) => (area / totalArea) * 100);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPolygon(firstPart, "lightblue");
            drawPolygon(secondPart, "lightgreen");
            drawPolygon(thirdPart, "lightcoral");

            infoDiv.textContent = `Площади частей: ${percentages
                .map((p) => p.toFixed(2))
                .join("%, ")}%`;

            const allCloseToEqual = percentages.every((p) => Math.abs(p - 33.33) <= 7);

            if (allCloseToEqual) {
                score++;
                canvas.style.border = "3px solid green";
                infoDiv.textContent += " - Идеальный разрез! \n Очки: " + String(score);
            } else {
                score--;
                canvas.style.border = "3px solid red";
                infoDiv.textContent += " - Плохой разрез! \n Очки: " + String(score);
            }

            hasCut = true;
            nextRoundButton.classList.remove("hidden");
        }
    } else {
        const { left, right } = splitPolygon(polygon, lineStart, lineEnd);

        if (!left.length || !right.length) {
            infoDiv.textContent = "Разрез некорректный. Попробуйте снова.";
            canvas.style.border = "3px solid red";
            return;
        }

        const totalArea = calculatePolygonArea(polygon);
        const leftArea = calculatePolygonArea(left);
        const rightArea = calculatePolygonArea(right);

        const percentageLeft = (leftArea / totalArea) * 100;
        const percentageRight = (rightArea / totalArea) * 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPolygon(left, "lightblue");
        drawPolygon(right, "lightgreen");

        infoDiv.textContent = `Площадь частей: ${percentageLeft.toFixed(2)}%, ${percentageRight.toFixed(2)}%`;

        if (Math.abs(percentageLeft - 50) <= 7) {
            score++;
            canvas.style.border = "3px solid green";
            infoDiv.textContent += " - Идеальный разрез! \n Очки: " + String(score);
        } else {
            score--;
            canvas.style.border = "3px solid red";
            infoDiv.textContent += " - Плохой разрез! \n Очки: " + String(score);
        }

        hasCut = true;
        nextRoundButton.classList.remove("hidden");
    }
}

nextRoundButton.addEventListener('click', startNewRound);

const rankings = JSON.parse(localStorage.getItem("rankings")) || [];

function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Пожалуйста, введите ваше имя.");
        return;
    }
    startPage.classList.add("hidden");
    gamePage.classList.remove("hidden");
    menu.style.display = "block";
    welcomeMessage.textContent = `Добро пожаловать, ${playerName}!`;
    score = 0;
    startNewLevel();
}

function finishGame() {
    currentRound = 0;
    currentLevel = 1;
    gamePage.classList.add("hidden");
    menu.style.display = "none";
    endPage.classList.remove("hidden");
    finalScore.textContent = `${playerName}, ваш финальный счет: ${score}!`;
    rankings.push({ name: playerName, score });
    localStorage.setItem("rankings", JSON.stringify(rankings));
}

function restartGame() {
    endPage.classList.add("hidden");
    startPage.classList.remove("hidden");
    menu.style.display = "none";
    playerNameInput.value = "";
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

function returnToStart() {
    rankingPage.classList.add("hidden");
    startPage.classList.remove("hidden");
}

function jumpToLevel(level) {
    currentLevel = level;
    currentRound = 0;
    startNewLevel();
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