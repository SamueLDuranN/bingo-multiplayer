// Import utils functions
import { generateBingoGrid } from "./utils/bingoCardGenerator.mjs";
import { gameStartingWindow } from "./utils/gameStartingWindow.mjs";
import { winCheck } from "./utils/winCheck.mjs";
import { rollBall } from "./utils/rollBall.mjs";
import { promptSubmit } from "./utils/promptSubmit.mjs";
import { startGame } from "./utils/startGame.mjs";
import { displayResultWindow } from "./utils/resultWindow.mjs";

// Popup or custom alert screen
import { popup } from "./helper/popup.mjs";

// Socket even logic for value recieve
import { valueRecieve } from "./socket-events/valueRecieve.mjs";
/**
 * @type {import("socket.io-client").Socket}
 */
const socket = io(); // Create a new socket.io instance to communicate with the server

const cross = "X";

// Starting screen
const playerScreenWrapper = document.querySelector(".player-screen-wrapper");
const playerScreen = document.querySelector("player-screen");
const startGameBtn = document.querySelector(".player-screen-btn");

// Ending screen
const resultScreenWrapper = document.querySelector(".result-screen-wrapper");
const resultCloseBtn = document.querySelector(".result-close");
const showResultBtn = document.querySelector(".show-result");
const restartBtn = document.querySelector(".restart-btn");

// Prompt functionality for username and room selection
let promptOuter = document.querySelector(".prompt-outer"); // The outer container for the prompt

// Show the prompt on page load
window.onload = () => {
    promptOuter.style.display = "inline-flex";
};

// Generate bingo card
generateBingoGrid();

let username, roomId; // Variables to store username and room ID

// Handle show result window
showResultBtn.addEventListener("click", () => {
    resultScreenWrapper.style.display = "block";
    // To populate the result screen
    socket.emit("request-current-users", roomId);
});

resultCloseBtn.addEventListener("click", () => {
    resultScreenWrapper.style.display = "none";
});

// Handle the submission of the prompt
document.querySelector(".submit-btn").addEventListener("click", () => {
    [username, roomId] = promptSubmit(promptOuter, startGameBtn, socket);
});

socket.on("sending-user-data", (usersRoom) => {
    if (!usersRoom.gameStarted) gameStartingWindow(usersRoom);
    displayResultWindow(usersRoom);
});

startGameBtn.addEventListener("click", () => {
    startGame(username, roomId, socket);
});

socket.on("game-started-everyone", () => {
    playerScreenWrapper.style.display = "none";
});

const cells = document.querySelectorAll(".cells"); // Select all grid cells

// Handle the "roll-ball-btn" button click
document.querySelector(".roll-ball-btn").addEventListener("click", () => {
    rollBall(cells, username, roomId, socket);
});

// Handle "value-recive" event from the server
socket.on("value-recive", (number, text, usersRoom) => {
    const { winners } = usersRoom;
    // Check if the current socket.id is in the winners object
    if (Object.keys(winners).includes(socket.id)) {
        return; // Exit the function early if the current user is a winner
    }
    valueRecieve(number, text, cells, cross);
});

// Notify the server that this user has won
socket.on("win-notification", (winner) => {
    popup(winner, "has won the game");
});

let interval = setInterval(() => {
    winCheck(cells, cross, interval, username, roomId, socket);
});

// Handle after the game has ended
socket.on("game-ended", (usersRoom) => {
    resultCloseBtn.style.display = "none";
    resultScreenWrapper.style.display = "block";
    const { host } = usersRoom;
    if (username === host.username) restartBtn.style.display = "block";
});

// Clean the slate for another round aka restart the game
restartBtn.addEventListener("click", () => {
    // Check if user is host
    socket.emit("is-user-host", username, roomId);
    socket.on("host-not-or-yes", (isHost) => {
        if (isHost) return;
    });
    socket.emit("reset-game", roomId);
});

// Regenerate the bingo card
socket.on("regenerate-bingo-card", () => {
    resultScreenWrapper.style.display = "none";
    generateBingoGrid();
});

// When host logout
socket.on("host-logout", (msg) => {
    alert(msg); // Wait for user interaction
    window.location.reload(); // Reload after alert is dismissed
});

socket.on("game-result", (data) => {
    const { winner, loser } = data;

    // Mostrar notificación de ganador y perdedor
    alert(`¡Felicidades ${winner}! Has ganado el juego!`);
    alert(`Lo siento ${loser}, has perdido el juego.`);
    
    // Aquí puedes llamar a la función para mostrar los resultados en la interfaz
    displayResultWindow({ winner, loser });
});
