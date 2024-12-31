import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config(); // Cargar variables de entorno

const app = express();
const server = createServer(app); // Crear servidor HTTP
const io = new Server(server); // Inicializar Socket.IO con el servidor HTTP

let users = {}; // Almacena la información de las salas y jugadores
let HOST_SOCKET_ID = null; // Almacena el ID del socket del host

app.use(express.static("public")); // Servir archivos estáticos

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado:", socket.id);

    socket.on("set-host", () => {
        // Establecer el socket ID del host
        if (!HOST_SOCKET_ID) {
            HOST_SOCKET_ID = socket.id;
            socket.emit("host-set", "Eres el host de la sala.");
        } else {
            socket.emit("host-error", "Ya hay un host establecido.");
        }
    });

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

        // Si el usuario es el host, permitir la creación de la sala
        if (socket.id === HOST_SOCKET_ID) {
            roomData.host = { username, socketID: socket.id };
            socket.join(roomId);
            socket.emit("room-created", roomId); // Notificar al host que la sala fue creada
        } else if (roomData.host) {
            // Si la sala ya tiene un host, no permitir que otros la creen
            socket.emit("failed-to-create-room", "La sala ya tiene un host.");
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
        
        if (userSocketId && roomData.host && roomData.host.socketID === socket.id) {
            // Mover al usuario de la lista de espera a la lista de jugadores
            roomData.players[userSocketId] = username;
            delete roomData.waitingPlayers[userSocketId]; // Eliminar de la lista de espera
            io.to(userSocketId).emit("user-accepted", username); // Notificar al usuario que fue aceptado
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
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});