import {Two} from "./two.js"

export class CardView {
    width;
    height;
    radius;
    value;
    suit;
    value_string;
    image;

    constructor(suitNum, cardNum){
        this.radius = 20;
        this.value = cardNum;
        this.suit = suitNum;
        let filename = "./cardSprites/"+["heart", "diamond", "club", "spade"][suitNum]+cardNum+".png";
        this.image = new Image(100,100);
        this.image.src = filename;
        this.width = this.image.width;
        this.height = this.image.height;
    }


    draw(x, y, canvas){
        var rect = canvas.makeRectangle(x, y, this.width, this.height);
        rect.noStroke();
        var texture = new Two.Texture(this.image);
        var sprite = new Two.Sprite(texture);
        sprite.scale = rect.scale;
        sprite.translation.set(rect.translation.x, rect.translation.y);
        canvas.add(sprite);
    }
}

export class HandView {
    constructor(){
        this.handArray = [];
        this.faceUp = [];
    }

    addToHand(card) {
        this.handArray.push(card);
    }

    draw(canvas){
        for (let i = 0; i < this.handArray.length; i++){
            this.handArray[i].draw(100+i*120, 900, canvas);
        }
    }
}