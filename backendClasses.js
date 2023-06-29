import {Response} from "./responseTypes.js" 

export class Card {
    value;
    suit;

    constructor(suit, num){
        this.suit = suit;
        this.num = num;
    }
}

class Hand {

    constructor(name, turn){
        this.name = name;
        this.turn = turn;
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

    
    removeCard(card) {
        
        if (this.handArray.indexOf(card) != -1) {
            this.handArray.splice(this.handArray.indexOf(card), 1);
            return true;
            
        } else if (this.faceUp.indexOf(card) != -1) {
            this.handArray.splice(this.faceUp.indexOf(card), 1);
            return true;
            
        } else if (this.faceDown.indexOf(card) != -1) {
            this.handArray.splice(this.faceDown.indexOf(card), 1);
            return true;
        }
        
        return false;
    }
    
    addToHand(card) {
        this.handArray.push(card);
    }

    addToFaceUp(card) {
        this.faceUp.push(card);
    }

    addToFaceDown(card) {
        this.faceDown.push(card);
    }
}

// player's hands, the playpile, the deck, the turn
export class GameState {

    constructor() {
        this.turn = 0;
        this.numTurns = 0;
        this.hands = new Map(); 
        this.deck = new Deck();
        this.playPile = new PlayPile(); 
    }

    // Recalculates the next turn value
    incrementTurn() {
        this.turn = (this.turn + 1) % this.hands.size;
        return this.turn;
    }
    
    // Initialises a specific player's hand with 3 facedown and 5 faceup cards
    initHand(playerName) {

        if (playerName == null) {
            return null;
        }
        
        let cards = {faceDown: [], hand: []};
        let hand = new Hand(playerName, this.numTurns++);
        // facedown cards
        for (let j = 0; j < 3; j++) {
            let chosen = this.deck.draw();
            hand.addToFaceDown();
            cards.faceDown.push(chosen);
        }
        
        // faceup cards
        for (let j = 0; j < 5; j++) {
            let chosen = this.deck.draw();
            hand.addToHand(chosen);
            cards.hand.push(chosen);
        }

        this.hands.set(playerName, hand);
        return cards;
    }

    // Converts a dictionary of the form {suit, num} into a list of cards
    dictToCards(cardsDict) {
        
        let ret = [];
        for (let key of Object.keys(cardsDict)) {
            ret.push(this.deck.allCards[key * 13 + cardsDict[key]]);
        }

        return ret;
    }

    setFaceUp(playerName, cards) {

        let hand = this.hands.get(playerName);
        if (hand == null) {
            return false;
        }

        console.log("faceup: ");
        for (let card of cards) {
            if (hand.removeCard(card)) {
                hand.addToFaceUp(card);
                console.log(card.num + " " + card.suit);
            } else {
                console.log("Ja fucekd up");
                return false;
            }
        }

        return true;
    }

    // Checks if a set of cards is currently playable and plays them if valid. Gives appropriate responses to be interpretted by the client
    playCards(playerName, cards) {

        let playerHand = this.hands.get(playerName);
        if (playerHand.turn != this.turn) {
            return Response.WRONG_TURN;
        }

        // TODO checks for facedown cards to ensure only one is played at the same time? not too sure abt the rules of the game tbh
        for (let card of cards) {
            if (!playerHand.isPlayable(card)) {
                console.log("non playable");
                return Response.INVALID;
            }
        }

        for (let card of cards) {
            if (!this.playPile.validatePlay(card)) {
                console.log("invalid");
                return Response.INVALID;
            }
        }

        let isTen = false;
        for (let card of cards) {
            playerHand.removeCard(card);
            isTen = card.num == 9 || isTen ? true : false; 
        }

        if (isTen) {
            this.playPile.clear();
            return Response.CLEAR_PILE;
        }
        this.playPile.addToPile(cards);
        return Response.VALID;
    }

    // Draws a card and adds it to the player's hand
    drawCard(playerName) {
        
        let card = this.deck.draw();

        if (card == null) {
            return null;
        }

        this.hands.get(playerName).addToHand(card);
        return card
    }

    // TODO only works for hand cards, not faceup/down
    validPlayExists(playerName) {

        console.log(playerName + this.hands.get(playerName).handArray.length);

        let valid = false;
        for (let card of this.hands.get(playerName).handArray) {
            valid = this.playPile.validatePlay(card);
            console.log(card.suit + " " + card.num + " " + valid);
            if (valid) {
                break;
            }
        }

        return valid;
    }

    // Adds the entire playpile to the players hand
    addPileToHand(playerName) {

        for (let card of this.playPile.getPile()) {
            this.hands.get(playerName).handArray.push(card);
        }

        this.playPile.clear();
    }

    // Gets the next player
    nextPlayer() {
        this.incrementTurn();
        for (let hand of this.hands.values()) {
            if (hand.turn == this.turn) {
                return hand.name;
            }
        }

        return null;
    }
}

// Represents the play pile, containing all the cards that have been played since the last pick up
class PlayPile {

    contructor() {
        this.pile = [];
    }

    // Adds a card to the top of the play pile
    addToPile(cards) {

        this.pile = this.pile == null ? [] : this.pile;
        for (let card of cards) {
            this.pile.push(card);
        }
    }

    // Returns the play pile
    getPile() {
        return this.pile;
    }

    // Empties the play pile
    clear() {
        this.pile = [];
    }

    // Checks whether playing a card is valid based on the current state of the pile
    validatePlay(card) {

        
        if (this.pile == null || this.pile.length == 0){
            return true;
        }
        if (card.num == 9 || card.num == 1 || card.num == 2){
            return true;
        }
        
        let compCard = this.pile[this.pile.length - 1];
        console.log("comping: " + compCard.num + " " + compCard.suit + " " + card.num + " " + card.suit);

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

    // Empties the pile
    emptyPile() {
        this.pile = [];
    }
}

// Represents the deck, containing all the cards that have not been played yet
export class Deck {
    
    constructor() {

        this.allCards = [];
        this.drawDeck = [];
        // Creates card objects for the deck
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                let card = new Card(suit, value);
                this.drawDeck.push(card);
                this.allCards.push(card);
            }
        }
        this.shuffleDeck();
    }

    // Shuffles the entire deck
    shuffleDeck(array) {
        for (var i = this.drawDeck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.drawDeck[i];
            this.drawDeck[i] = this.drawDeck[j];
            this.drawDeck[j] = temp;
        }
    }

    // Draws one card from the deck
    draw() {
        return this.drawDeck.pop();
    }
}