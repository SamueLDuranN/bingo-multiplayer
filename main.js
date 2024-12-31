import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config(); // Cargar variables de entorno

const app = express();
const server = createServer(app); // Crear servidor HTTP
const io = new Server(server); // Inicializar Socket.IO con el servidor HTTP

let users = {}; // Almacena la información de las salas y jugadores

app.use(express.static("public")); // Servir archivos estáticos

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado:", socket.id);

    socket.on("join-room", (username, roomId) => {
        if (!users[roomId]) {
            users[roomId] = {
                players: {},
                waitingPlayers: {},
                inGamePlayers: {},
                winners: {},
                lossers: {},
                host: null,
                gameStarted: false,
            };
        }

        const roomData = users[roomId];

        // Prevenir unirse si el juego ya ha comenzado
        if (roomData.gameStarted) {
            socket.emit("failed-to-join-room", username, "El juego ya ha comenzado.");
            return;
        }

        // Agregar el usuario a la lista de espera
        roomData.waitingPlayers[socket.id] = username; // Agregar a la lista de espera
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-waiting", username); // Notificar a los demás jugadores
    });

    socket.on("accept-user", (username, roomId) => {
        const roomData = users[roomId];
        const userSocketId = Object.keys(roomData.waitingPlayers).find(id => roomData.waitingPlayers[id] === username);
        
        if (userSocketId) {
            // Mover al usuario de la lista de espera a la lista de jugadores
            roomData.players[userSocketId] = username;
            delete roomData.waitingPlayers[userSocketId]; // Eliminar de la lista de espera
            io.to(userSocketId).emit("user-accepted", username); // Notificar al usuario que fue aceptado
        }
    });

    socket.on("reject-user", (username, roomId) => {
        const roomData = users[roomId];
        const userSocketId = Object.keys(roomData.waitingPlayers).find(id => roomData.waitingPlayers[id] === username);
        
        if (userSocketId) {
            io.to(userSocketId).emit("user-rejected", username); // Notificar al usuario que fue rechazado
            delete roomData.waitingPlayers[userSocketId]; // Eliminar de la lista de espera
        }
    });

    socket.on("start-game", (roomId) => {
        const roomData = users[roomId];
        if (roomData.host && roomData.host.socketID === socket.id) {
            roomData.gameStarted = true;
            io.to(roomId).emit("game-started"); // Notificar a todos que el juego ha comenzado
        } else {
            socket.emit("not-host", "Solo el host puede iniciar el juego.");
        }
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
        // Manejar la desconexión del usuario
        Object.keys(users).forEach((room) => {
            const roomData = users[room];
            if (roomData.players[socket.id]) {
                delete roomData.players[socket.id];
                // Si el host se desconecta, manejar la lógica correspondiente
                if (roomData.host && roomData.host.socketID === socket.id) {
                    delete users[room]; // Eliminar la sala si el host se desconecta
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});