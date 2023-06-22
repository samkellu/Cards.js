export const Response = {
    INVALID: 0,
    WRONG_TURN: 1,
    VALID: 2,
};

export class Card {
    value;
    suit;

    constructor(suit, num){
        this.suit = suit;
        this.num = num;
    }
}

export class Hand {

    constructor(name){
        this.name = name;
        this.handArray = [];
        this.faceDown = [];
        this.faceUp = [];
    }

    isPlayable(card) {
        
        let index = -1;
        if (this.handArray.length > 0) {
            index = this.handArray.indexOf(card);
            
        } else if (this.faceUp.length > 0) {
            index = this.faceUp.indexOf(card);

        } else if (this.faceDown.length > 0) {
            index = this.faceDown.indexOf(card);
        }

        return index != -1;
    }

    addToHand(card) {
        this.handArray.push(card);
    }

    removeCard(card) {
        
        if (this.handArray.indexOf(card) != -1) {
            this.handArray.slice(this.handArray.indexOf(card), 1);
            return true;

        } else if (this.faceUp.indexOf(card) != -1) {
            this.handArray.slice(this.faceUp.indexOf(card), 1);
            return true;

        } else if (this.faceDown.indexOf(card) != -1) {
            this.handArray.slice(this.faceDown.indexOf(card), 1);
            return true;

        }
        return false;
    }

    addToFaceDown(card) {
        this.faceDown.push(card);
    }
}

// player's hands, the playpile, the deck, the turn
export class GameState {

    constructor() {
        this.turn = 0;
        this.hands = []; 
        this.deck = new Deck();
        this.playPile = new PlayPile(); 
    }
    
    initHand(playerName) {

        if (playerName == null) {
            return null;
        }
        
        let cards = {faceDown: [], hand: []};
        let hand = new Hand(playerName);
        for (let j = 0; j < 3; j++) {
            let chosen = this.deck.draw();
            hand.addToFaceDown();
            cards.faceDown.push(chosen);
        }
        
        for (let j = 0; j < 5; j++) {
            let chosen = this.deck.draw();
            hand.addToHand(chosen);
            cards.hand.push(chosen);
        }

        this.hands.push(hand);
        return cards;
    }

    playCards(player, cards) {

        if (this.hands[turn].name != player) {
            return Response.WRONG_TURN;
        }

        // TODO checks for facedown cards to ensure only one is played at the same time? not too sure abt the rules of the game tbh
        for (let card of cards) {
            if (!this.hand.isPlayable(card)) {
                return Response.INVALID;
            }
        }

        for (let card of cards) {
            if (!this.playPile.validatePlay(card)) {
                return Response.INVALID;
            }
        }

        for (let card of cards) {
            this.hand.removeCard;
        }

        return Response.VALID;
    }
}

export class PlayPile {

    contructor() {
        this.pile = [];
    }

    addToPile(cards) {
        for (let card of cards) {
            this.pile.push(card);
        }
    }

    getPile() {
        return this.pile;
    }

    validatePlay(card) {

        if (this.pile.length == 0){
            return true;
        }
        if (card.num == 9 || card.num == 1 || card.num == 2){
            return true;
        }

        let compCard = this.pile.slice(-1);

        if (compCard.num == 2){

            for (let i = this.pile.length - 2; i >= 0; i--) {
                if (this.pile[i].num != compCard.num) {
                    compCard = this.pile[i];
                    break;
                }
            }
            return true;
        }

        if (compCard.num == 6){
            if (card.num <= 6 && card.num != 0){
                return true;
            }
            return false;
        }
        if (compCard.num == 9 || compCard.num == 1){
            return true;
        }
        if (compCard.num == 0){
            return false;
        }
        if (card.num == 0){
            return true;
        } else {
            return card.num >= compCard.num;
        }
    }

    emptyPile() {
        this.pile = [];
    }
}

export class Deck {
    
    constructor() {

        this.drawDeck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                this.drawDeck.push(new Card(suit, value));
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
}