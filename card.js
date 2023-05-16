import {Two} from "./two.js"

export class Card {
    x;
    y;
    width;
    height;
    radius;
    value;
    suit;
    value_string;
    image;

    constructor(x, y, suitNum, cardNum, canvas){
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.value = cardNum;
        console.log(suitNum);
        this.suit = ["heart", "diamond", "club", "spade"][suitNum];
        let filename = "./cardSprites/"+["heart", "diamond", "club", "spade"][suitNum]+cardNum+".png";
        console.log(filename);
        this.image = new Image(100,100);
        this.image.src = filename;
        this.width = this.image.width;
        this.height = this.image.height;
    }


    draw(canvas){

        var rect = canvas.makeRectangle(this.x, this.y, this.width, this.height);
        rect.noStroke();

        var texture = new Two.Texture(this.image);
        var sprite = new Two.Sprite(texture);
        sprite.scale = rect.scale;
        sprite.translation.set(rect.translation.x, rect.translation.y);
    
        canvas.add(sprite);
    }
}