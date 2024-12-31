import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io();

export default function Widget() {
    const [usuario, setUsuario] = useState('');
    const [salaId, setSalaId] = useState('');
    const [roomCreated, setRoomCreated] = useState(false); // Estado para verificar si la sala fue creada
    const [waitingPlayers, setWaitingPlayers] = useState([]); // Estado para la lista de espera
    const [card, setCard] = useState([]); // Estado para el cartón del jugador

    useEffect(() => {
        socket.emit("set-host");
        
        socket.on("room-created", (roomId) => {
            setRoomCreated(true);
            console.log(`Sala ${roomId} creada.`);
        });

        socket.on("user-waiting", (username) => {
            setWaitingPlayers((prev) => [...prev, username]);
        });

        socket.on("game-ended", (winnerUsername) => {
            alert(`¡El ganador es ${winnerUsername}!`); // Notificar al ganador
            // Aquí puedes agregar lógica para reiniciar el juego o redirigir a otra pantalla
        });

        return () => {
            socket.off("room-created");
            socket.off("user-waiting");
            socket.off("game-ended");
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('join-room', usuario, salaId);
    };

    const markNumber = (number) => {
        socket.emit("mark-card", salaId, number);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            {!roomCreated ? (
                <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Registrate</h2>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-muted-foreground mb-1" htmlFor="usuario">USUARIO:</label>
                        <input
                            type="text"
                            id="usuario"
                            placeholder="Ingresa Usuario"
                            className="border border-border rounded-lg p-2 w-full mb-4"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                        
                        <label className="block text-muted-foreground mb-1" htmlFor="sala-id">SALA ID:</label>
                        <input
                            type="text"
                            id="sala-id"
                            placeholder="Ingresa ID Sala"
                            className="border border-border rounded-lg p-2 w-full mb-4"
                            value={salaId}
                            onChange={(e) => setSalaId(e.target.value)}
                        />
                        
                        <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-lg shadow-md">Ingresar</button>
                    </form>
                </div>
            ) : (
                <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Sala Creada</h2>
                    <h3 className="text-md font-semibold text-foreground mb-2">Jugadores en espera:</h3>
                    <ul>
                        {waitingPlayers.map((player) => (
                            <li key={player} className="flex justify-between items-center mb-2">
                                <span>{player}</span>
                                <button onClick={() => acceptPlayer(player)} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1 rounded-lg">Aceptar</button>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-md font-semibold text-foreground mb-2">Marca un número:</h3>
                    <button onClick={() => markNumber(1)} className="bg-primary text-primary-foreground hover:bg-primary/80 px-2 py-1 rounded-lg">1</button>
                    <button onClick={() => markNumber(2)} className="bg-primary text-primary-foreground hover:bg-primary/80 px-2 py-1 rounded-lg">2</button>
                    {/* Agrega más botones según sea necesario */}
                </div>
            )}
        </div>
    );
} 