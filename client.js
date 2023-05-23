import {Two} from "./two.js";
import {CardView, HandView, PlayPileView} from "./viewClasses.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new HandView(two);
const playPile = new PlayPileView();

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
    sock.send(JSON.stringify({
        event: "startGame",
    }))
}

function addCard(cardSuit, cardNum) {
    let card = new CardView(cardSuit, cardNum, two);

    // Update renderer before trying to get elements
    two.update();
    card.sprite.renderer.elem.addEventListener('click', (e) => {

        hand.removeFromHand(card);
        hand.draw();
        two.update();

        sock.send( JSON.stringify({
            event: "addToPlayPile",
            cardSuit: card.suit,
            cardNum: card.cardNum,
        }),);
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