(() => {
    let score = 1000;  // Starting score
    let combo = 0;
    let noteSpeed = parseFloat(getCookie("noteSpeed")) || 2; // Get the saved speed from cookies (default to 2 if not set)
    let gamePaused = false;
    let gameOver = false; // Track if the game is over
    let audio = new Audio();
    audio.loop = true; // Create an Audio object for song playback
    let highestScore = getCookie("highestScore") || 1000;  // Get the highest score from cookies, default to 1000 if not set

    const notePatterns = [
        { key: 'a', xPosition: window.innerWidth / 2 - 240 }, // Left column
        { key: 's', xPosition: window.innerWidth / 2 - 120 }, // Middle-left column
        { key: 'd', xPosition: window.innerWidth / 2 },       // Middle-right column
        { key: 'f', xPosition: window.innerWidth / 2 + 120 }  // Far-right column
    ];

    // DOM Elements
    const scoreElement = document.getElementById('score');
    const comboElement = document.getElementById('combo');
    const cogwheel = document.getElementById('cogwheel');
    const songMenu = document.getElementById('song-menu');
    const songButtons = document.querySelectorAll('.song-btn');
    const gameOverElement = document.createElement('div'); // Game Over message element
    gameOverElement.id = 'game-over'; // Give it an ID for styling

    // Add Game Over message to DOM
    gameOverElement.innerText = 'Game Over! Reload to Restart';
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '50%';
    gameOverElement.style.left = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.fontSize = '30px';
    gameOverElement.style.color = 'red';
    gameOverElement.style.fontWeight = 'bold';
    gameOverElement.style.display = 'none';  // Initially hidden
    document.body.appendChild(gameOverElement);

    // Highest Score display
    const highestScoreElement = document.createElement('div');
    highestScoreElement.id = 'highest-score';
    highestScoreElement.textContent = `Highest Score: ${highestScore}`;
    document.body.appendChild(highestScoreElement);

    // Ping sound setup
    const pingSound = new Audio('.mp3'); // Add the path to your ping sound file here

    // Cogwheel click event
    cogwheel.addEventListener('click', () => {
        console.log("Cogwheel clicked");
        songMenu.classList.toggle('visible');
    });

    // Song button click event
    songButtons.forEach(button => {
        button.addEventListener('click', () => {
            const songPath = button.getAttribute('data-path');
            console.log('Now Playing:', songPath);
            audio.src = songPath;
            audio.play(); // Play the selected song
        });
    });

    // Speed control buttons
    document.getElementById('speed-up').addEventListener('click', function () {
        noteSpeed = Math.max(0.5, noteSpeed - 0.5); // Decrease note speed (minimum 0.5)
        console.log('Speed Up: ', noteSpeed);
        setCookie("noteSpeed", noteSpeed, 365); // Save speed to cookies
    });

    document.getElementById('slow-down').addEventListener('click', function () {
        noteSpeed += 0.5; // Increase note speed
        console.log('Slow Down: ', noteSpeed);
        setCookie("noteSpeed", noteSpeed, 365); // Save speed to cookies
    });

    document.getElementById('wipe').addEventListener('click', function () {
        score = 0;
        highestScore = 0;
        combo = 0// Increase note speed
        console.log('Wiped Score');
    });

    // Pause button
    document.getElementById('pause-btn').addEventListener('click', function () {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    function pauseGame() {
        gamePaused = true;
        console.log('Game Paused');
    }

    function resumeGame() {
        gamePaused = false;
        console.log('Game Resumed');
    }

    function startGame() {
        let spawnInterval = 1000; // Initial spawn interval
        let gameLoop = setInterval(() => {
            if (!gamePaused && !gameOver) {
                spawnNote();
            }
        }, spawnInterval);

        // Dynamically adjust spawn interval based on score
        setInterval(() => {
            if (score >= 20000 && spawnInterval !== 500) {  // Change interval to 500ms if score >= 20k
                spawnInterval = 500;
                clearInterval(gameLoop); // Clear the old interval
                gameLoop = setInterval(() => {
                    if (!gamePaused && !gameOver) {
                        spawnNote();
                    }
                }, spawnInterval);
            } else if (score > 10000 && score < 20000 && spawnInterval !== 750) {  // Change interval to 750ms for scores between 10k and 20k
                spawnInterval = 750;
                clearInterval(gameLoop); // Clear the old interval
                gameLoop = setInterval(() => {
                    if (!gamePaused && !gameOver) {
                        spawnNote();
                    }
                }, spawnInterval);
            }
        }, 500); // Check every 500ms for score updates
    }

    function spawnNote() {
        const randomPattern = notePatterns[Math.floor(Math.random() * notePatterns.length)];
        const note = document.createElement('div');
        note.classList.add('note');
        note.setAttribute('data-key', randomPattern.key);
        note.style.left = `${randomPattern.xPosition}px`;
        note.style.animation = `moveDown ${noteSpeed}s linear`;

        document.getElementById('note-container').appendChild(note);

        // Remove the note when it reaches the bottom and deduct points if missed
        note.addEventListener('animationend', () => {
            if (!note.classList.contains('hit')) { // If it was not hit
                updateScore(-100); // Deduct 100 points for missed note
                if (score < 0) {
                    gameOver = true;
                    gameOverElement.style.display = 'block';  // Show game over message
                    resetGame();
                }
            }
            note.remove();
        });
    }

    function handleKeyPress(event) {
        if (gamePaused || gameOver) return;

        const keyPressed = event.key;
        const notes = document.querySelectorAll(`.note[data-key="${keyPressed}"]`);

       if (notes.length > 0) {
    let noteHit = false; // Flag to check if any note was hit

    notes.forEach(note => {
        const noteTop = note.getBoundingClientRect().top;
        const hitZone = document.querySelector(`.hit-zone[data-key="${keyPressed}"]`);
        const hitZoneTop = hitZone.getBoundingClientRect().top;

        if (noteTop >= hitZoneTop - 60 && noteTop <= hitZoneTop + 60) {
            // If the note is within the hit range
            note.remove();
            note.classList.add('hit');
            note.classList.add('confetti'); // Mark the note as hit
            updateScore(100);
            showHitText();
            combo += 1;
            comboElement.textContent = `Combo: ${combo}`; // Update combo
            pingSound.play(); // Play ping sound when the note is hit
            noteHit = true; // Note was hit successfully
        }
    });

    if (!noteHit) {
        // If no notes were hit in this row, count as a miss
        combo = 0;
        comboElement.textContent = `Combo: ${combo}`;
        updateScore(-100);
        showMissText();
    }
} else {
    // If no notes in the row, count as a miss
    combo = 0;
    comboElement.textContent = `Combo: ${combo}`;
    updateScore(-100);
    showMissText();
}

        const hitZone = document.querySelector(`.hit-zone[data-key="${event.key}"]`);
        if (hitZone) {
            hitZone.classList.add('glowing');
        }
    }

    function handleKeyRelease(event) {
        const hitZone = document.querySelector(`.hit-zone[data-key="${event.key}"]`);
        if (hitZone) {
            hitZone.classList.remove('glowing');
        }
    }

    function emitConfetti(note) {
        const numPieces = 50; // Number of confetti pieces
        const colors = ['#ff0', '#ff6347', '#32cd32', '#00bfff', '#ffd700']; // Confetti colors

        for (let i = 0; i < numPieces; i++) {
            // Create a confetti piece
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');

            // Randomize color
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // Randomize starting position
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = (note.offsetTop || window.innerHeight / 2) + 'px'; // Start near the note or screen center

            // Append to the body
            document.body.appendChild(confetti);

            // Remove confetti after animation completes
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
    }

    function showHitText() {
        // Create the "HIT" text element
        const hitText = document.createElement('div');
        hitText.textContent = "hit!";
        hitText.classList.add('hit-text');

        // Randomize position within the game window
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        hitText.style.left = `${randomX}px`;
        hitText.style.top = `${randomY}px`;

        // Append the "HIT" text to the body
        document.body.appendChild(hitText);

        // Remove the "HIT" text after animation completes
        hitText.addEventListener('animationend', () => {
            hitText.remove();
        });
    }
  
    function showMissText() {
        // Create the "HIT" text element
        const hitText = document.createElement('div');
        hitText.textContent = "miss!";
        hitText.classList.add('miss-text');

        // Randomize position within the game window
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        hitText.style.left = `${randomX}px`;
        hitText.style.top = `${randomY}px`;

        // Append the "HIT" text to the body
        document.body.appendChild(hitText);

        // Remove the "HIT" text after animation completes
        hitText.addEventListener('animationend', () => {
            hitText.remove();
        });
    }


    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
        if (score > highestScore) {
            highestScore = score;
            highestScoreElement.textContent = `Highest Score: ${highestScore}`;
            setCookie("highestScore", highestScore, 365);  // Store the highest score in cookies
        }
    }

    function resetGame() {
        score = 1000;  // Reset score to 1000
        combo = 0;     // Reset combo
        comboElement.textContent = `Combo: ${combo}`;
        scoreElement.textContent = `Score: ${score}`;
        gamePaused = true; // Pause the game
        // Reload the page to restart the game
        setTimeout(() => {
            location.reload(); // This reloads the page to reset everything
        }, 2000);  // Delay before reloading to show "Game Over"
    }

    // Cookie functions
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

    // Create hit zones
    notePatterns.forEach(pattern => {
        const hitZone = document.createElement('div');
        hitZone.classList.add('hit-zone');
        hitZone.setAttribute('data-key', pattern.key);
        hitZone.style.left = `${pattern.xPosition}px`;
        document.getElementById('hit-zone-container').appendChild(hitZone);
    });

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);

    startGame();
})();
