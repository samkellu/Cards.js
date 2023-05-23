import {Two} from "./two.js"


export class CardView {
    width;
    height;
    radius;
    cardNum;
    suit;
    rect;
    sprite;

    constructor(suitNum, cardNum, canvas){
        this.radius = 20;
        this.cardNum = cardNum;
        this.suit = suitNum;
        let filename = "./cardSprites/"+["heart", "diamond", "club", "spade"][suitNum]+cardNum+".png";

        var image = new Image(60, 96);
        image.src = filename;
        this.width = image.width;
        this.height = image.height;
        var texture = new Two.Texture(image);
        this.sprite = new Two.Sprite(texture);
        canvas.add(this.sprite);
    }

    draw(x, y) {
        this.sprite.translation.set(x, y);
    }

    destroy() {
        this.sprite.remove();
    }
}

export class HandView {

    canvas;
    faceDown;
    faceUp;
    handArray;
    sprite;
    finishedChoosingStarting;


    

    constructor(canvas){
        this.canvas = canvas;
        this.finishedChoosingStarting = false;

        var texture = new Two.Texture(image);
        this.sprite = new Two.Sprite(texture);
        canvas.add(this.sprite);

        this.faceDown = []
        var image = new Image(60, 96);
        image.src = "./cardSprites/blank1.png";
        var texture = new Two.Texture(image)
        for (let i = 0; i < 3; i++){
            this.faceDown.push(new Two.Sprite(texture));
            canvas.add(this.faceDown[i]);
        }

        this.handArray = [];
        this.faceUp = [];
        this.canvas = canvas;
        this.currentSelection = [];
    }

    addToHand(card) {

        this.canvas.update();
        card.sprite.renderer.elem.addEventListener('click', (e) => {
    
            let successfulHandle = this.handleClick(card);
            this.canvas.update();
    
        }, false);
    
        card.sprite.renderer.elem.addEventListener('mouseover', (e) => {
    
            card.draw(card.sprite.translation.x, this.canvas.height - 110);
            this.canvas.update();
        });
    
        card.sprite.renderer.elem.addEventListener('mouseout', (e) => {
            
            card.draw(card.sprite.translation.x, this.canvas.height - 60);
            this.canvas.update();
        });

        for (let i = 0; i < this.handArray.length; i++) {
            if (this.handArray[i].cardNum >= card.cardNum) {
                this.handArray.splice(i, 0, card);
                return;
            }
        }
        this.handArray.push(card);
    }


    handleClick(card){

        let index = this.handArray.indexOf(card);

        if (this.finishedChoosingStarting == false){
            if (index == -1){
                // Card in faceUp.
                let index = this.faceUp.indexOf(card);
                this.addToHand(card);
                this.faceUp.splice(index, 1);
                console.log("Removed card from faceup");
            } else {
                console.log("Added card to faceUp");
                this.faceUp.push(card);
                this.handArray.splice(index, 1);
                if (this.faceUp.length == 3){
                    this.finishedChoosingStarting = true;
                    return false;
                }
                return false;
            }
        } else {
            if (index == -1){
                return false;
            } else {

                console.log("trying to play");
                var oldCard = handArray[index];
                // Adds a card to the current list of cards to be played
                const newCard = new CardView(oldCard.suit, oldCard.cardNum, this.canvas);
                if (currentSelection.length == 0 || card.cardNum == currentSelection[0].cardNum) {
                    // Adds the new card to the selection if it is of the same type as those in the current selection
                    currentSelection.push(newCard);
                } else  {
                    // Adds all cards in the selection back to your hand
                    for (let i = 0; i < currentSelection.length; i++) {
                        addToHand(currentSelection[i].suit, currentSelection[i].cardNum);
                        currentSelection[i].sprite.remove();
                    }
                    currentSelection = [newCard];
                }
    
                // Draws the selected cards to be played
                for (let i = 0; i < currentSelection.length; i++) {
                    currentSelection[i].draw(100 + 100 * i, canvas.height - 200);
                }
    
                hand.removeFromHand(card);
                hand.draw();
            }

        }

        this.draw();
        return true;
    }

    removeFromHand(card, index) {

        console.log("Removed card from hand");
        this.handArray.splice(index, 1);
        card.destroy();
    }

    draw() {

        

        // Draw all face down cards
        for (let i = 0; i < this.faceDown.length; i++){
            this.faceDown[i].translation.set(this.canvas.width/2 - (this.faceDown.length*100/2) + i*100, this.canvas.height-200);
        }

        // Draw all face up cards
        for (let i = 0; i < this.faceUp.length; i++){
            this.faceUp[i].draw(this.canvas.width/2 - (this.faceDown.length*100/2) + i*100, this.canvas.height-190);
        }

        // Draw all cards in the player's hand
        for (let i = 0; i < this.handArray.length; i++){
            this.handArray[i].draw(this.canvas.width/2 - (this.handArray.length*100/2) + i*100, this.canvas.height - 60);
        }
    }
}

export class PlayPileView {

    constructor(canvas) {
        this.cards = [];
        this.topCardSet = [];
        this.canvas = canvas;
    }

    addIsValid(card, cardIndex){
        if (this.cards.length == 0 || cardIndex == -1){
            return true;
        }
        let compCard = this.cards[this.cards.length-1];

        if (compCard.cardNum == 7){
            if (card.cardNum <= 7 && card.cardNum != 0){
                return true;
            }
            return false;
        }
        if (compCard.cardNum == 10 || compCard.cardNum == 2){
            return true;
        }
        if (compCard.cardNum == 3){
            return this.addIsValid(cardIndex-1);
        }
        if (card.cardNum == 0){
            return true;
        } else {
            return card.cardNum >= compCard.cardNum;
        }


    }

    addCard(card) {

        // Ensure card added is valid.
        if (this.addIsValid(card, this.cards.length-1) == false){
            // return false;
        }


        if (this.topCardSet.length > 0) {
            // If the card number matches the one at the top currently.
            if (this.topCardSet[0].cardNum == card.cardNum) {
                this.topCardSet.push(card);
                return;
            } 
            this.topCardSet.forEach(function(pileCard) {
                pileCard.destroy();
            });
        }
        this.topCardSet = [card];
    }

    draw() {
        for (let i = 0; i < this.topCardSet.length; i++) {
            this.topCardSet[i].draw(this.canvas.width/3 - this.topCardSet.length*20 + i*40, this.canvas.height/2);
        }
    }
}

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
}