const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const gameMessage = document.querySelector(".gameMessage");

// Track keys player presses
let keys = {};
// Store player info
let player = {};

function start() {
    player.speed = 2; // How quickly the player moves
    player.score = 0; // Set score to 0
    player.inPlay = true; // Must be true to play game

    // Set up UI
    gameArea.innerHTML = ""; // clears game on restarts
    gameMessage.classList.add("hide");
    startScreen.classList.add("hide");

    // Create bird character element
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
}

// pass in starting position of the pipe (where first pipe will start)
function buildPipes(startPos) {
    // calculate screen size for pipe positioning
    let totalHeight = gameArea.offsetHeight;
    let totalWidth = gameArea.offsetWidth;
    player.pipe++; // increment # of player pipes to keep loop going

    // Create pipeColor so both pipes are the same color each time
    let pipeColor = randomColor();

    // Create TOP PIPE
    let pipe1 = document.createElement("div"); // create pipes
    pipe1.classList.add("pipe");
    pipe1.start = startPos + totalWidth; // dynamic start position. This will move the pipes all the way off the start screen to start
    pipe1.height = Math.floor(Math.random() * 350); // give it a random height up to 350px (top pipe is shorter)
    pipe1.style.height = `${pipe1.height}px`; // assign random height
    pipe1.style.left = `${pipe1.start}px`; // dynamically move (same as bird). Left and pipe.x are paired in order to move pipes
    pipe1.x = pipe1.start; // MUST HAVE THIS in order to see pipes. Using same format we used with bird: pipes will have an x value, which we will use to move them horizontally (these are props we made up for the pipe object). Y value is not needed here since pipes don't move vertically at all
    pipe1.style.top = "0px"; // will always start all the way at the top
    pipe1.id = player.pipe; // all pipes will have different id #s
    pipe1.style.backgroundColor = pipeColor;
    // Add pipe to game area
    gameArea.appendChild(pipe1);

    // Create BOTTOM PIPE (2 pipes will be aligned)
    // create random horizontal spacing between each pipe
    let pipeSpace = Math.floor(Math.random() * 250) + 150; // Make a space up to 399px, but with minimum of at least 150px for bird to fly through
    let pipe2 = document.createElement("div");
    pipe2.classList.add("pipe");
    pipe2.innerHTML = `<br>${player.pipe}`;  // so we can see each pipe's #
    pipe2.start = pipe1.start; // set same as pipe1 start (keeps them paired)
    pipe2.style.height = `${totalHeight - pipe1.height - pipeSpace}px`; // calculate height available for bottom pipe accounting for space b/w pipes & pipe1's height. Not a random height (like pipe1)
    pipe2.style.left = `${pipe1.start}px`; // same as pipe1 start (keeps them paired)
    pipe2.x = pipe1.start; // same as pipe1. Don't need px here bc we need only a # value to calculate movement
    pipe2.style.bottom = "0px"; // will always start all the way at the bottom
    pipe2.id = player.pipe; // same ids as top pipes
    pipe2.style.backgroundColor = pipeColor;
    // Add pipe to game area
    gameArea.appendChild(pipe2);
}

// Generate random hex code color
function randomColor() {
    return `#${Math.random().toString(16).slice(-6)}`
}

function movePipes(bird) {
    // Node list to store all of the lines (pipes)
    let pipes = document.querySelectorAll(".pipe");
    let counter = 0; // counts how many pipes we've removed
    // MOVE THE PIPES
    pipes.forEach(pipe => {
        // console.log(pipe); // shows a bunch of divs being loaded
        pipe.x -= player.speed; // move pipe by subrtacting player speed (set to 2 by default) from pipe's x coord
        pipe.style.left = `${pipe.x}px`; // update left coord w pipe.x val in px. Happens every time we update pipe.x

        // check to see if pipes are off screen & build more. If pipe.x is less than 0, it means the pipe is off the page
        if (pipe.x < 0) {
            pipe.parentElement.removeChild(pipe); // remove each pipe from the parent div (visible area) as it goes off the page
            counter++; // increment by 1 for each pipe we remove (keeps track of how many we've gone through)
        }
        // Check if there is a COLLISION (this is the best place to do it)
        console.log(isCollide(pipe, bird)); // returns true or false
        if (isCollide(pipe, bird)) {
            // Need to pass in pipe & bird objects to check if they overlap
            console.log("crash");
            gameOver(bird); // play gameOver function if they collide
        }
    })

    // CREATE NEW PIPES. Because there is a top and bottom pipe (a set of 2 for each), we have to divide the counter by 2
    counter = counter / 2; // how many we actually have to create
    // loop through how many pipes have been removed in order to know how many new ones to create. Will usually only be 1 at a time, but just in case, we make it dynamic here. As one pipe is removed, 1 pipe is added to end of the screen
    for (let x = 0; x < counter; x++) {
        buildPipes(0); // set start position to 0 this time, because the pipes do not need to be off screen first like they do with initial build
    }
}

