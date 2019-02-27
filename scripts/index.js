import GameController from './gamecontroller.js'
import createCard from './card.js'
const GC = new GameController();

const setupGame = () => {
    updateMoveCount(0);
    stopTimer();
    updateTimer(0);
    GC.resetBoard();  
    // create the game within the controller and return the game object  
    const gameData = GC.createGame(16);
    createCards(gameData);
    populateLeaderboard(GC.getHist());
}

const createCards = (gameData) => {
    const board = document.getElementById('game-board');
    gameData.board.forEach((item, i) => {
        //get a new card div element and set its key, image
        const card = createCard(i, item.value);
        //append the new card to the bard
        board.appendChild(card);
    });
}

// handle game board interactions and update stats
document.getElementById('game-board').addEventListener('click', (evt) => {
    const pick = evt.target;
    // if click is between cards or otherwise just not one of the cards, ignore it
    if(!pick.classList.contains('card')) return;
    // if the same card is currently revealed or is turning back, ignore it
    if(evt.target.getElementsByClassName('card-inner')[0].getAttribute('flipped') === 'true')return;
    // if this card was already matched, ignore it
    if(GC.getCardInfo(evt.target.getAttribute('key')).found) return;

    // if the game has not yet started, attempt to begin a new game (will also start the timer)
    if(!GC.started){
        if(!startGame()){
            
            return null;
        }
    }

    flipCardToBack(pick);
   
    // send selected card to game constroller and check response
    // response includes up to the previous 2 selected non-matching cards (key attribute)
    // the current move count and time elapsed
    // and the result of the current selection: match, noMatch or complete (completed board)

    const response = GC.doPick(pick.getAttribute('key'));
    updateMoveCount(response.moveCount);

    // see if any unmatched cards have not completed their fliptofront animation and flip them back instantly
    // this allows for fast sequential card selection and pushing times lower. only 2 cards should be visible
    // at a given time
    const old = document.querySelectorAll('[flipped="true"]');
    Array.from(old).forEach((el) => {
        const key = el.parentElement.getAttribute('key');
        // check if the current flipped card is actually part of the current match move
        // and check if the current flipped card is one that has already been matched to another
        // in either case, do not flip it back to front
        if(!response.picks.includes(key) && !GC.getCardInfo(key).found){
            // card-transform is animation timing for the card flip. To instantly flip back and allow for 
            // fast card selection, we remove the timing and re-add it.
            el.classList.remove('card-transform', 'show-back');
            setTimeout( () => {
                el.classList.add('card-transform');
                el.setAttribute('flipped', false);
            }, 0);
        }
    });

    // act on the answer reveived from the controller
    switch(response.result) {
        case GameController.result.noCompare:
            // console.log('nothing to compare');
            break;
        case GameController.result.noMatch:
            // a bad match, wait 2 seconds and flip them back to the front
            // this transition may be cut short by a new selection via the above code
            // console.log("no match");
            // response.picks must be deconstructed into a new array or a race condition occurs
            // where a new selection could be populated in the gameData object before the
            // setTimeout callback executes resulting in a new selection flipping to front prematurely
            let nonMatched = [...response.picks];
            setTimeout(() => {
                nonMatched.forEach((key) => {
                    flipCardToFront(document.querySelector(`[key='${key}']`));
                })
            }, 2000);
            break;
        case GameController.result.complete:
            stopTimer();
            populateLeaderboard(GC.getHist());
            break;
        default:
            null;
            // console.log("switch", response);
    }
});

// populate the leaderboard using an object games = {times:[], moveCounts:[]}
const populateLeaderboard = (games) => {
    // create temp arrays that are sorted
    let times = games.times.sort();
    let moveCounts = games.moveCounts.sort();

    // app short arrays to a length of 5
    while(moveCounts.length < 5){
        moveCounts.push("");
    }
    
    while(times.length < 5){
        times.push("");
    }

    // truncate long arrays to 5
    moveCounts.length = 5;
    times.length = 5;

    // create the innerhtml to be used inside the leaderboard charts
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

// after a card has completed a fliptofront transition (incorrect match)
document.getElementById('game-board').addEventListener('transitionend', (evt) => {
    // this is called at the end of either a fliptofront or fliptoback transition 
    // so we check whether the element has show-back
    if(!evt.target.classList.contains('show-back')){
        evt.target.setAttribute('flipped', false);
    }
});

const flipCardToBack = (card) => {
    // show-back is removed at the beginning of the transition to allow the transition to be cut short
    // we use a custom attribute to flag the card as flipped before show-back is added. flipped is set to false
    // either after the transition ends via eventListener or when the animation is cut short
    card.getElementsByClassName('card-inner')[0].setAttribute('flipped', true);
    card.getElementsByClassName('card-inner')[0].classList.add('show-back');
}

// attempt to create a new game in the controller
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
// formatting the milliseconds to MM:ss.mmm
const formatTime = (mils) => {
    const date = new Date(mils);
    return (`${date.getMinutes().toString().padStart(2,0)}` + 
            `:${date.getSeconds().toString().padStart(2,0)}` +
            `.${date.getMilliseconds().toString().padStart(3,0)}`);
}

// call for a new game on refresh click
document.getElementById('refresh-icon').addEventListener('click', (evt) => {
    clearGameBoard();
    setupGame();
});

// delete board cards before remaking the board
const clearGameBoard = () =>{
    const board = document.getElementById('game-board');
    while(board.firstChild){
        board.removeChild(board.firstChild);
    }
}

setupGame();


const overlay = document.getElementById('overlay');

const toggleOverlay = () => {

    overlay.classList.toggle('overlay-expand');
}

overlay.addEventListener('click',toggleOverlay);