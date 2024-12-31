import React, { useState } from 'react';

export default function LoginWidget() {
    const [usuario, setUsuario] = useState('');
    const [salaId, setSalaId] = useState('');

    const handleAdminLogin = () => {
        window.location.href = '/admin-login'; // Cambia esto a la URL del login de admin
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes agregar la lógica para manejar el inicio de sesión
        console.log('Usuario:', usuario);
        console.log('Sala ID:', salaId);
        // Emitir evento para unirse a la sala, si es necesario
    };

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