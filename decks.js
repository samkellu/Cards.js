import { CardData } from "./cardData.js";

export class Decks {
    
    constructor() {

        this.playDeck = [];
        
        this.drawDeck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                this.drawDeck.push(new CardData(suit, value));
            }
        }
    }

    draw() {
        return this.drawDeck.pop(Math.floor(Math.random() * this.drawDeck.length));    
    }

    play(card) {
        this.playDeck.push()
    }

    clearPlayDeck() {
        this.drawDeck = [];
    }

}