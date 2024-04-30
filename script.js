const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const expert = document.querySelector(".expert");
const gameArea = document.querySelector(".gameArea");
const gameMessage = document.querySelector(".gameMessage");

let keys = {}; // Track keys player presses
let player = {}; // Store player info
player.speed = 2; // How quickly the player moves (2 is normal mode)

function start() {
    player.score = 0; // Set score to 0
    player.inPlay = true; // Must be true to play game

    // Set up UI
    gameArea.innerHTML = ""; // clears game on restarts
    gameMessage.classList.add("hide");
    startScreen.classList.add("hide");
    expert.classList.add("hide");

    // Create BIRD character element
    let bird = document.createElement("div");
    bird.classList.add("bird");
    let wing = document.createElement("span");
    wing.classList.add("wing");
    wing.pos = 17; // set wing position (cooresponds to CSS)
    wing.style.top = `${wing.pos}px`; // aligns everything
    bird.appendChild(wing);
    gameArea.appendChild(bird); // Add bird to game area
    // Get position of bird object (will use these values to move)
    player.x = bird.offsetLeft;
    player.y = bird.offsetTop;

    // Create PIPES
    player.pipe = 0; // starting pipe
    let spacing = 300; // space between pipes
    let howMany = Math.floor((gameArea.offsetWidth) / spacing); // how many pipes can fit on screen at once
    for (let x = 0; x < howMany; x++) {
        buildPipes(player.pipe * spacing);
    }

    // Kick off animation
    window.requestAnimationFrame(playGame);
};

function buildPipes(startPos) {
    // calculate screen size for pipe positioning
    let totalHeight = gameArea.offsetHeight;
    let totalWidth = gameArea.offsetWidth;
    let pipeColor = randomColor();
    player.pipe++; // increment # of pipes to keep building

    // Create TOP PIPE
    let pipe1 = document.createElement("div");
    pipe1.classList.add("pipe");
    pipe1.start = startPos + totalWidth; // dynamic start position. This will move the pipes all the way off the start screen to start
    pipe1.height = Math.floor(Math.random() * 350); // give it a random height up to 350px (top pipe is shorter)
    pipe1.style.height = `${pipe1.height}px`;
    pipe1.style.left = `${pipe1.start}px`; 
    pipe1.x = pipe1.start; // use this to move pipes
    pipe1.style.top = "0px"; // puts pipe at very top of screen
    pipe1.style.backgroundColor = pipeColor;
    gameArea.appendChild(pipe1);

    // Create BOTTOM PIPE
    // create random horizontal spacing between each pipe (at least 150px)
    let pipeSpace = Math.floor(Math.random() * 250) + 150;
    let pipe2 = document.createElement("div");
    pipe2.classList.add("pipe");
    pipe2.innerHTML = `<br>${player.pipe}`;  // see each pipe's #
    pipe2.start = pipe1.start; // set same as pipe1 start (keeps them paired)
    pipe2.style.height = `${totalHeight - pipe1.height - pipeSpace}px`; // calculate height available for bottom pipe accounting for space b/w pipes & pipe1's height
    pipe2.style.left = `${pipe1.start}px`; // set same as pipe1
    pipe2.x = pipe1.start;
    pipe2.style.bottom = "0px"; // puts pipes at bottom of screen
    pipe2.style.backgroundColor = pipeColor;
    gameArea.appendChild(pipe2);
};

// Generate random hex code color
function randomColor() {
    return `#${Math.random().toString(16).slice(-6)}`
};

function movePipes(bird) {
    let pipes = document.querySelectorAll(".pipe");
    let counter = 0; // counts how many pipes we've removed

    // MOVE THE PIPES
    pipes.forEach(pipe => {
        pipe.x -= player.speed; // move pipe by subrtacting player speed from pipe's x coord
        pipe.style.left = `${pipe.x}px`; // update left coord w pipe.x val in px

        // Check to see if pipes are off screen
        if (pipe.x < 0) {
            pipe.parentElement.removeChild(pipe);
            counter++; // increment by 1 for each pipe removed (keeps track of how many we've gone through & how many new ones are needed)
        }

        // Check if there is a COLLISION with a pipe
        if (isCollide(pipe, bird)) {
            gameOver(bird);
        }
    })

    // CREATE NEW PIPES
    counter = counter / 2; // how many new pipes we need to create
    for (let x = 0; x < counter; x++) {
        buildPipes(0);
    }
};

function isCollide(elementA, elementB) {
    let aRect = elementA.getBoundingClientRect();
    let bRect = elementB.getBoundingClientRect();

    // Must add a ! here in order to return the correct boolean value
    return !(
        (aRect.bottom < (bRect.top + 6)) || // vertical overlap (add 6 to account for top of bird img)
        (aRect.top > bRect.bottom) || // vertical
        (aRect.right < bRect.left) || // horizontal overlap
        (aRect.left > bRect.right)  // horizontal
    )
};

function gameOver(bird) {
    player.inPlay = false; // stops game
    bird.setAttribute("style", "transform: rotate(180deg)"); // flip bird upside down
    gameMessage.classList.remove("hide"); // show game over message
    // add 1 to score to account for span discrep
    gameMessage.innerHTML = `<u>Game Over</u><br> 
        You scored <b>${player.score + 1}</b> points<br> 
        Click Here to start again`;
};

// MAIN GAMEPLAY FUNCTION
function playGame() {
    // Check if game is in play or not
    if (player.inPlay) {
        // Grab elements created at start of game
        let bird = document.querySelector(".bird");
        let wing = document.querySelector(".wing");

        // MOVE PIPES
        movePipes(bird);

        // Move wings when an arrow key is pressed
        let move = false;

        // PLAYER MOVEMENT. Add in conditions here to prevent the character from going off screen. Subtract to account for size of bird div
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= (player.speed + 1); // add 1 to account for game moving forward
            move = true;
        }
        if (keys.ArrowRight && player.x < (gameArea.offsetWidth - 50)) {
            player.x += player.speed;
            move = true;
        }
        // Move up using arrow or space bar
        if ((keys.ArrowUp || keys.Space) && player.y > 0) {
            player.y -= (player.speed * 5); // going up. Mult by 5 to make it go up faster than game's gravity
            move = true;
        }
        if (keys.ArrowDown && player.y < (gameArea.offsetHeight - 44)) {
            player.y += player.speed;
            move = true;
        }

        // Move wings
        if (move) {
            wing.pos = (wing.pos === 17) ? 21 : 17; // oscillate between 17 & 21px for wing position
            wing.style.top = `${wing.pos}px`;
        }

        // Gravity to pull bird down
        player.y += (player.speed * 2);

        // GAME OVER if bird goes off bottom of screen
        if (player.y > gameArea.offsetHeight) {
            gameOver(bird);
        }

        // Update position of bird
        bird.style.left = `${player.x}px`;
        bird.style.top = `${player.y}px`;

        // Keep looping through the animation
        window.requestAnimationFrame(playGame);

        // Increment & show player score
        player.score++;
        score.innerText = `Score: ${player.score}`
    }
}

function pressOn(e) {
    e.preventDefault();
    keys[e.code] = true;
}

function pressOff(e) {
    e.preventDefault();
    keys[e.code] = false;
}

// Start game on start & end screens
startScreen.addEventListener("click", start);
gameMessage.addEventListener("click", start);

// Start game on Expert Mode
expert.addEventListener("click", () => {
    player.speed = 4;
    start();
});

// Track key presses from player
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);