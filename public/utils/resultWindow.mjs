const inGamePlayersList = document.querySelector(".inGamePlayers-list > ul");
const winnersList = document.querySelector(".winners-list > ul");
const losersList = document.querySelector(".losers-list > ul");

const displayInGamePlayers = (usersRoom) => {
    let inGamePlayers = usersRoom.inGamePlayers;
    let host = usersRoom.host;
    inGamePlayersList.innerHTML = "";
    Object.values(inGamePlayers).forEach((inGamePlayer) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        if (inGamePlayer === host.username) {
            li.innerHTML = `${
                Object.values(inGamePlayers).indexOf(inGamePlayer) + 1
            }. ${inGamePlayer}<span class="host">(Host)</span>`;
        } else {
            li.innerHTML = `${
                Object.values(inGamePlayers).indexOf(inGamePlayer) + 1
            }. ${inGamePlayer}`;
        }
        // Append the <li> element to the parent list
        inGamePlayersList.appendChild(li);
    });
};

const displayWinnersList = (usersRoom) => {
    let winners = usersRoom.winners;
    if (winners.length === 0) return;
    let host = usersRoom.host;
    winnersList.innerHTML = "";
    Object.values(winners).forEach((winner) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        if (winner === host.username) {
            li.innerHTML = `${
                Object.values(winners).indexOf(winner) + 1
            }. <span class="winner">${winner}</span><span class="host">(Host)</span>`;
        } else {
            li.innerHTML = `${
                Object.values(winners).indexOf(winner) + 1
            }. <span class="winner">${winner}</span>`;
        }
        // Append the <li> element to the parent list
        winnersList.appendChild(li);
    });
};

const displayLosserList = (usersRoom) => {
    let lossers = usersRoom.lossers;
    if (lossers.length === 0) return;
    let host = usersRoom.host;
    losersList.innerHTML = "";
    Object.values(lossers).forEach((losser) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        if (losser === host.username) {
            li.innerHTML = `${
                Object.values(lossers).indexOf(losser) + 1
            }. <span class="losser">${losser}</span><span class="host">(Host)</span>`;
        } else {
            li.innerHTML = `${
                Object.values(lossers).indexOf(losser) + 1
            }. <span class="winner">${losser}</span>`;
        }
        // Append the <li> element to the parent list
        losersList.appendChild(li);
    });
};

export const displayResultWindow = (usersRoom) => {
    displayInGamePlayers(usersRoom);
    displayWinnersList(usersRoom);
    displayLosserList(usersRoom);
};