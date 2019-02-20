import createCard from './card.js'


class GameController{

    result = {
        noCompare: 0,
        noMatch: 1,
        match: 2,
        complete: 3
    }

    constructor(){
        this.gameHist = {times: [87342, 47332, 65232, 74643],
                        moveCounts: [29, 19, 22, 25]};
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

    resetBoard = (board) => {
        while(board.hasChildNodes()) board.removeChild(board.firstChild);
        this.boardData = [];
        this.firstPick = null;
        this.startTime = null;
        this.started = false;
        this.moveCount = 0;
    }

    createGameBoard = (count = 16, board) => {
        
        // a little randomization for the robots
        const rnd = Math.random();
        // initialize board data size
        this.boardData.length = count;
        // list of potential values for each card
        let vals = new Array(count).fill().map((x, i) => (Math.floor(i/2) + rnd));
        
        for(let i = 0; i < count; i++){
            //set up board data
            this.boardData[i] = {
                //randomly assign and remove values from the temp array
                value:vals.splice(Math.floor(Math.random() * Math.floor(vals.length)), 1)[0],
                found:false
            }
            //get a new card div element and set its key, image
            const card = createCard(i, this.boardData[i].value);

            //append the new card to the bard
            board.appendChild(card);
        }

        console.log(this.boardData);
    }

    doPick = (el) => {
        let returnData = {
            answer:-1,
            items:[el, this.firstPick],
            moveCount: this.moveCount,
            time: 0,
        }
        if(!this.firstPick){
            this.firstPick = el;
            returnData.answer = this.result.noCompare;
        }else if (this.firstPick){
            returnData.moveCount = ++this.moveCount;
            const firstKey = this.firstPick.getAttribute('key');
            const secondKey = el.getAttribute('key');

            const firstPickVal = this.boardData[firstKey].value;
            const secondVal = this.boardData[secondKey].value;

            if(firstPickVal === secondVal){
                this.boardData[firstKey].found = true;
                this.boardData[secondKey].found = true;
                if(this.checkWin()){
                    returnData.answer = this.result.complete;
                    returnData.time = new Date().getTime() - this.startTime;
                    this.appendGame(returnData.moveCount, returnData.time);
                }else{
                    this.boardData[firstKey].found = true;
                    this.boardData[secondKey].found = true;
                    returnData.answer = this.result.match;
                }
            }else if(firstPickVal !== secondVal){
                returnData.answer = this.result.noMatch;
            } 
            this.firstPick = null;
        }
        return returnData;
    }

    checkWin = () => {
        for(let i = 0; i < this.boardData.length; i++){
            if(!this.boardData[i].found)return false;
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