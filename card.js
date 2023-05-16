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
        console.log(suitNum);
        this.suit = ["heart", "diamond", "club", "spade"][suitNum];
        let filename = "./cardSprites/"+["heart", "diamond", "club", "spade"][suitNum]+cardNum+".png";
        console.log(filename);
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
    hand_array;
    face_down;
    face_up;

    constructor(hand_array, face_down_array, face_up_array){
        this.hand_array = hand_array;
        this.face_down = face_down_array;
        this.face_up = face_up_array;
    }

    draw(canvas){
        for (let i = 0; i < this.hand_array.length; i++){
            this.hand_array[i].draw(500+i*500, 500);
        }
    }
}