export class CardBack {
    value;
    suit;

    constructor(suit, num){
        this.suit = suit;
        this.num = num;
    }
}


export class HandBack {

    constructor(){
        this.handArray = [];
        this.faceDown = [];
        this.faceUp = [];
    }

    addToHand(card) {
        this.handArray.push(card);
    }
}