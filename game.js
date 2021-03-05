const LEFT = "left";
const RIGHT = "right";
const NONE = "none";
const KEY_UP = "key_up";
const KEY_DOWN = "key_down";

const SETTINGS = {
    paused: true,
    maxMissiles: 3,
    screenBorder: 20,
    comboInterval: 1500,
    timeInterval: 1000,
};

const PLAYER = {
    startingPosition: {
        left: "282px",
        top: "-10px",
    },
    speed: 4,
    direction: NONE,
    movementInterval: 20,
};

const ALIENS = {
    movementInterval: 250,
    count: 32,
    size: 40,
    spacing: 22,
    speed: 8,
    aggression: 3,
    startingPosition: {
        left: "50px",
        top: "60px",
    },
    direction: LEFT,
    score: 25,
};

const MISSILES = {
    speed: 6,
    count: 0,
};

const KEYS = {
    SPACE: " ",
    P: "P",
    RIGHT: "ARROWRIGHT",
    LEFT: "ARROWLEFT",
};

const GAME = {
    currentLevel: {
        aliensDestroyed: 0,
        combo: 1,
        time: 0,
        score: 0,
    },
};

const initControls = () => {
    document.addEventListener("keydown", (event) => controls(event, KEY_DOWN));
    document.addEventListener("keyup", (event) => controls(event, KEY_UP));
};

const controls = (event, action) => {
    event.preventDefault();
    const key = event.key.toUpperCase();
    if (SETTINGS.paused && key !== "P") {
        return;
    }
    if (action === KEY_DOWN) {
        switch (key) {
            case KEYS.LEFT:
                PLAYER.direction = LEFT;
                break;
            case KEYS.RIGHT:
                PLAYER.direction = RIGHT;
                break;
            case KEYS.P:
                pause();
                break;
            case KEYS.SPACE:
                shoot();
                break;
            default:
                break;
        }
    } else {
        switch (key) {
            case KEYS.LEFT:
                PLAYER.direction =
                    PLAYER.direction === LEFT ? NONE : PLAYER.direction;
                break;
            case KEYS.RIGHT:
                PLAYER.direction =
                    PLAYER.direction === RIGHT ? NONE : PLAYER.direction;
                break;
            default:
                break;
        }
    }
};

const pause = () => {
    SETTINGS.paused = !SETTINGS.paused;
    const messageOverlay = document.querySelector("#message-overlay");
    messageOverlay.classList.toggle("show");
    const pauseScreen = messageOverlay.querySelector("#pause");
    pauseScreen.classList.toggle("show");
};

