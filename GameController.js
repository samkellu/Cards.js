import {CardTypes} from "./viewClasses.js"
import {Response} from "./responseTypes.js" 

// Handles all events and view elements of the frontend
export class GameController {

    constructor(sock, username, gameView){

        this.ready = false;
        this.sock = sock;
        this.username = username;
        this.gameView = gameView;

        this.hand = [];
        this.faceUp = [];
        this.faceDown = [];
        this.currentSelection = [];
        this.playPile = [];
    }

    // Sets the ready status of the player, informs the server of this change
    setReady() {
        this.ready = true;
            
        this.sock.send(JSON.stringify({
            event: "ready",
            player: this.username
        }),);
    }

    addToFaceDown(card) {
        this.faceDown.push(card);
        this.draw();
    }

    // Adds a card to the hand array, allowing them to be played by the user
    addToHand(card) {

        // Inserts the card into the hand array in increasing order of card number
        card.isHoverable = true;
        card.cardType = CardTypes.HAND;
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].cardNum >= card.cardNum) {
                this.hand.splice(i, 0, card);
                this.draw();
                return;
            }
        }
        this.hand.push(card);
        this.draw();
    }

    // Adds a card to the playpile to be displayed
    addToPlayPile(card) {
        card.isHoverable = false;
        this.playPile.push(card);
        this.draw();
    }

    // Adds a given card to the current selection and verifies if it is valid, clears selection if not.
    addToSelection(card) {

        // ensures that the selected card isnt already in the selection
        if (this.currentSelection.includes(card)) {
            return;
        }

        // Checks validity of taking the different types of cards, based on gamestate
        switch (card.cardType) {
            case CardTypes.HAND:
                if (this.currentSelection.length != 0 && card.cardNum != this.currentSelection[0].cardNum) {
                    this.emptySelection();
                }
                this.hand.splice(this.hand.indexOf(card), 1);
                break;
                
            case CardTypes.FACEUP:
                if (this.hand.length != 0) {
                    return;
                }
                
                if (this.currentSelection.length > 0) {
                    for (let testCard of this.currentSelection) {
                        if (testCard.cardType == CardTypes.HAND) {
                            return;
                        }
                    }
                }
                    
                this.emptySelection();
                this.faceUp.splice(this.faceUp.indexOf(card), 1);
                break;
        }
            
        card.isHoverable = false;
        this.currentSelection.push(card);
        this.draw();
    }

    // Returns an individual card from the selection to the player's hand/faceup pile based on original location
    removeFromSelection(card) {
        
        let index = this.currentSelection.indexOf(card);

        if (index == -1) {
            return;
        }

        switch (card.cardType) {
            case CardTypes.HAND:
                this.addToHand(card);
                break;

            case CardTypes.FACEUP:
                card.isHoverable = true;
                this.faceUp.push(card);
                break;
        }

        this.currentSelection.splice(index, 1);
    }

    // Removes all cards from the current selection and adds them back to the player's hand
    emptySelection() {

        for (let i = 0; i < this.currentSelection.length; i++) {
            let card = this.currentSelection[i];
            this.removeFromSelection(card);
        }

        if (this.hand.length == 0) {
            for (let card of this.faceUp) {
                card.isHoverable = true;
            }
        } else {
            for (let card of this.faceUp) {
                card.isHoverable = false;
            }
        }
    }

    // Handles the different behaviours of cards when clicked 
    handleClick(card){

        // Handles the players initial choice of three face up cards
        if (this.ready == false){
            // Clicked card is in the faceUp array, and should be moved to the hand
            if (card.cardType == CardTypes.FACEUP) {
                if (this.faceUp.length == 3) {
                    this.gameView.removeReadyButton();
                }
                
                this.faceUp.splice(this.faceUp.indexOf(card), 1);
                this.addToHand(card);
                
                // Clicked card is in the hand and should be moved into the faceUp array
            } else {
                if (this.faceUp.length < 3) {
                    
                    this.hand.splice(this.hand.indexOf(card), 1);
                    card.cardType = CardTypes.FACEUP;
                    this.faceUp.push(card);
                }

                if (this.faceUp.length == 3){
                    this.gameView.makeReadyButton(this);
                }
            }
            
        // Handles the general case of selecting a card to play
        } else {
            if (this.currentSelection.indexOf(card) != -1) {
                // Removes a card from the current selection
                this.removeFromSelection(card);
            } else {
                // Adds a card to the current list of cards to be played
                this.addToSelection(card);
            }
        }

        this.draw();
    }

    // Requests the server to validate the player playing their current selection of cards
    makeValidateRequest() {

        // Assured that an empty selection is invalid without server verification
        if (this.currentSelection.length == 0) {
            this.handleValidateResponse(Response.INVALID);
        }

        // Creates a dictionary representation of the selection to be sent to the server
        let cards = {};
        for (let card of this.currentSelection) {
            cards[card.suit] = card.cardNum;
        }

        this.sock.send(JSON.stringify({
            event: "playCards",
            cards: cards,
        }),);
    }

    // Handles the various card validation responsed from the server
    handleValidateResponse(response) {


        if (response == Response.INVALID) {

            // Adds all cards in the selection back to your hand
            this.emptySelection();
            // TODO - Add a case for when you have no valid plays possible
            this.gameView.setInstructionText("Invalid play... Try again");

        } else if (response == Response.VALID) {

            // Removes sprites from the current selection, doesnt add them back to the player's hand
            for (let i = 0; i < this.currentSelection.length; i++) {
                this.currentSelection[i].sprite.remove();
            }
            
        // Shouldnt be reachable, as the button only exists when it is the player's turn, added due to desync errors
        } else if (response == Response.WRONG_TURN) {

            // Adds all cards in the selection back to your hand
            this.emptySelection();
            this.gameView.setInstructionText("Not your turn...");
        }

        if (this.hand.length == 0) {
            for (let card of this.faceUp) {
                card.isHoverable = true;
            }
        } else {
            for (let card of this.faceUp) {
                card.isHoverable = false;
            }
        }
        this.currentSelection = [];
        this.draw();
    }

    // Draws each of the different sets of cards in their required locations
    draw() {

        // Draws the play pile
        let topPileSet = [];
        for (let i = this.playPile.length - 1; i >= 0; i++) {
            if (i == this.playPile.length - 1 || this.playPile[i] == topPileSet[topPileSet.length - 1]) {
                topPileSet.push(this.playPile[i]);
            } else {
                break;
            }
        }

        // Draws the players hand and selected cards
        this.gameView.draw(topPileSet, this.hand, this.faceUp, this.currentSelection, this.faceDown);
    }
}
