import {Two} from "./two.js";
import {CardView, HandView, PlayPileView, Button} from "./viewClasses.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new HandView(two);
const playPile = new PlayPileView();
let currentSelection = [];

sock.onmessage = (m) => {
    const data = JSON.parse(m.data);

    switch (data.event) {


        case "invalid":
            console.log(data.message);
            exit();
            break;

        case "startGame":
            let button = document.getElementById("startButton");
            button.remove();
            document.getElementsByTagName("svg")[0].setAttribute("style", "overflow: hidden; display: block; inset: 0px; position: fixed;");
            break;

        // Another player has played a card -> add it to the top of the play pile
        case "addToPlayPile":
            addToPlayPile(data.cardSuit, data.cardNum);
            break;

        // Add the given card to the player's hand
        case "addCard":
            addCard(data.cardSuit, data.cardNum);
            console.log("Added card", data.cardSuit, data.cardNum);
            break;
        
        case "setUserList":
            let userListStr = "";
            for (const username of data.usernames) {
                userListStr += `<div> ${username} </div>`;
            }

            document.getElementById("users").innerHTML = userListStr;
            break;
    }
};

function startGame(){
    console.log("Started game");

    let playCardBtn = new Button(two.width-200, two.height-200, 100, 20, "play", two);
    playCardBtn.group.renderer.elem.addEventListener('click', (e) => {

        for (let i = 0; i < currentSelection.length; i++) {

            let card = currentSelection[i];
            sock.send( JSON.stringify({
                event: "addToPlayPile",
                cardSuit: card.suit,
                cardNum: card.cardNum,
            }),);

            currentSelection[i].sprite.remove();
        }
        currentSelection = [];
    });

    sock.send(JSON.stringify({
        event: "startGame",
    }))
}

function addCard(cardSuit, cardNum) {
    let card = new CardView(cardSuit, cardNum, two);

    // Update renderer before trying to get elements
    two.update();
    card.sprite.renderer.elem.addEventListener('click', (e) => {

        // Adds a card to the current list of cards to be played
        const newCard = new CardView(cardSuit, cardNum, two);
        if (currentSelection.length == 0 || card.cardNum == currentSelection[0].cardNum) {
            // Adds the new card to the selection if it is of the same type as those in the current selection
            currentSelection.push(newCard);
        } else  {
            // Adds all cards in the selection back to your hand
            for (let i = 0; i < currentSelection.length; i++) {
                addCard(currentSelection[i].suit, currentSelection[i].cardNum);
                currentSelection[i].sprite.remove();
            }
            currentSelection = [newCard];
        }
        
        // Draws the selected cards to be played
        for (let i = 0; i < currentSelection.length; i++) {
            currentSelection[i].draw(100 + 100 * i, two.height - 200);
        }
        
        hand.removeFromHand(card);
        hand.draw();
        two.update();

    }, false);

    card.sprite.renderer.elem.addEventListener('mouseover', (e) => {

        card.draw(card.sprite.translation.x, card.sprite.translation.y-50);
        two.update();
    });

    card.sprite.renderer.elem.addEventListener('mouseout', (e) => {
        
        hand.draw();
        two.update();
    });

    hand.addToHand(card);
    hand.draw();
    two.update();
}

function addToPlayPile(cardSuit, cardNum) {
    playPile.addCard(new CardView(cardSuit, cardNum, two));
    playPile.draw();
    two.update();
}

window.onload = () => {
    document.getElementsByTagName("svg")[0].setAttribute("style", "overflow: hidden; display: none; inset: 0px; position: fixed;");


    document.getElementById("startButton").addEventListener("click", (e) => {
        startGame();
    });

};