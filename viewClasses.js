import {Two} from "./two.js"

export const CardTypes = {
    FACEUP: 0,
    FACEDOWN: 1,
    HAND: 2
};

// A representation of a card and its data to be displayed in the frontend
export class CardView {
    width;
    height;
    cardNum;
    suit;
    rect;
    sprite;
    cardType;

    constructor(suitNum, cardNum, canvas, cardType){

        this.cardNum = cardNum;
        this.suit = suitNum;
        this.cardType = cardType;

        // Initialising card texture
        var image = new Image(60, 96);
        image.src = "./cardSprites/" + ["heart", "diamond", "club", "spade"][suitNum] + cardNum + ".png";
        this.width = image.width;
        this.height = image.height;
        var texture = new Two.Texture(image);
        this.sprite = new Two.Sprite(texture);
        canvas.add(this.sprite);

        this.isHoverable = true;
    }

    // Draws the card at a given position
    draw(x, y) {
        this.sprite.translation.set(x, y);
    }

    // Removes the card from the canvas
    destroy() {
        this.sprite.remove();
    }
}

// A visual representation of the player's hand, including the face down/up cards and 
// the cards to be played
export class HandView {

    canvas;
    faceDown;
    handArray;
    ready;
    readyBtn;
    playCardBtn;
    sock;
    username;
    numFaceUp;
    numHand;

    constructor(canvas, sock, username){

        this.canvas = canvas;
        this.ready = false;
        this.readyBtn = null;
        this.playCardBtn = null;
        this.sock = sock;
        this.username = username;
        this.numFaceUp = 0;
        this.numHand = 0;

        // Initialises the facedown cards' textures
        this.faceDown = []
        for (let i = 0; i < 3; i++){

            let image = new Image(60, 96);
            image.src = "./cardSprites/blank1.png";
            let texture = new Two.Texture(image)
            let sprite = new Two.Sprite(texture);
            this.faceDown.push(sprite);
            this.canvas.add(sprite);
        }

        this.handArray = [];
        this.currentSelection = [];

        // Absolute y positions for each set of displayed cards 
        this.handArrayYPos = this.canvas.height - 60;
        this.faceUpYPos = this.canvas.height - 200;
        this.faceDownYPos = this.canvas.height - 210;
        this.currentSelectionYPos = this.canvas.height - 200;
    }

    // Adds a generic hover and click listener to a card
    addListeners(card) {

        this.canvas.update();

        card.sprite.renderer.elem.addEventListener('click', (e) => {
    
            card.isHoverable = false;
            let successfulHandle = this.handleClick(card);
            this.draw();
    
        });
    
        // Moves the card when hovered over
        card.sprite.renderer.elem.addEventListener('mouseover', (e) => {
    
            if (card.isHoverable) {
                card.draw(card.sprite.translation.x, card.sprite.translation.y - 30);
                this.canvas.update();
            }
        });
    
        // Returns the card to its regular position after being hovered over
        card.sprite.renderer.elem.addEventListener('mouseout', (e) => {
            
            this.draw();
        });
    }

    // Adds a card to the hand array, allowing them to be played by the user
    addToHand(card) {

        // Inserts the card into the hand array in increasing order of card number
        card.isHoverable = true;
        for (let i = 0; i < this.handArray.length; i++) {
            if (this.handArray[i].cardNum >= card.cardNum) {
                this.handArray.splice(i, 0, card);
                this.draw();
                return;
            }
        }
        this.handArray.push(card);
        this.draw();
    }

