const inGamePlayersList = document.querySelector(".inGamePlayers-list > ul");
const winnersList = document.querySelector(".winners-list > ul");
const losersList = document.querySelector(".losers-list > ul");

const displayInGamePlayers = (usersRoom) => {
    let inGamePlayers = usersRoom.inGamePlayers;
    let host = usersRoom.host;
    inGamePlayersList.innerHTML = "";
    Object.values(inGamePlayers).forEach((inGamePlayer) => {
        // Crear un nuevo <li> para cada jugador
        let li = document.createElement("li");
        li.innerHTML = `${inGamePlayer.username} - Progreso: ${inGamePlayer.progress}%`; // Muestra el progreso
        if (inGamePlayer === host.username) {
            li.innerHTML += `<span class="host">(Host)</span>`;
        }
        inGamePlayersList.appendChild(li);
    });
};

const displayWinnersList = (usersRoom) => {
    winnersList.innerHTML = ""; // Limpiar la lista de ganadores
    let winner = usersRoom.winner; // Suponiendo que tienes un campo 'winner' en usersRoom
    if (winner) {
        let li = document.createElement("li");
        li.innerHTML = `${winner.username} - Ganador! 🎉`;
        winnersList.appendChild(li);
    }
};

const displayLosserList = (usersRoom) => {
    losersList.innerHTML = ""; // Limpiar la lista de perdedores
    let loser = usersRoom.loser; // Suponiendo que tienes un campo 'loser' en usersRoom
    if (loser) {
        let li = document.createElement("li");
        li.innerHTML = `${loser.username} - Perdedor 😢`;
        losersList.appendChild(li);
    }
};

export const displayResultWindow = (usersRoom) => {
    displayInGamePlayers(usersRoom);
    displayWinnersList(usersRoom);
    displayLosserList(usersRoom);
};
