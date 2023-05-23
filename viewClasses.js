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
        this.rect = canvas.makeRectangle(0, 0, this.width, this.height);
        this.rect.noStroke();
        canvas.add(this.sprite);
    }

    draw(x, y) {
        this.rect.translation.set(x, y);
        this.sprite.scale = this.rect.scale;
        this.sprite.translation.set(x, y);
    }

    destroy() {
        this.rect.remove();
        this.sprite.remove();
    }
}

export class HandView {
    constructor(canvas){
        this.handArray = [];
        this.faceUp = [];
        this.canvas = canvas;
    }

    addToHand(card) {

        for (let i = 0; i < this.handArray.length; i++) {
            console.log(card.cardNum + " " + this.handArray[i].cardNum);
            if (this.handArray[i].cardNum >= card.cardNum) {
                this.handArray.splice(i, 0, card);
                return;
            }
        }
        this.handArray.push(card);
    }

    removeFromHand(card) {
        let index = this.handArray.indexOf(card);
        this.handArray.splice(index, 1);
        card.destroy();
    }

    draw() {
        for (let i = 0; i < this.handArray.length; i++){
            this.handArray[i].draw(100+i*40, this.canvas.height - 40);
        }
    }
}

export class PlayPileView {

    constructor() {
        this.cards = [];
        this.topCardSet = [];
    }

    addCard(card) {

        if (this.topCardSet.length > 0) {
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
            this.topCardSet[i].draw(100+i*80, 120);
        }
    }
}