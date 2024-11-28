(() => {
    let score = 1000; // Starting score
    let combo = 0;
    let noteSpeed = parseFloat(getCookie("noteSpeed")) || 2; // Note speed from cookies
    let gamePaused = false;
    let gameOver = false; // Track if the game is over
    let hardcoreMode = false; // Hardcore mode off by default
    let audio = new Audio();
    audio.loop = true;
    let highestScore = getCookie("highestScore") || 1000;

    const notePatterns = [
        { key: 'a', xPosition: window.innerWidth / 2 - 240 },
        { key: 's', xPosition: window.innerWidth / 2 - 120 },
        { key: 'd', xPosition: window.innerWidth / 2 },
        { key: 'f', xPosition: window.innerWidth / 2 + 120 }
    ];

    // DOM Elements
    const scoreElement = document.getElementById('score');
    const comboElement = document.getElementById('combo');
    const cogwheel = document.getElementById('cogwheel');
    const songMenu = document.getElementById('song-menu');
    const songButtons = document.querySelectorAll('.song-btn');
    const hardcoreToggle = document.getElementById('hardcore-mode-toggle');

    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    gameOverElement.innerText = 'Game Over! Reload to Restart';
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '50%';
    gameOverElement.style.left = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.fontSize = '30px';
    gameOverElement.style.color = 'red';
    gameOverElement.style.fontWeight = 'bold';
    gameOverElement.style.display = 'none';
    document.body.appendChild(gameOverElement);

    const highestScoreElement = document.createElement('div');
    highestScoreElement.id = 'highest-score';
    highestScoreElement.textContent = `Highest Score: ${highestScore}`;
    document.body.appendChild(highestScoreElement);

    const pingSound = new Audio('.mp3'); // Add the path to your ping sound

    // Cogwheel click event
    cogwheel.addEventListener('click', () => {
        songMenu.classList.toggle('visible');
    });

    // Song button click event
    songButtons.forEach(button => {
        button.addEventListener('click', () => {
            const songPath = button.getAttribute('data-path');
            audio.src = songPath;
            audio.play();
        });
    });

    // Speed control buttons
    document.getElementById('speed-up').addEventListener('click', () => {
        noteSpeed = Math.max(0.5, noteSpeed - 0.5);
        setCookie("noteSpeed", noteSpeed, 365);
    });

    document.getElementById('slow-down').addEventListener('click', () => {
        noteSpeed += 0.5;
        setCookie("noteSpeed", noteSpeed, 365);
    });

    // Hardcore mode toggle
    hardcoreToggle.addEventListener('change', () => {
        hardcoreMode = hardcoreToggle.checked;
        console.log(`Hardcore Mode: ${hardcoreMode ? "Enabled" : "Disabled"}`);
    });

    document.getElementById('pause-btn').addEventListener('click', () => {
        if (gamePaused) resumeGame();
        else pauseGame();
    });

    function pauseGame() {
        gamePaused = true;
    }

    function resumeGame() {
        gamePaused = false;
    }

    function startGame() {
        let spawnInterval = 1000;
        let gameLoop = setInterval(() => {
            if (!gamePaused && !gameOver) spawnNote();
        }, spawnInterval);

        setInterval(() => {
            if (score >= 20000 && spawnInterval !== 500) {
                spawnInterval = 500;
                clearInterval(gameLoop);
                gameLoop = setInterval(() => {
                    if (!gamePaused && !gameOver) spawnNote();
                }, spawnInterval);
            } else if (score > 10000 && score < 20000 && spawnInterval !== 750) {
                spawnInterval = 750;
                clearInterval(gameLoop);
                gameLoop = setInterval(() => {
                    if (!gamePaused && !gameOver) spawnNote();
                }, spawnInterval);
            }
        }, 500);
    }

    function spawnNote() {
        const randomPattern = notePatterns[Math.floor(Math.random() * notePatterns.length)];
        const note = document.createElement('div');
        note.classList.add('note');
        note.setAttribute('data-key', randomPattern.key);
        note.style.left = `${randomPattern.xPosition}px`;
        note.style.animation = `moveDown ${noteSpeed}s linear`;

        document.getElementById('note-container').appendChild(note);

        note.addEventListener('animationend', () => {
            if (!note.classList.contains('hit')) {
                if (hardcoreMode) {
                    gameOver = true;
                    gameOverElement.style.display = 'block';
                    resetGame();
                } else {
                    updateScore(-100);
                    if (score < 0) {
                        gameOver = true;
                        gameOverElement.style.display = 'block';
                        resetGame();
                    }
                }
            }
            note.remove();
        });
    }

    function handleKeyPress(event) {
        if (gamePaused || gameOver) return;
        const keyPressed = event.key;
        const notes = document.querySelectorAll(`.note[data-key="${keyPressed}"]`);

        let noteHit = false;
        notes.forEach(note => {
            const noteTop = note.getBoundingClientRect().top;
            const hitZone = document.querySelector(`.hit-zone[data-key="${keyPressed}"]`);
            const hitZoneTop = hitZone.getBoundingClientRect().top;

            if (noteTop >= hitZoneTop - 60 && noteTop <= hitZoneTop + 60) {
                note.remove();
                note.classList.add('hit');
                updateScore(100);
                combo += 1;
                comboElement.textContent = `Combo: ${combo}`;
                pingSound.play();
                noteHit = true;
            }
        });

        if (!noteHit) {
            combo = 0;
            comboElement.textContent = `Combo: ${combo}`;
            if (hardcoreMode) {
                gameOver = true;
                gameOverElement.style.display = 'block';
                resetGame();
            } else {
                updateScore(-100);
            }
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
        if (score > highestScore) {
            highestScore = score;
            highestScoreElement.textContent = `Highest Score: ${highestScore}`;
            setCookie("highestScore", highestScore, 365);
        }
    }

    function resetGame() {
        score = 1000;
        combo = 0;
        comboElement.textContent = `Combo: ${combo}`;
        scoreElement.textContent = `Score: ${score}`;
        gamePaused = true;
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return "";
    }
// Ensure the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Select the Hardcore Mode checkbox
    const hardcoreToggle = document.getElementById("hardcore-mode-toggle");

    // Add an event listener for when the checkbox state changes
    hardcoreToggle.addEventListener("change", (event) => {
        if (event.target.checked) {
            console.log("Hardcore Mode Activated!");
            enableHardcoreMode();
        } else {
            console.log("Hardcore Mode Deactivated!");
            disableHardcoreMode();
        }
    });
});

// Function to enable Hardcore Mode
function enableHardcoreMode() {
    // Example logic for enabling Hardcore Mode
    document.body.style.backgroundColor = "red"; // Visual feedback
    console.log("Hardcore Mode is now active. Adjusting game settings...");
    // Add additional changes to increase difficulty here
}

// Function to disable Hardcore Mode
function disableHardcoreMode() {
    // Example logic for disabling Hardcore Mode
    document.body.style.backgroundColor = ""; // Reset background color
    console.log("Hardcore Mode is now inactive. Reverting game settings...");
    // Revert any changes made by Hardcore Mode here
}

    document.addEventListener('keydown', handleKeyPress);
    startGame();
})();