const timeToTimeFormat = (time) => {
    const zeroPad = (num, places) => String(num).padStart(places, "0");
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);
    return `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
};

const drawUI = () => {
    const missilesUI = document.querySelector("#ui-missiles");
    const scoreUI = document.querySelector("#ui-score");
    const aliensDestroyedUI = document.querySelector("#ui-aliens-destroyed");
    const timeUI = document.querySelector("#ui-time");
    const comboUI = document.querySelector("#ui-combo");
    const missiles = "IIIIIIIIIIII";
    comboUI.innerHTML = `<span class="title">X</span>${GAME.currentLevel.combo}`;
    missilesUI.innerHTML = `${missiles.substring(
        0,
        SETTINGS.maxMissiles - MISSILES.count
    )}`;
    scoreUI.innerHTML = `<span class="title">SCORE</span>${GAME.currentLevel.score}`;
    aliensDestroyedUI.innerHTML = `<span class="title">KILLS</span>${GAME.currentLevel.aliensDestroyed}`;
    timeUI.innerHTML = `${timeToTimeFormat(GAME.currentLevel.time)}`;
};

const shoot = () => {
    if (MISSILES.count >= SETTINGS.maxMissiles) {
        return;
    }
    MISSILES.count = MISSILES.count + 1;

    const player = document.querySelector("#player");
    const missile = document.createElement("div");
    missile.classList.add("missile");
    missile.setAttribute("id", `missile-${parseInt(Math.random() * 9999)}`);

    const playerWidth = 18;
    missile.style.left = `${getValueFromPX(player.style.left) + playerWidth}px`;
    missile.style.top = `0`;

    player.parentNode.appendChild(missile);
};

const movePlayer = (speed) => {
    const player = document.querySelector("#player");
    player.style.left = !player.style.left
        ? PLAYER.startingPosition.left
        : player.style.left;
    player.style.top = !player.style.top
        ? PLAYER.startingPosition.top
        : player.style.top;

    const playerPosition = player.getBoundingClientRect();
    const playerLeft = playerPosition.x;
    const playerRight = playerPosition.x + playerPosition.width;

    const space = document.querySelector("#space");
    const spacePosition = space.getBoundingClientRect();
    const borderLeft = spacePosition.x;
    const borderRight = spacePosition.x + spacePosition.width;
    if (PLAYER.direction === LEFT) {
        if (playerLeft - speed > borderLeft + SETTINGS.screenBorder) {
            player.style.left = `${
                getValueFromPX(player.style.left) - speed
            }px`;
        }
    } else if (PLAYER.direction === RIGHT) {
        if (playerRight < borderRight - SETTINGS.screenBorder) {
            player.style.left = `${
                getValueFromPX(player.style.left) + speed
            }px`;
        }
    }
};

const moveMissiles = (speed) => {
    const missiles = document.querySelectorAll(".missile");
    missiles.forEach((missile) => {
        missile.getBoundingClientRect();
        missile.style.top = `${getValueFromPX(missile.style.top) - speed}px`;
        checkHit(missile.getAttribute("id"));
    });
};

const checkHit = (missileId) => {
    const missile = document.querySelector(`#${missileId}`);
    if (!missile) {
        return;
    }
    const aliens = document.querySelectorAll(".alien");
    aliens.forEach((alien) => {
        if (alien.classList.contains("destroyed")) {
            return;
        }
        const alienPosition = alien.getBoundingClientRect();
        const missilePosition = missile.getBoundingClientRect();
        if (
            missilePosition.x > alienPosition.x &&
            missilePosition.x < alienPosition.x + alienPosition.width &&
            missilePosition.y > alienPosition.y &&
            missilePosition.y < alienPosition.y + alienPosition.height
        ) {
            hit(missile, alien);
        } else {
            checkMiss(missile.getAttribute("id"));
        }
    });
};

const checkMiss = (missileId) => {
    const space = document.querySelector("#space");
    const spacePosition = space.getBoundingClientRect();
    const missile = document.querySelector(`#${missileId}`);
    if (!missile) {
        return;
    }
    const missilePosition = missile.getBoundingClientRect();
    if (missilePosition.y < spacePosition.y) {
        missileDestroy(missile);
    }
};

const hit = (missile, alien) => {
    missileDestroy(missile);
    alienDestroy(alien);
    GAME.currentLevel.combo += 1;
};

const missileDestroy = (missile) => {
    missile.remove();
    MISSILES.count = MISSILES.count - 1;
};

const alienDestroy = (alien) => {
    const alienPicture = alien.childNodes[0];
    alienPicture.setAttribute("src", "/images/explosion.gif");
    alien.classList.add("destroyed");
    GAME.currentLevel.aliensDestroyed += 1;
    setTimeout(() => {
        alienPicture.setAttribute("src", "/images/alien_0.png");
    }, 500);
    increaseScore(ALIENS.score);
    checkVictory();
};

const increaseScore = (score) => {
    GAME.currentLevel.score += score * GAME.currentLevel.combo;
};

const endGame = () => {
    clearInterval(alienInterval);
    clearInterval(playerInterval);
};

const checkVictory = () => {
    if (GAME.currentLevel.aliensDestroyed === ALIENS.count) {
        const messageOverlay = document.querySelector("#message-overlay");
        messageOverlay.classList.toggle("show");
        const victoryScreen = messageOverlay.querySelector("#victory");
        victoryScreen.classList.toggle("show");
        const scoreScreen = messageOverlay.querySelector("#score");
        scoreScreen.innerHTML = `SCORE ${GAME.currentLevel.score}`;
        const timeScreen = messageOverlay.querySelector("#time");
        timeScreen.innerHTML = `${timeToTimeFormat(GAME.currentLevel.time)}`;
        endGame();
    }
};

