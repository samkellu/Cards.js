import {Two} from "./two.js";
import {CardView, GameView, CardTypes} from "./viewClasses.js";
import {GameController} from "./GameController.js";

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const gameView = new GameView(two);
const controller = new GameController(sock, username, gameView);

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
            gameView.setInstructionText("Select three cards to use later.");
            break;

        case "setText":
            gameView.setInstructionText(data.msg);
            break;

        // Another player has played a card -> add it to the top of the play pile
        case "addToPlayPile":
            addToPlayPile(data.cardSuit, data.cardNum);
            break;

        // Add the given card to the player's hand
        case "addCardHand":
            addCard(data.cardSuit, data.cardNum);
            break;

        case "addCardFaceDown":
            controller.addToFaceDown(new CardView(data.cardSuit, data.cardNum, two, CardTypes.FACEDOWN));
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

                userListStr += `<div> ${user.username} ${readyString}</div>`;
            }

            document.getElementById("users").innerHTML = userListStr;
            break;

        // Begins the current player's turn, allowing them to play cards
        case "startTurn":
            
            // add play button and notify player it is their turn
            gameView.makePlayButton(controller);
            gameView.setInstructionText("It's your turn.");
            console.log("turn started");
            break;

        // Ends the player's turn and removes relevant ui elements
        case "endTurn":

            // Remove the play button and inform the user it isnt their turn
            gameView.removePlayButton();
            gameView.setInstructionText("Waiting for your turn...");
            console.log("turn ended");
            break;

        // Handles the callback for the serverside card verification
        case "playCardsResponse":
            controller.handleValidateResponse(data.response);
            break;
    }
};

// Adds a card to the player's hand to be displayed
function addCard(cardSuit, cardNum) {

    let card = new CardView(cardSuit, cardNum, two, CardTypes.HAND);
    two.update();
    
    // Adds a generic hover and click listener to a card
    card.sprite.renderer.elem.addEventListener('click', (e) => {
    
        card.isHoverable = false;
        controller.handleClick(card);

    });

    // Moves the card when hovered over
    card.sprite.renderer.elem.addEventListener('mouseover', (e) => {

        if (card.isHoverable) {
            card.draw(card.sprite.translation.x, card.sprite.translation.y - 30);
            two.update();
        }
    });

    // Returns the card to its regular position after being hovered over
    card.sprite.renderer.elem.addEventListener('mouseout', (e) => {
        
        controller.draw();
    });

    controller.addToHand(card);
}

// Adds a card to the play pile to be displayed
function addToPlayPile(cardSuit, cardNum) {

    let card = new CardView(cardSuit, cardNum, two, CardTypes.PILE);
    controller.addToPlayPile(card)
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