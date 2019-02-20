import GameController from './gamecontroller.js'

const GC = new GameController();

const setupGame = () => {
    const board = document.getElementById('game-board');
    updateMoveCount(0);
    stopTimer();
    updateTimer(0);
    GC.resetBoard(board);    
    Array.from(document.getElementsByClassName('card')).forEach((card) => {flipCardToFront(card)});
    GC.createGameBoard(16, board);
    populateLeaderboard(GC.getHist());
}

// handle game board interactions and update stats
document.getElementById('game-board').addEventListener('click', (evt) => {
    const pick = evt.target;
    // if click is between cards or otherwise just not one of the cards, ignore it
    if(!pick.classList.contains('card')) return;
    // if the same card is currently revealed or is turning back, ignore it
    if(evt.target.getElementsByClassName('card-inner')[0].getAttribute('flipped') === 'true')return;
    // if this card was already matched, ignore it
    if(GC.boardData[evt.target.getAttribute('key')].found) return;

    // if the game has not yet started, attempt to begin a new game (will also start the timer)
    if(!GC.started){
        if(!startGame()){
            alert("error setting up game");
            return null;
        }
    }

    flipCardToBack(pick);
   
    // send selected card to game constroller and check response
    // response includes up to the previous 2 selected non-matching cards 
    // and the result of the current selection: match, noMatch or complete (completed board)

    const response = GC.doPick(pick);
    updateMoveCount(response.moveCount);

    switch(response.answer) {
        case GC.result.noMatch:
            setTimeout(() => (response.items.forEach((item) => {flipCardToFront(item)})), 2000);
            break;
        case GC.result.complete:
            stopTimer();
            populateLeaderboard(GC.getHist());
            break;
    }
});

const populateLeaderboard = (games) => {
    let times = games.times.sort();
    let moveCounts = games.moveCounts.sort();

    while(moveCounts.length < 5){
        moveCounts.push("");
    }
    
    while(times.length < 5){
        times.push("");
    }

    moveCounts.length = 5;
    times.length = 5;

    let time = '';
    let moves = '';
    times.forEach((t, i) => {
        time += `<p>${i+1}. ${(t === "") ? "" : formatTime(t)}</p>`;
    });
    moveCounts.forEach((m, i) => {
        moves += `<p>${i+1}. ${m}</p>`;
    });
    document.getElementById('leader-time').innerHTML = time;
    document.getElementById('leader-moves').innerHTML = moves;
}

const updateMoveCount = (count) => {
    document.getElementById('move-count').textContent = count;
}

const flipCardToFront = (card) => {
    card.getElementsByClassName('card-inner')[0].classList.remove('show-back');
}

const flipCardToBack = (card) => {
    console.log(card);
    card.getElementsByClassName('card-inner')[0].setAttribute('flipped', true);
    card.getElementsByClassName('card-inner')[0].classList.add('show-back');
}

const startGame = () => {

    if(GC.start()){
        startTimer();
        return true;
    }else{
        return false;
    }
}

// clock controls
const clock = document.getElementById('clock');
let timerInterval = null;

const startTimer = () => {
    timerInterval = setInterval(() => {   
        updateTimer(new Date().getTime() - GC.startTime);
    }, 77);
}

// clear the interval and update the text based on the actual time of the game ending
const stopTimer = () => {
    try{
        clearInterval(timerInterval);
        updateTimer(new Date().getTime() - GC.startTime);
    } catch (e){
        console.log(e);
    }
}
// pull current time, format the difference between game start
const updateTimer = (mils) => {
    clock.textContent = formatTime(mils);
}
// formatting the date to MM:ss.mmm
const formatTime = (mils) => {
    const date = new Date(mils);
    return (`${date.getMinutes().toString().padStart(2,0)}` + 
            `:${date.getSeconds().toString().padStart(2,0)}` +
            `.${date.getMilliseconds().toString().padStart(3,0)}`);
}

document.getElementById('refresh-icon').addEventListener('click', (evt) => {
    // evt.target.classList.add('refresh-icon-spin')
    setupGame();
});

document.getElementById('game-board').addEventListener('transitionend', (evt) => {
    if(!evt.target.classList.contains('show-back')){
        evt.target.setAttribute('flipped', false);
    }
});

setupGame();