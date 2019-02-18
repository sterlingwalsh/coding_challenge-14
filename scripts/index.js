import createCard from './card.js'

let boardData = [];
const defaultCardData = {
    value:null,
    revealed:false
};

const createGameBoard = (count = 16) => {
    const board = document.getElementById('game-board');

    // create card elements to fill the game board and register them in the board data object
    for (let i = 0; i < count; i++){
        board.appendChild(createCard(i));
    }

    boardData = new Array(count).fill(defaultCardData);


    // randomize the values of the cards in the board data object using a temp arrays to avoid unecessary checks

    let vals = new Array(count).fill().map((x, i) => Math.floor(i/2));

    Object.keys(boardData).forEach((val) => {
        boardData[val].value = vals.splice(Math.floor(Math.random() * Math.floor(vals.length)), 1)[0];
    })

    console.log(boardData);
}

createGameBoard();