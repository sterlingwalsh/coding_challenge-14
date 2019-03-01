// Purpose: Game functionality split between core logic in game controller and visual/UI in index.js. 
// index.js should directly change NOTHING in the gameData object or any other fields in the controller
// On actions by the player, the actions are passed to the controller and a new gameData object is returned
// to the UI. this should allow for the core logic of the controller to later be moved to a server
// and allow for various multiplayer modes

class GameController{

    constructor(){
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

    // add a game to the stored game history 
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
    start(){
        this.startTime = new Date().getTime();
        this.started = true;
        return true;
    }

    // restore the game to a known starting position. This does NOT start a new game
    resetBoard(){
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

    createGame(count = 16){
        
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

    doPick(key){

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
    checkWin(){
        const board = this.gameData.board;
        for(let i = 0; i < board.length; i++){
            // if ANY are currently not found, immediately return false
            if(!board[i].found)return false;
        }
        return true;
    }
}

// basic states the game can be in after a given move
GameController.result = {
    noCompare: 0,
    noMatch: 1,
    match: 2,
    complete: 3
}

// set class variables
GameController.GAME_HIST = 'game_history';

export default GameController