function isCollide(elementA, elementB) {
    // We want to get the area where element A & B are both located in order to compare overlap (using getBoundingRect)
    let aRect = elementA.getBoundingClientRect();
    // console.log(aRect); // returns values of bottom, height, left, right, top, x, y and width (for each pipe)
    let bRect = elementB.getBoundingClientRect();
    // console.log(bRect); // shows bird's values (bc we pass it in second)

    // Check if bottom of one rectangle is less than the top of the other OR if the top of the other is greater than the bottom of the second one. Must add a ! to negate it in order to return the correct boolean value we need (otherwise, it will return true when we really need false)
    return !(
        // Need to return a boolean value in order to use it in our conditional
        (aRect.bottom < bRect.top) || // vertical overlap
        (aRect.top > bRect.bottom) || // vertical
        (aRect.right < bRect.left) || // comparing opposite sides (horizontal)
        (aRect.left > bRect.right)  // horizontal overlap
    )
}

// pass in the current bird object from playGame
function gameOver(bird) {
    player.inPlay = false; // stops game
    gameMessage.classList.remove("hide");
    bird.setAttribute("style", "transform: rotate(180deg)"); // flip bird upside down
    // add 1 to score to account for span discrep
    gameMessage.innerHTML = `<u>Game Over</u><br> 
        You scored <b>${player.score + 1}</b> points<br> 
        Click Here to start again`;
};

// MAIN GAMEPLAY FUNCTION
// requestAnimationFrame is a method that provides a smooth way to transition & allows us to create smooth animations. Use it to loop through and continuously play the same animation
function playGame() {
    // Check if game is in play or not
    if (player.inPlay) {
        // Grab elements we created at start of game
        let bird = document.querySelector(".bird");
        let wing = document.querySelector(".wing");

        // MOVE PIPES (must be after we select bird so that we can pass it in)
        movePipes(bird);

        // Wings will only move when an arrow key is pressed
        let move = false;

        // Check values of keys. Saying, "if this value exists AKA if the key was pressed and is true (keydown), do this". Just use if instead of else if in case there are multiple keys pressed at once. Gives horizontal and vertical angled movement
        // We add in conditions to prevent the character from going off screen. Subtract to account for size of bird div
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= player.speed; // gives movement. Set speed in start function
            move = true;
        }
        if (keys.ArrowRight && player.x < (gameArea.offsetWidth - 50)) {
            player.x += player.speed; // increasing x
            move = true;
        }
        // Move up using arrow or space bar
        if ((keys.ArrowUp || keys.Space) && player.y > 0) {
            player.y -= (player.speed * 5); // going up. Mult by 5 to make it go up faster and bc must be greater than 4 to offset game gravity
            move = true;
        }
        if (keys.ArrowDown && player.y < (gameArea.offsetHeight - 44)) {
            player.y += player.speed; // going down
            move = true;
        }

        // Check to see if wing movement is true & move wings if it is
        if (move) {
            wing.pos = (wing.pos === 17) ? 21 : 17;
            wing.style.top = `${wing.pos}px`;
        }

        // Add gravity to pull bird down. Add before we set the style
        player.y += (player.speed * 2);

        // Check if the bird is off the bottom of the screen & GAME OVER!!
        if (player.y > gameArea.offsetHeight) {
            console.log("game over");
            gameOver(bird);
        }

        // Updating position of bird (add last after all other updates to coords are made). Wing will also be moved since it is inside of the bird
        bird.style.left = `${player.x}px`; // left position (matches what we set in start function)
        bird.style.top = `${player.y}px`; // top position
        // console.log(player); // shows coordinates of x and y props

        // Kick off animation again so we are continuously looping through this function
        window.requestAnimationFrame(playGame); // provide the function we are looping through here

        // Increment & show score
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

// Track key presses from player
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);