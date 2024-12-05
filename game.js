(() => {
    const secretKey = "Papapxfkfg"; // Change this to a secret string

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
        combo = 0;
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
        

    function handleKeyPress(event) {
        if (gamePaused || gameOver) return;

        const keyPressed = event.key;
        const notes = document.querySelectorAll(`.note[data-key="${keyPressed}"]`);

        if (notes.length > 0) {
            let noteHit = false; // Flag to check if a note was hit

            notes.forEach(note => {
                const noteTop = note.getBoundingClientRect().top;
                const hitZone = document.querySelector(`.hit-zone[data-key="${keyPressed}"]`);
                const hitZoneTop = hitZone.getBoundingClientRect().top;

                // Check if the note is within the hit range
                if (noteTop >= hitZoneTop - 60 && noteTop <= hitZoneTop + 60) {
                    note.remove(); // Remove the note
                    note.classList.add('hit'); // Mark it as hit
                    updateScore(100); // Add points
                    showHitText(); // Show hit feedback
                    combo += 1; // Increase combo
                    comboElement.textContent = `Combo: ${combo}`;
                    pingSound.play(); // Play the sound
                    noteHit = true; // Note was successfully hit
                }
            });

            if (!noteHit) {
                // If no notes were hit in the row, it's a miss
                combo = 0;
                comboElement.textContent = `Combo: ${combo}`;
                updateScore(-100); // Deduct points
                showMissText(); // Show miss feedback
            }
        } else {
            // If no notes exist for the pressed key, count it as a miss
            combo = 0;
            comboElement.textContent = `Combo: ${combo}`;
            updateScore(-100); // Deduct points
            showMissText(); // Show miss feedback
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
            const confettiPiece = document.createElement('div');
            confettiPiece.classList.add('confetti');
            confettiPiece.style.left = `${note.getBoundingClientRect().left + Math.random() * note.offsetWidth}px`;
            confettiPiece.style.top = `${note.getBoundingClientRect().top}px`;
            confettiPiece.style.animation = `confettiFall 2s ease-in-out forwards`;

            document.body.appendChild(confettiPiece);
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Score: ${score}`;
        if (score > highestScore) {
            highestScore = score;
            highestScoreElement.textContent = `Highest Score: ${highestScore}`;
            setSecureCookie("highestScore", highestScore, 365);  // Securely store the highest score in cookies
        }
    }

    function showHitText() {
        const hitText = document.createElement('div');
        hitText.classList.add('hit-text');
        hitText.innerText = 'Hit!';
        document.body.appendChild(hitText);
        setTimeout(() => hitText.remove(), 500); // Remove hit text after half a second
    }

    function showMissText() {
        const missText = document.createElement('div');
        missText.classList.add('miss-text');
        missText.innerText = 'Miss!';
        document.body.appendChild(missText);
        setTimeout(() => missText.remove(), 500); // Remove miss text after half a second
    }

    // Add event listeners for keypress and keyrelease
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);

    // Start the game
    startGame();

    // SHA-256 HMAC for signing data
    function hmacSHA256(data, key) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const dataBuffer = encoder.encode(data);
        return window.crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
            .then(key => window.crypto.subtle.sign("HMAC", key, dataBuffer))
            .then(signature => {
                const byteArray = new Uint8Array(signature);
                return Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
            });
    }

    // Encrypt the cookie value
    function encryptCookieValue(value) {
        return hmacSHA256(value, secretKey);
    }

    // Set encrypted cookie
    function setSecureCookie(name, value, days) {
        encryptCookieValue(value).then(encryptedValue => {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = `${name}=${encryptedValue};${expires};path=/`;
        });
    }

    // Get and validate encrypted cookie
    function getSecureCookie(name) {
        const cookieValue = getCookie(name);
        if (cookieValue) {
            return window.crypto.subtle.verify("HMAC", secretKey, cookieValue)
                .then(isValid => isValid ? cookieValue : null);
        }
        return null;
    }

    // Standard cookie getter (for non-sensitive data)
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
