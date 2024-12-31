import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config(); // Cargar variables de entorno

const app = express();
const server = createServer(app); // Crear servidor HTTP
const io = new Server(server); // Inicializar Socket.IO con el servidor HTTP

let users = {}; // Almacena la información de las salas y jugadores
const HOST_USERNAME = "verhal"; // Nombre de usuario del host

app.use(express.static("public")); // Servir archivos estáticos

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado:", socket.id);

    socket.on("join-room", (username, roomId) => {
        if (!users[roomId]) {
            users[roomId] = {
                players: {},
                waitingPlayers: {},
                host: null,
                gameStarted: false,
                cards: {}, // Almacenar los cartones de los jugadores
            };
        }

        const roomData = users[roomId];

        // Prevenir unirse si el juego ya ha comenzado
        if (roomData.gameStarted) {
            socket.emit("failed-to-join-room", username, "El juego ya ha comenzado.");
            return;
        }

        // Si el usuario es el host, permitir la creación de la sala
        if (username === HOST_USERNAME && !roomData.host) {
            roomData.host = { username, socketID: socket.id };
            socket.join(roomId);
            socket.emit("room-created", roomId); // Notificar al host que la sala fue creada
            console.log(`${username} ha creado la sala ${roomId}`);
        } else if (roomData.host) {
            // Si la sala ya tiene un host, no permitir que otros la creen
            socket.emit("failed-to-create-room", "La sala ya tiene un host.");
            return;
        }

        // Agregar el usuario a la lista de espera
        roomData.waitingPlayers[socket.id] = username; // Agregar a la lista de espera
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-waiting", username); // Notificar a los demás jugadores

        // Inicializar el cartón del jugador
        roomData.cards[socket.id] = []; // Aquí puedes definir cómo se llena el cartón
    });

    socket.on("mark-card", (roomId, number) => {
        const roomData = users[roomId];
        const playerCard = roomData.cards[socket.id];

        // Marcar el número en el cartón
        if (!playerCard.includes(number)) {
            playerCard.push(number);
        }

        // Verificar si el jugador ha llenado el cartón
        if (playerCard.length === 5) { // Cambia 5 por la cantidad de números necesarios para ganar
            io.to(roomId).emit("game-ended", roomData.waitingPlayers[socket.id]); // Notificar a todos que el jugador ha ganado
            roomData.gameStarted = false; // Finalizar el juego
        }
    });

    // Manejar la desconexión del usuario
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
        // Lógica para manejar la desconexión
        Object.keys(users).forEach((room) => {
            const roomData = users[room];
            if (roomData.host && roomData.host.socketID === socket.id) {
                delete users[room]; // Eliminar la sala si el host se desconecta
                console.log(`Sala ${room} eliminada porque el host se desconectó.`);
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});