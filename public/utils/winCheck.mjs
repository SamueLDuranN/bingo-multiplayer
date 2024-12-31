import { popup } from "../helper/popup.mjs";

export const winCheck = (cells, cross, interval, username, roomId, socket) => {
    let win = true; // Asumimos que todas las casillas están llenas inicialmente

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].textContent !== cross) {
            win = false; // Si encontramos una casilla sin el símbolo del jugador, no gana
            break;
        }
    }

    if (win) {
        clearInterval(interval); // Detenemos cualquier temporizador
        popup(username, "¡Ha llenado todo el cartón y ganado el juego!");
        socket.emit("win", username, roomId); // Notificamos al servidor que el usuario ganó
    }
};
