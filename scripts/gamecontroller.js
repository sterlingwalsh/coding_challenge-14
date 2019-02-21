class GameController{

    result = {
        noCompare: 0,
        noMatch: 1,
        match: 2,
        complete: 3
    }

    // cardState = {
    //     picked: 0,
    //     found: 1
    // }

    constructor(){
        this.gameHist = {times: [87342, 47332, 65232, 74643],
                        moveCounts: [29, 19, 22, 25]};
        this.gameData = {
                            result: this.result.noCompare,
                            moveCount: 0,
                            time: 0,
                            picks: [],
                            board: []
                        };
        this.startTime = 0;
        this.started = false;
    }

    getHist(){
        const hist = {};
        Object.keys(this.gameHist).forEach((key) => {
            hist[key] = [...this.gameHist[key]];
        });

        return hist;
    }

    start = () => {
        this.startTime = new Date().getTime();
        this.started = true;
        return true;
    }

    resetBoard = () => {
        this.gameData = {
            result: this.result.noCompare,
            moveCount: 0,
            time: 0,
            picks: [],
            board: []
        };
        this.startTime = null;
        this.started = false;
        this.moveCount = 0;
    }

    getCardInfo(key){
        return this.gameData.board[key];
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

        console.log(this.gameData);
        return this.gameData;
    }

    doPick = (key) => {

        let {picks, moveCount, result, time, board} = this.gameData;

        if(picks.length > 1) picks.length = 0;
        picks.push(key);

        if(picks.length < 2){
            result = this.result.noCompare;
        }else if (picks.length === 2){
            moveCount += 1;

            const firstPickVal = board[picks[0]].value;
            const secondVal = board[picks[1]].value;

            if(firstPickVal === secondVal){
                board[picks[0]].found = true;
                board[picks[1]].found = true;

                if(this.checkWin()){
                    result = this.result.complete;
                    time = new Date().getTime() - this.startTime;
                    this.appendGame(moveCount, time);
                }else{
                    result = this.result.match;
                }
            }else if(firstPickVal !== secondVal){
                result = this.result.noMatch;
            }
        }
        this.gameData = Object.assign(this.gameData, {picks, moveCount, result, time, board});
        return this.gameData;
    }

    checkWin = () => {
        const board = this.gameData.board;
        for(let i = 0; i < board.length; i++){
            if(!board[i].found)return false;
        }
        return true;
    }

    appendGame(moveCount, time){
        this.gameHist.times.push(time);
        this.gameHist.moveCounts.push(moveCount);
        console.log(this.gameHist);
    }
}

export default GameController