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
    num;
    suit;
    rect;
    sprite;
    cardType;

    constructor(suitNum, num, canvas, cardType){

        this.num = num;
        this.suit = suitNum;
        this.cardType = cardType;

        // Initialising card texture
        var image = new Image(60, 96);

        if (cardType == CardTypes.FACEDOWN) {
            image.src = "./cardSprites/blank1.png";
        } else {
            image.src = "./cardSprites/" + ["heart", "diamond", "club", "spade"][suitNum] + num + ".png";
            this.isHoverable = true;
        }
        this.width = image.width;
        this.height = image.height;
        var texture = new Two.Texture(image);
        this.sprite = new Two.Sprite(texture);
        canvas.add(this.sprite);
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
export class GameView {

    constructor(canvas){

        this.canvas = canvas;
        this.instructionText = new TextBox(canvas.width/2, canvas.height-280, 20, canvas);

        // Absolute y positions for each set of displayed cards 
        this.handArrayYPos = this.canvas.height - 60;
        this.faceUpYPos = this.canvas.height - 200;
        this.faceDownYPos = this.canvas.height - 210;
        this.currentSelectionYPos = this.canvas.height - 200;
    }

    // Updates the instruction text's message
    setInstructionText(msg) {
        this.instructionText.setText(msg);
    }

    // Makes the button that allows players to add cards to the playpile
    makePlayButton(controller) {
        this.playCardBtn = new Button(this.canvas.width-200, this.canvas.height-200, 100, 20, "play", this.canvas);

        this.playCardBtn.group.renderer.elem.addEventListener('click', (e) => {

            controller.makeValidateRequest();
        });
    }

    removePlayButton() {
        this.playCardBtn.destroy();
    }

    makeReadyButton(controller) {
        // Allows the player to ready up when theyve selected their cards
        this.readyBtn = new Button(this.canvas.width-200, this.canvas.height-200, 100, 20, "Ready", this.canvas);

        this.readyBtn.group.renderer.elem.addEventListener('click', (e) => {

            controller.setReady();
            this.readyBtn.destroy();
        });
    }

    removeReadyButton() {
        this.readyBtn.destroy();
    }

    // Draws each of the different sets of cards in their required locations
    draw(pileCards, handCards, faceUpCards, selectionCards, faceDownCards) {
        
        // Draw all face down cards
        if (faceDownCards != null) {
            for (let i = 0; i < faceDownCards.length; i++){
                faceDownCards[i].draw(this.canvas.width/2 - (faceDownCards.length*100/2) + i*100, this.faceDownYPos);
            }
        }
        
        // Draw all cards in the player's hand
        if (handCards != null) {
            for (let i = 0; i < handCards.length; i++) {
                handCards[i].draw(this.canvas.width/2 - (handCards.length*100/2) + i*100, this.handArrayYPos);
            }
        }
        
        // Draw all faceup cards
        if (faceUpCards != null) {
            for (let i = 0; i < faceUpCards.length; i++) {
               faceUpCards[i].draw(this.canvas.width/2 - 150 + i*100, this.faceUpYPos);
            }
        }
        
        // Draws the selected cards to be played
        if (selectionCards != null) {
            for (let i = 0; i < selectionCards.length; i++) {
                selectionCards[i].draw(100 + 100 * i, this.currentSelectionYPos);
            }
        }
        
        // Draws the top cards in the play pile
        if (pileCards != null) {
            for (let i = 0; i < pileCards.length; i++) {
                pileCards[i].draw(this.canvas.width/3 - pileCards.length*20 + i*40, this.canvas.height/2);
            }
        }

        this.canvas.update();
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

export class TextBox {

    constructor(x, y, fontSize, canvas) {
        this.canvas = canvas
        this.text = new Two.Text("", x, y, 'bold');
        this.text.size = fontSize;
        this.text.value = "";
        canvas.add(this.text);
    }

    setText(msg) {
        this.text.value = msg;
        this.canvas.update();
    }
}