import {Two} from "./two.js"

export class Card {
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


export class Hand {

    constructor(){
        console.log("inint");
        this.handArray = [];
        this.faceDown = [];
        this.faceUp = [];
    }

    addToHand(card) {
        console.log("added");
        this.handArray.push(card);
    }

    draw(canvas){
        for (let i = 0; i < this.hand_array.length; i++){
            this.hand_array[i].draw(100+i*64, 200, canvas);
        }
    }
}