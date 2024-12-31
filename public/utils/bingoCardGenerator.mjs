// Create an array of numbers 1-75
let array = Array.from({ length: 75 }, (_, i) => i + 1);

// Function to shuffle an array randomly
function shuffledArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// Function to divide the main array into groups for each letter in BINGO
export const divideIntoGroups = () => {
    return [
        shuffledArray(array.slice(0, 75)), // B
        shuffledArray(array.slice(0, 75)), // I
        shuffledArray(array.slice(0, 75)), // N
        shuffledArray(array.slice(0, 75)), // G
        shuffledArray(array.slice(0, 75)), // O
    ];
}

// Function to concatenate the first 5 elements of each group
function arrConcat(initials) {
    return initials[0]
        .slice(0, 5)
        .concat(initials[1].slice(0, 5))
        .concat(initials[2].slice(0, 5))
        .concat(initials[3].slice(0, 5))
        .concat(initials[4].slice(0, 5));
}

// Function to calculate grid indices for vertical columns
function IndexIncrementer() {
    let temp = [];
    for (let i = 0; i <= 4; i++) {
        for (let j = 0 + i; j <= 20 + i; j += 5) {
            temp.push(j);
        }
    }
    return temp;
}

let newIndices = IndexIncrementer(); // Calculate grid indices once

// Function to create the bingo grid
function gridMaker(arr) {
    const gameContainer = document.querySelector(".game");
    gameContainer.innerHTML = `
      <div class="cell-dummy initials">B</div>
      <div class="cell-dummy initials">I</div>
      <div class="cell-dummy initials">N</div>
      <div class="cell-dummy initials">G</div>
      <div class="cell-dummy initials">O</div>
      `; // Clear the existing grid

    for (let i = 0; i < arr.length; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cells");
        cell.textContent = arr[newIndices[i]]; // Populate with grid data
        gameContainer.appendChild(cell);
    }
}

// General-purpose function to generate or reset the Bingo grid
export const generateBingoGrid = () => {
    let initials = divideIntoGroups(); // Divide into B, I, N, G, O groups
    let arr = arrConcat(initials); // Create concatenated array for the grid
    gridMaker(arr); // Generate the grid
};
