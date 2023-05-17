import {Two} from "./two.js";
import {CardView, HandView, PlayPileView} from "./viewClasses.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new HandView();
const playPile = new PlayPileView();

sock.onmessage = (m) => {
    const data = JSON.parse(m.data);

    switch (data.event) {

        // Another player has played a card -> add it to the top of the play pile
        case "addToPlayPile":
            addToPlayPile(data.cardSuit, data.cardNum);
            break;

        // Add the given card to the player's hand
        case "addCard":
            addCard(data.cardSuit, data.cardNum);
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

    document.getElementById("data").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            
            const input = document.getElementById("data");
            var message = input.value;
            input.value = "";
            sock.send( JSON.stringify({
                event: "sendMessage",
                message: message,
            }),);
        }
    });
};