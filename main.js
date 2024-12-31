import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config(); // Load environment variables

const app = express();
const server = createServer(app); // Create HTTP server
/**
 * @type {import("socket.io").Server}
 */
const io = new Server(server); // Initialize Socket.IO with the HTTP server

let users = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
    socket.on("join-room", (username, roomId) => {
        // Ensure room exists or initialize it
        if (!users[roomId]) {
            users[roomId] = {
                players: {},
                inGamePlayers: {},
                winners: {},
                lossers: {},
                host: null,
                gameStarted: false,
            };
        }

        const roomData = users[roomId];

        // Prevent joining if the game has started
        if (roomData.gameStarted) {
            socket.emit(
                "failed-to-join-room",
                username,
                "Game has already started"
            );
            return;
        }

        // Join the room
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("joined-room", username, roomId);

        // Assign host if not already assigned
        if (!roomData.host) {
            roomData.host = {
                socketID: socket.id,
                username: username,
            };
        }
        // Add the player to the room
        roomData.players[socket.id] = username;
        roomData.inGamePlayers[socket.id] = username;
    });

    // Sends value gain from the host to all the users in room
    socket.on("value-send", (num, text, room) => {
        socket.broadcast.to(room).emit("value-recive", num, text, users[room]);
    });

    socket.on("request-current-users", (room) => {
        // Sends everyone including sender
        io.to(room).emit("sending-user-data", users[room]);
    });

    socket.on("is-user-host", (username, room) => {
        // Check if the room exists and if there is a host
        let roomData = users[room];

        if (!roomData || !roomData.host) {
            socket.emit("host-not-or-yes", false);
            return;
        }

        // Compare if the current user is the host
        const isHost = roomData.host.socketID === socket.id;

        // Emit back the result to the user
        socket.emit("host-not-or-yes", isHost);
    });

    socket.on("game-started", (room) => {
        let roomData = users[room];
        roomData.gameStarted = true;
        socket.broadcast.to(room).emit("game-started-everyone");
    });

    socket.on("win", (username, room) => {
        let roomData = users[room];
        let playerId = socket.id;
        let playerData = roomData.inGamePlayers[playerId];

        // Add the winning player to the winners list
        roomData.winners[playerId] = playerData;
        delete roomData.inGamePlayers[playerId];

        // Check if only one player is left
        if (Object.keys(roomData.inGamePlayers).length === 1) {
            // Transfer the last player to lossers
            let lastPlayerId = Object.keys(roomData.inGamePlayers)[0];
            roomData.lossers[lastPlayerId] =
                roomData.inGamePlayers[lastPlayerId];
            delete roomData.inGamePlayers[lastPlayerId];
            io.to(room).emit("game-ended", roomData);
        }

        // Notify the room about the winner
        socket.broadcast.to(room).emit("win-notification", username);

        // Update the result window
        io.to(room).emit("sending-user-data", users[room]);
    });

    socket.on("is-winner", (username, room) => {
        const { winners } = users[room];
        let isWinner = false
        // Check if the current socket.id is in the winners object
        if (Object.keys(winners).includes(socket.id)) {
            isWinner = true
        }
        socket.emit("is-host-winner", isWinner)
    });

    socket.on("reset-game", (room) => {
        if (users[room]) {
            users[room].winners = {}; // Reset winners
            users[room].lossers = {}; // Reset lossers

            // Update the result window
            io.to(room).emit("sending-user-data", users[room]);
            io.to(room).emit("regenerate-bingo-card");
        } else {
            console.error(`Room ${room} not found`);
        }
    });

    socket.on("disconnect", () => {
        const disconnectedUserId = socket.id;

        // Iterate through rooms to check for the disconnected user
        Object.keys(users).forEach((room) => {
            if (
                users[room].players &&
                users[room].players[disconnectedUserId]
            ) {
                // Remove the disconnected user from the players list
                delete users[room].players[disconnectedUserId];

                // If there are no players left or the disconnected user is the host
                if (
                    Object.keys(users[room].players).length === 0 ||
                    users[room].host.socketID === disconnectedUserId
                ) {
                    // If the host is disconnecting
                    if (users[room].host.socketID === disconnectedUserId) {
                        // Emit to all other users in the room that the host has logged out
                        socket
                            .to(room)
                            .emit(
                                "host-logout",
                                "The host has logged out. The room will be closed."
                            );

                        // Delete the room from the users object
                        delete users[room];
                    }
                }
            }
        });
    });

    socket.on("mark-card", (roomId, number) => {
        const roomData = users[roomId];
        const playerCard = roomData.cards[socket.id];

        // Marcar el número en el cartón
        if (!playerCard.includes(number)) {
            playerCard.push(number);
        }

        // Verificar si el jugador ha llenado el cartón
        // Cambia la condición para verificar si el cartón está completamente lleno
        if (playerCard.length === 25) { // Cambia 25 por la cantidad total de números en el cartón
            io.to(roomId).emit("game-ended", roomData.waitingPlayers[socket.id]); // Notificar a todos que el jugador ha ganado
            roomData.gameStarted = false; // Finalizar el juego
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});