    // Makes the button that allows players to add cards to the playpile
    makePlayButton(pile) {
        this.playCardBtn = new Button(this.canvas.width-200, this.canvas.height-200, 100, 20, "play", this.canvas);

        this.playCardBtn.group.renderer.elem.addEventListener('click', (e) => {

            // Only allow the player to play the card if it is a valid play:
            if (!pile.addIsValid(this.currentSelection[0])){
                // Invalid play.
                // Adds all cards in the selection back to your hand
                for (let i = 0; i < this.currentSelection.length; i++) {
                    this.currentSelection[i].isHoverable = true;
                    this.handArray.push(this.currentSelection[i]);
                }
            } else {
                // Valid play
                for (let i = 0; i < this.currentSelection.length; i++) {
                    let card = this.currentSelection[i];
                    this.sock.send( JSON.stringify({
                        event: "addToPlayPile",
                        cardSuit: card.suit,
                        cardNum: card.cardNum,
                    }),);
    
                    this.currentSelection[i].sprite.remove();
                }
            }
            this.currentSelection = [];
            this.draw();
            this.canvas.update();
        });
    }

    removePlayButton() {
        this.playCardBtn.destroy();
    }

    addToSelection(card) {

        if (this.currentSelection.includes(card)) {
            return;
        }

        if (this.currentSelection.length != 0 && card.cardNum != this.currentSelection[0].cardNum) {
            console.log("emptying");
            this.emptySelection();
        }

        switch (card.cardType) {
            case CardTypes.HAND:
                card.isHoverable = false;
                this.numHand--;
                break;
                
            case CardTypes.FACEUP:
                if (this.numHand != 0) {
                    return;
                }
                this.numFaceUp--;
                break;
        }
        this.handArray.splice(this.handArray.indexOf(card), 1);
        this.currentSelection.push(card);
        this.draw();
    }

    // TODO
    // removeFromSelection(card) {}

    emptySelection() {
        for (let i = 0; i < this.currentSelection.length; i++) {
            let card = this.handArray[i];
            switch (card.cardType) {
                case CardTypes.HAND:
                    this.numHand++;
                    card.isHoverable = true;
                    break;
                    
                case CardTypes.FACEUP:
                    this.numFaceUp++;
                    break;
            }
            this.addToHand(card);
        }
        this.currentSelection = [];
        this.draw();
    }

    // Handles the different behaviours of cards when clicked 
    handleClick(card){

        let index = this.handArray.indexOf(card);
        if (index == -1){
            console.log("error, could not find card.");
        }

        // Handles the players initial choice of three face up cards
        if (this.ready == false){
            // Clicked card is in the faceUp array, and should be moved to the hand
            if (card.cardType == CardTypes.FACEUP) {
                if (this.numFaceUp == 3) {
                    this.readyBtn.destroy();
                }
                
                this.numFaceUp--;
                card.isHoverable = true;
                card.cardType = CardTypes.HAND;
                
            // Clicked card is in the hand and should be moved into the faceUp array
            } else {
                if (this.numFaceUp < 3) {
                    
                    this.numFaceUp++;
                    card.cardType = CardTypes.FACEUP;
                }

                if (this.numFaceUp == 3){
                    
                    // Allows the player to ready up when theyve selected their cards
                    this.readyBtn = new Button(this.canvas.width-200, this.canvas.height-200, 100, 20, "Ready", this.canvas);

                    this.readyBtn.group.renderer.elem.addEventListener('click', (e) => {
                        this.ready = true;
                        
                        this.sock.send(JSON.stringify({
                            event: "ready",
                            player: this.username
                        }),)

                        this.readyBtn.destroy();
                        this.canvas.update();
                    });
                }
            }
            
        // Handles the general case of selecting a card to play
        } else {
                
            // Adds a card to the current list of cards to be played
            this.addToSelection(card);
            
            if (this.numHand == 0) {
                for (let i = 0; i < this.handArray.length; i++) {
                    this.handArray[i].isHoverable = true;
                }
            } else {
                for (let i = 0; i < this.handArray.length; i++) {
                    let currCard = this.handArray[i];
                    if (currCard.cardType == CardTypes.FACEUP) {
                        currCard.isHoverable = false;
                    }
                }
            }
        }

        this.draw();
        this.canvas.update();
    }

