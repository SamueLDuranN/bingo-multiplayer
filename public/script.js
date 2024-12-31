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

// Manejar el botón de "Ingresar como Administrador"
document.querySelector(".admin-btn").addEventListener("click", () => {
    document.querySelector(".prompt-outer").style.display = "none"; // Ocultar el formulario de usuario
    document.querySelector(".admin-prompt-outer").style.display = "inline-flex"; // Mostrar el formulario de administrador
});

// Manejar la solicitud de inicio de sesión de administrador
document.querySelector(".admin-submit-btn").addEventListener("click", () => {
    const adminUsername = document.querySelector('[name="admin-username"]').value.trim();
    const adminPassword = document.querySelector('[name="admin-password"]').value.trim();

    // Verificar credenciales de administrador
    if (adminUsername === "VerhalenReal" && adminPassword === "verhalrial") {
        alert("Acceso como administrador concedido.");
        // Aquí puedes agregar la lógica para permitir la creación de salas
        socket.emit("create-room", roomId); // Emitir evento para crear sala
        // Ocultar el formulario de administrador
        document.querySelector(".admin-prompt-outer").style.display = "none";
        // Mostrar la interfaz del juego o redirigir al usuario a la sala
        // Puedes agregar aquí la lógica para mostrar la sala o el juego
    } else {
        alert("Credenciales de administrador incorrectas.");
    }
});

// Manejar la solicitud de inicio de sesión normal
document.querySelector(".submit-btn").addEventListener("click", () => {
    const username = document.querySelector('[name="username"]').value.trim();
    if (!username) {
        alert("El nombre de usuario no puede estar vacío.");
        return;
    }
    // Aquí puedes agregar la lógica para enviar la solicitud de inicio de sesión
    alert("Solicitud pendiente."); // Mensaje de solicitud pendiente
    // Emitir la solicitud al servidor
    socket.emit("join-room", username, roomId);
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

// Escuchar el evento de anuncio de ganador
socket.on("winner-announcement", (username) => {
    popup(username, "¡Ha ganado el juego!"); // Usando la función popup que ya tienes
});

// Escuchar la notificación de un usuario esperando
socket.on("user-waiting", (username) => {
    // Mostrar la solicitud de ingreso al administrador
    const userRequest = document.createElement("div");
    userRequest.textContent = `${username} está esperando para unirse.`;
    
    const acceptButton = document.createElement("button");
    acceptButton.textContent = "Aceptar";
    acceptButton.onclick = () => {
        socket.emit("accept-user", username, roomId); // Emitir evento para aceptar al usuario
        userRequest.remove(); // Eliminar la solicitud de la interfaz
    };

    const rejectButton = document.createElement("button");
    rejectButton.textContent = "Rechazar";
    rejectButton.onclick = () => {
        socket.emit("reject-user", username, roomId); // Emitir evento para rechazar al usuario
        userRequest.remove(); // Eliminar la solicitud de la interfaz
    };

    userRequest.appendChild(acceptButton);
    userRequest.appendChild(rejectButton);
    document.body.appendChild(userRequest); // Agregar la solicitud a la interfaz
});

// Escuchar la notificación de que el usuario fue aceptado
socket.on("user-accepted", (username) => {
    alert(`${username} ha sido aceptado en la sala.`);
});

// Escuchar la notificación de que el usuario fue rechazado
socket.on("user-rejected", (username) => {
    alert(`${username} ha sido rechazado de la sala.`);
});

// Manejar el botón de "Iniciar Juego"
document.querySelector(".start-game-btn").addEventListener("click", () => {
    socket.emit("start-game", roomId); // Emitir evento para iniciar el juego
});

// Escuchar el evento de que el juego ha comenzado
socket.on("game-started", () => {
    // Aquí puedes agregar la lógica para mostrar la interfaz del juego
    alert("El juego ha comenzado.");
});