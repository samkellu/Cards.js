import { CardBack } from "./cardBack.js";

export class Decks {
    
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
        this.playDeck.push()
    }

    clearPlayDeck() {
        this.drawDeck = [];
    }

}