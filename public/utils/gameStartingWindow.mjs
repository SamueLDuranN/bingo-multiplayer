// Starting window

const playerScreen = document.querySelector("player-screen");
const playerList = document.querySelector(".players > ul");
const playerScreenWrapper = document.querySelector(".player-screen-wrapper");
export const gameStartingWindow = (usersRoom) => {
    let players = usersRoom.players;
    let host = usersRoom.host;
    playerList.innerHTML = "";
    Object.values(players).forEach((player) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        if (player === host.username) {
            li.innerHTML = `${
                Object.values(players).indexOf(player) + 1
            }. ${player}<span class="host">(Dueño de Sala)</span>`;
        } else {
            li.innerHTML = `${
                Object.values(players).indexOf(player) + 1
            }. ${player}`;
        }
        // Append the <li> element to the parent list
        playerList.appendChild(li);
    });
    playerScreenWrapper.style.display = "block";
};