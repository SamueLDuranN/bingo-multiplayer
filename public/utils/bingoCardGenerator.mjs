// Crear un array de números del 1 al 75
let masterArray = Array.from({ length: 75 }, (_, i) => i + 1);

// Función para mezclar un array aleatoriamente
function shuffledArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
    return array;
}

// Función para generar un cartón único
export const generateUniqueBingoGrid = (usedNumbers) => {
    let availableNumbers = masterArray.filter(num => !usedNumbers.has(num)); // Filtrar números no usados
    shuffledArray(availableNumbers); // Mezclar números disponibles

    let cart = availableNumbers.slice(0, 25); // Tomar los primeros 25 números
    let cartNumbers = new Set(cart); // Almacenar los números en uso

    usedNumbers.add(...cartNumbers); // Agregar los números usados al conjunto

    return cart; // Devolver el cartón generado
};

// Función para crear la grilla del cartón
function gridMaker(arr) {
    const gameContainer = document.querySelector(".game");
    gameContainer.innerHTML = `
      <div class="cell-dummy initials">B</div>
      <div class="cell-dummy initials">I</div>
      <div class="cell-dummy initials">N</div>
      <div class="cell-dummy initials">G</div>
      <div class="cell-dummy initials">O</div>
      `; // Limpiar la grilla existente

    for (let i = 0; i < arr.length; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cells");
        cell.textContent = arr[i]; // Rellenar con los datos del cartón
        gameContainer.appendChild(cell);
    }
}

// Función general para generar o reiniciar un cartón de Bingo
export const generateBingoGrid = (usedNumbers) => {
    let cart = generateUniqueBingoGrid(usedNumbers); // Generar un cartón único
    gridMaker(cart); // Crear la grilla en la interfaz
};
