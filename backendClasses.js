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

export class DecksBack {
    
    constructor() {

        this.playDeck = [];
        
        this.drawDeck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                this.drawDeck.push(new CardBack(suit, value));
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck(array) {
        for (var i = this.drawDeck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.drawDeck[i];
            this.drawDeck[i] = this.drawDeck[j];
            this.drawDeck[j] = temp;
        }
    }

    draw() {
        return this.drawDeck.pop();
    }

    play(card) {
        this.playDeck.push(card);
    }

    clearPlayDeck() {
        this.drawDeck = [];
    }

}