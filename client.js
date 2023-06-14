import {Two} from "./two.js";
import {CardView, HandView, PlayPileView, Button, CardTypes, TextBox} from "./viewClasses.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new HandView(two, sock, username);
const playPile = new PlayPileView(two);

// Handles a message as it is received from the server's websocket
sock.onmessage = (m) => {

    console.log(m);
    const data = JSON.parse(m.data);
    switch (data.event) {

        // Sent when a player tries to join a game that is already running.
        // TODO - currently this case just exits, should be some graceful redirect to the lobby once implemented
        case "invalid":
            console.log(data.message);
            exit();
            break;

        // Sent when the game starts to ensure each user's gamespace is setup and ready to play
        case "startGame":
            let button = document.getElementById("startButton");
            button.remove();
            document.getElementsByTagName("svg")[0].setAttribute("style", "overflow: hidden; display: block; inset: 0px; position: fixed;");
            hand.setInstructionText("Select three cards to use later.");
            break;

        case "allReady":
            hand.setInstructionText("The game has started! Waiting for your turn...");
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
        
        // Sets the list of currently connected users
        case "setUserList":
            let userListStr = "";
            console.log(data);
            for (const user of data.users) {
                let readyString = `<span style="color: green; font-weight: bold;">READY</span>`;
                if (user.ready == 0) {
                    readyString = `<span style="color: red; font-weight: bold;">NOT READY</span>`;
                }

                if (user.ready == -1) {
                    readyString = "";
                }

                userListStr += `<div> ${user.username} ${readyString}</div>`;
            }

            document.getElementById("users").innerHTML = userListStr;
            break;

        case "startTurn":
            
            // add play button and notify player it is their turn
            hand.makePlayButton(playPile);
            hand.setInstructionText("It's your turn.");
            console.log("turn started");
            break;

        case "endTurn":

            // Remove the play button and inform the user it isnt their turn
            hand.removePlayButton();
            hand.setInstructionText("Waiting for your turn...");
            console.log("turn ended");
            break;
    }
};

// Adds a card to the player's hand to be displayed
function addCard(cardSuit, cardNum) {

    let card = new CardView(cardSuit, cardNum, two, CardTypes.HAND);

    hand.addListeners(card);
    hand.numHand++;
    hand.addToHand(card);
    two.update();
    hand.draw();
}

// Adds a card to the play pile to be displayed
function addToPlayPile(cardSuit, cardNum) {

    playPile.addCard(new CardView(cardSuit, cardNum, two, CardTypes.PILE));
    playPile.draw();
    two.update();
}

// Initialises essential page elements when opening the page
window.onload = () => {
    
    document.getElementsByTagName("svg")[0].setAttribute("style", "overflow: hidden; display: none; inset: 0px; position: fixed;");
    document.getElementById("startButton").addEventListener("click", (e) => {
        sock.send(JSON.stringify({
            event: "startGame",
        }));
    });
};