    // Draws each of the different sets of cards in their required locations
    draw() {

        if (!this.finishedChoosingStarting) {
            // Draw all face down cards
            for (let i = 0; i < this.faceDown.length; i++){
                this.faceDown[i].translation.set(this.canvas.width/2 - (this.faceDown.length*100/2) + i*100, this.faceDownYPos);
            }
        }

        let countHand = 0; 
        let countFaceUp = 0;
        // Draw all cards in the player's hand
        for (let i = 0; i < this.handArray.length; i++){
            switch (this.handArray[i].cardType) {
                case CardTypes.HAND:
                    this.handArray[i].draw(this.canvas.width/2 - (this.numHand*100/2) + countHand++*100, this.handArrayYPos);
                    break;

                case CardTypes.FACEUP:
                    this.handArray[i].draw(this.canvas.width/2 - (300/2) + countFaceUp++*100, this.faceUpYPos);
                    break;
            }
        }

        // Draws the selected cards to be played
        for (let i = 0; i < this.currentSelection.length; i++) {
            this.currentSelection[i].draw(100 + 100 * i, this.currentSelectionYPos);
        }

        this.canvas.update();
    }
}

// A visual representation of the play pile, which stores the current stack of played cards
export class PlayPileView {

    constructor(canvas) {
        this.cards = [];
        this.topCardSet = [];
        this.canvas = canvas;
    }

    // Checks if adding the given card to the play pile is valid
    addIsValid(card){
        if (this.topCardSet.length == 0){
            return true;
        }
        if (card.cardNum == 9 || card.cardNum == 1 || card.cardNum == 2){
            return true;
        }
        let compCard = this.topCardSet[0];
        console.log("Comp card is: ", compCard.cardNum);

        if (compCard.cardNum == 6){
            if (card.cardNum <= 6 && card.cardNum != 0){
                return true;
            }
            return false;
        }
        if (compCard.cardNum == 9 || compCard.cardNum == 1){
            return true;
        }
        if (compCard.cardNum == 2){
            let cardIndex = this.topCardSet.indexOf(card);
            if (cardIndex === -1 || cardIndex === 0){
                let newIndex = this.cards.indexOf(card);
                if (newIndex === 0){
                    return true;
                }
                return this.addIsValid(this.cards[newIndex]);
            }
            return this.addIsValid(this.topCardSet[cardIndex]);
        }
        if (compCard.cardNum == 0){
            return false;
        }
        if (card.cardNum == 0){
            return true;
        } else {
            return card.cardNum >= compCard.cardNum;
        }
    }

    // Adds a card to the play pile, and updates the display of the top of the pile
    addCard(card) {

        // Ensure card to be added is valid.
        if (this.addIsValid(card) == false){
            return false;
        }

        if (this.topCardSet.length > 0) {
            // If the card number matches the one at the top currently, adds it to 
            // the top of the pile
            if (this.topCardSet[0].cardNum == card.cardNum) {
                this.topCardSet.push(card);
                return true;
            } 
            // Destroys top of pile display and creates a new one for the card if not
            this.topCardSet.forEach(function(pileCard) {
                pileCard.destroy();
            });
        }
        this.topCardSet = [card];
        return true;
    }

    // Draws the top of the play pile
    draw() {
        for (let i = 0; i < this.topCardSet.length; i++) {
            this.topCardSet[i].draw(this.canvas.width/3 - this.topCardSet.length*20 + i*40, this.canvas.height/2);
        }
    }
}

// A basic button class consisting of a coloured rectangle with some text.
// Note that an event listener should  be added externally to the group element.
export class Button {

    constructor(x, y, width, height, text, canvas) {

        let rect = canvas.makeRectangle(x, y, width, height);
        rect.fill = '#808080';

        let txt = canvas.makeText(text, x, y, );
        txt.size = 20;
        txt.fill = '#FFFFFF';
        this.group = canvas.makeGroup(rect, txt);

        canvas.add(this.group);
        canvas.update();
    }

    destroy() {
        this.group.remove();
    }
}