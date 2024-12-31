const inGamePlayersList = document.querySelector(".inGamePlayers-list > ul");
const winnersList = document.querySelector(".winners-list > ul");
const losersList = document.querySelector(".losers-list > ul");

const displayInGamePlayers = (usersRoom) => {
    let inGamePlayers = usersRoom.inGamePlayers;
    let host = usersRoom.host;
    inGamePlayersList.innerHTML = "";
    Object.values(inGamePlayers).forEach((inGamePlayer, index) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        li.innerHTML = `${index + 1}. ${inGamePlayer}${inGamePlayer === host.username ? '<span class="host">(Host)</span>' : ''}`;
        
        // Append the <li> element to the parent list
        inGamePlayersList.appendChild(li);
    });
};

const displayWinnersList = (usersRoom) => {
    let winners = usersRoom.winners;
    if (Object.keys(winners).length === 0) return;
    let host = usersRoom.host;
    winnersList.innerHTML = "";
    Object.values(winners).forEach((winner, index) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        li.innerHTML = `${index + 1}. <span class="winner">${winner}</span>${winner === host.username ? '<span class="host">(Host)</span>' : ''}`;
        
        // Append the <li> element to the parent list
        winnersList.appendChild(li);
    });
};

const displayLosserList = (usersRoom) => {
    let lossers = usersRoom.lossers;
    if (Object.keys(lossers).length === 0) return;
    let host = usersRoom.host;
    losersList.innerHTML = "";
    Object.values(lossers).forEach((losser, index) => {
        // Create a new <li> element
        let li = document.createElement("li");

        // Set the text content of the <li> element
        li.innerHTML = `${index + 1}. <span class="losser">${losser}</span>${losser === host.username ? '<span class="host">(Host)</span>' : ''}`;
        
        // Append the <li> element to the parent list
        losersList.appendChild(li);
    });
};

export const displayResultWindow = (usersRoom) => {
    displayInGamePlayers(usersRoom);
    displayWinnersList(usersRoom);
    displayLosserList(usersRoom);
};