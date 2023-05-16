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
    texture;

    constructor(x, y, value, suit, canvas){
        this.x = x;
        this.y = y;
        this.width = 250;
        this.height = 550;
        this.radius = 20;
        this.value = value;
        this.value_string = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"][value];
        this.suit = ["Hearts", "Diamonds", "Clubs", "Spades"][suit];
        let filename = "./cardSprites/tile0"+(suit*13+value)+".png";

        this.texture = new Two.Texture(filename, function() {
            var shape = canvas.makeRectangle(canvas.width / 2, canvas.height / 2, texture.image.width, texture.image.height);
            shape.noStroke().fill = texture;
        });
    }


    draw(canvas){

        // var card = canvas.makeRoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
        // card.noStroke().fill = this.texture;//'#ff0000';//new Two.Texture("./card.png");
    }
}