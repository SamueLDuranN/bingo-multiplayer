import React from 'react';

export default function Widget() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-4">Registrate</h2>
        <label className="block text-muted-foreground mb-1" htmlFor="usuario">USUARIO:</label>
        <input type="text" id="usuario" placeholder="Ingresa Usuario" className="border border-border rounded-lg p-2 w-full mb-4" />
        
        <label className="block text-muted-foreground mb-1" htmlFor="sala-id">SALA ID:</label>
        <input type="text" id="sala-id" placeholder="Ingresa ID Sala" className="border border-border rounded-lg p-2 w-full mb-4" />
        
        <button className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-lg shadow-md">Ingresar</button>
        
        <button id="admin-login" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded-lg w-full">Ingresar como Admin</button>
      </div>
    </div>
  );
} 