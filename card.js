export class Card {
    x;
    y;
    width;
    height;
    radius;
    value;
    suit;
    value_string;

    constructor(x, y, value, suit){
        this.x = x;
        this.y = y;
        this.width = 250;
        this.height = 550;
        this.radius = 20;
        this.value = value;
        this.value_string = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"][value];
        this.suit = ["Hearts", "Diamonds", "Clubs", "Spades"][suit];
    }


    draw(canvas){
        canvas.makeRoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
        canvas.makeText(this.value_string + " of " + this.suit, this.x, this.y);
    }
}