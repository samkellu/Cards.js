import {Two} from "./two.js";
import {CardView, HandView, PlayPileView, Button} from "./viewClasses.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new HandView(two, sock, username);
const playPile = new PlayPileView(two);

// Handles a message as it is received from the server's websocket
sock.onmessage = (m) => {

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
            startGame();
            break;

        case "allReady":
            hand.makePlayButton();
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
            for (const user of data.users) {
                let readyString = `<span style="color: green; font-weight: bold;">READY</span>`;
                if (user.ready == 0) {
                    readyString = `<span style="color: red; font-weight: bold;">NOT READY</span>`;
                }

                if (user.ready == -1) {
                    readyString = "";
                }

                userListStr += `<div> ${user.name} ${readyString}</div>`;
            }

            document.getElementById("users").innerHTML = userListStr;
            break;
    }
};

// Handles the initialisation of the gamespace
function startGame(){

}

// Adds a card to the player's hand to be displayed
function addCard(cardSuit, cardNum) {

    let card = new CardView(cardSuit, cardNum, two);

    hand.addToHand(card);
    two.update();
    hand.draw();
}

// Adds a card to the play pile to be displayed
function addToPlayPile(cardSuit, cardNum) {

    playPile.addCard(new CardView(cardSuit, cardNum, two));
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