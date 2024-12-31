import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io();

export default function LoginWidget() {
    const [usuario, setUsuario] = useState('');
    const [salaId, setSalaId] = useState('');

    const handleAdminLogin = () => {
        window.location.href = '/admin-login';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('join-room', usuario, salaId);
    };

    useEffect(() => {
        socket.on('room-joined', () => {
            window.location.href = '/game';
        });

        return () => {
            socket.off('room-joined');
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
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
                    
                    <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/80 p-2 rounded-lg w-full mb-4">Enviar</button>
                </form>
                
                <button onClick={handleAdminLogin} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded-lg w-full">Ingresar como Admin</button>
            </div>
        </div>
    );
} 