const checkGameOver = () => {
    const alienOverlay = document.querySelector("#alien-overlay");
    const player = document.querySelector("#player");
    const alienPosition = alienOverlay.getBoundingClientRect();
    const playerPosition = player.getBoundingClientRect();
    if (alienPosition.y + alienPosition.height > playerPosition.y) {
        const messageOverlay = document.querySelector("#message-overlay");
        messageOverlay.classList.toggle("show");
        const gameOverScreen = messageOverlay.querySelector("#game-over");
        gameOverScreen.classList.toggle("show");
        endGame();
    }
};

const spawnAliens = (amount, size, spacing) => {
    const alienOverlay = document.querySelector("#alien-overlay");
    alienOverlay.style.left = ALIENS.startingPosition.left;
    alienOverlay.style.top = ALIENS.startingPosition.top;

    for (let a = 0; a < amount; a++) {
        const alien = document.createElement("div");
        const alienPicture = document.createElement("img");
        const alienNumber = parseInt(Math.random() * 5) + 1;
        alienPicture.setAttribute("src", `/images/alien_${alienNumber}.png`);

        alien.appendChild(alienPicture);
        alien.setAttribute("id", `alien-${a}`);
        alien.classList.add("alien");
        alien.style.width = `${size}px`;
        alien.style.padding = `0`;
        alien.style.margin = `${spacing}px ${spacing}px 0 0`;

        alienOverlay.appendChild(alien);
    }
};

const getValueFromPX = (units) => {
    return parseFloat(units.replace("px", ""));
};

const moveAliens = (speed) => {
    const space = document.querySelector("#space");
    const spacePosition = space.getBoundingClientRect();
    const borderLeft = spacePosition.x;
    const borderRight = spacePosition.x + spacePosition.width;

    const aliens = document.querySelector("#alien-overlay");
    const aliensPosition = aliens.getBoundingClientRect();
    const aliensLeft = aliensPosition.x;
    const aliensRight = aliensPosition.x + aliensPosition.width;

    if (ALIENS.direction === LEFT) {
        if (aliensLeft - speed > borderLeft + SETTINGS.screenBorder) {
            aliens.style.left = `${
                getValueFromPX(aliens.style.left) - speed
            }px`;
        } else {
            aliens.style.top = `${
                getValueFromPX(aliens.style.top) + speed * ALIENS.aggression
            }px`;
            ALIENS.direction = RIGHT;
        }
    } else {
        if (aliensRight + speed < borderRight - SETTINGS.screenBorder) {
            aliens.style.left = `${
                getValueFromPX(aliens.style.left) + speed
            }px`;
        } else {
            aliens.style.top = `${
                getValueFromPX(aliens.style.top) + speed * ALIENS.aggression
            }px`;
            ALIENS.direction = LEFT;
        }
    }
    checkGameOver();
};

initControls();
spawnAliens(ALIENS.count, ALIENS.size, ALIENS.spacing);

const timeInterval = setInterval(() => {
    if (!SETTINGS.paused) {
        GAME.currentLevel.time += 1;
    }
}, SETTINGS.timeInterval);

const comboInterval = setInterval(() => {
    if (GAME.currentLevel.combo > 1 && !SETTINGS.paused) {
        GAME.currentLevel.combo -= 1;
    }
}, SETTINGS.comboInterval);

const alienInterval = setInterval(() => {
    if (!SETTINGS.paused) {
        moveAliens(ALIENS.speed);
    }
}, ALIENS.movementInterval);

const playerInterval = setInterval(() => {
    if (!SETTINGS.paused) {
        movePlayer(PLAYER.speed);
        moveMissiles(MISSILES.speed);
        drawUI();
    }
}, PLAYER.movementInterval);
