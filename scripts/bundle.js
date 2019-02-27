// Purpose: Game functionality split between core logic in game controller and visual/UI in index.js. 
// index.js should directly change NOTHING in the gameData object or any other fields in the controller
// On actions by the player, the actions are passed to the controller and a new gameData object is returned
// to the UI. this should allow for the core logic of the controller to later be moved to a server
// and allow for various multiplayer modes
alert('bundle');
class GameController{

    // basic states the game can be in after a given move
    static result = {
        noCompare: 0,
        noMatch: 1,
        match: 2,
        complete: 3
    }

    static GAME_HIST = 'game_history';

    constructor(){
        alert('createController');
        // The main game controlling object 
        this.gameData = {
                            // result after a given move
                            result: GameController.result.noCompare,
                            // total moves this game. 2 sections = 1 comparison made = 1 move
                            moveCount: 0,
                            // time elapsed during current game in millis
                            time: 0,
                            // array of key attributes of the picks somce the last completed comparison
                            // a completed comparison is 2 cards chosen, that is, since the last completed move
                            picks: [],
                            // card data. each array item is an object holding the value of the value of the card
                            // (see card.js for value info), and whether or not this card has been successfully
                            // matched to its partner. the index in this array corresponds to 
                            // the key attribute of the card (see card.js)
                            board: []
                        };
        this.startTime = 0;
        this.started = false;
    }

    updateHist(moveCount, time){
        const gameHist = this.getHist();
        gameHist.moveCounts.push(moveCount);
        gameHist.times.push(time);
        window.localStorage.setItem(GameController.GAME_HIST, JSON.stringify(gameHist));
    }

    getHist(){
        // returns a new object containing the historical game scores
        const storage = window.localStorage;
        const gameHist = JSON.parse(storage.getItem(GameController.GAME_HIST));
        if(gameHist){
            return gameHist;
        }else{
            return {moveCounts: [], times:[]};
        }        
    }

    // record the start time for a new game. return value should never be false in this case, but is 
    // added in case some future situation requires a check to be made
    start = () => {
        this.startTime = new Date().getTime();
        this.started = true;
        return true;
    }

    // restore the game to a known starting position. This does NOT start a new game
    resetBoard = () => {
        this.gameData = {
            result: GameController.result.noCompare,
            moveCount: 0,
            time: 0,
            picks: [],
            board: []
        };
        this.startTime = null;
        this.started = false;
        this.moveCount = 0;
    }

    // convenience function returning the current data about a given card. used to test for found=true
    getCardInfo(key){
        return {...this.gameData.board[key]};
    }

    createGame = (count = 16) => {
        
        // a little randomization for the robots
        const rnd = Math.floor(Math.random() * 100);
        // initialize board data size
        const board = new Array(count);
        // list of potential values for each card
        let vals = new Array(count).fill().map((x, i) => (Math.floor(i/2) + rnd));
        
        for(let i = 0; i < count; i++){
            //set up board data
            board[i] = {
                //randomly assign and remove values from the temp array
                value:vals.splice(Math.floor(Math.random() * Math.floor(vals.length)), 1)[0],
                found:false
            }
        }

        this.gameData.board = board;

        // console.log(this.gameData);
        return this.gameData;
    }

    doPick = (key) => {

        // desonstruct the gameData object for convenience
        let {picks, moveCount, result, time, board} = this.gameData;

        // if the number of picks is > 1 (should never be more than 2), a comparison was recently done
        // and should have been handled by the front end after the previous selection. As a new comparison 
        // is beginning, clear the picks array
        if(picks.length > 1) picks.length = 0;
        // add the new selection 
        picks.push(key);

        // if the new selection is the only item currently picked, there is nothing to compare
        if(picks.length < 2){
            // set the result to noCompare and skip to restructuring the gameData object
            result = GameController.result.noCompare;
        // If there are now 2 selections made, a comparison must be done
        }else if (picks.length === 2){
            // add this move to the counter
            moveCount += 1;
            // the keys are used to convey which card has been selected (those are unique), 
            // get the values associated with those cards (pairs) from the gameData object
            const firstPickVal = board[picks[0]].value;
            const secondVal = board[picks[1]].value;
            // test if theres a match
            if(firstPickVal === secondVal){
                // if matched, those cards have been found
                board[picks[0]].found = true;
                board[picks[1]].found = true;
                // test if now all cards have been successfully matched
                if(this.checkWin()){
                    // mark the game state as complete
                    result = GameController.result.complete;
                    // record the total time taken
                    time = new Date().getTime() - this.startTime;
                    // add this game to the history
                    this.updateHist(moveCount, time);
                }else{
                    // if the game isnt complete, jsut return that a new match had been found
                    // this will also still return the 2 chosen cards.
                    result = GameController.result.match;
                }
            }else if(firstPickVal !== secondVal){
                // if this was not a new match, return noMatch
                // this will also return the 2 chosen cards so that they can be flippedToFront
                result = GameController.result.noMatch;
            }
        }
        // reconstruct a new gameData object from the updates
        this.gameData = Object.assign(this.gameData, {picks, moveCount, result, time, board});
        // return the full state of the game
        return this.gameData;
    }

    // Determine whether all cards have been successfully matched by checking the found property in the gameData
    checkWin = () => {
        const board = this.gameData.board;
        for(let i = 0; i < board.length; i++){
            // if ANY are currently not found, immediately return false
            if(!board[i].found)return false;
        }
        return true;
    }
}






const cardDiv =`<div class='card metal linear metal-border flex-fill metal-clicky'>
                    <div class='card-inner match-parent grow-1 card-transform'>
                        <div class='card-front card-side match-parent flex-r-cntr metal linear-small'><p>?</p></div>
                        <div class='card-back card-side match-parent flex-fill metal linear-small'>
                            <div class='card-image mg-1 grow-1'></div>
                        </div>
                    </div>
                </div>`;

// create a card with a key attribute matching its index in the gameData.board array and
// a value matching the image being pulled from the robohash api
// the value is stored in the gamedata.board array and used for match comparisons
const createCard = (key, value) => {
    const card = stringToElement(cardDiv);
    card.setAttribute('key', key);
    card.getElementsByClassName('card-image')[0].style.backgroundImage = `url('https://robohash.org/${value}')`;
    return card;
}

// take a valid html string and convert it to nodes
const stringToElement = (html) => {
    const template = document.createElement('template')
    template.innerHTML = html;
    return template.content.childNodes[0];
}










alert('index top');

alert('start Index');
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
            alert("error setting up game");
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


