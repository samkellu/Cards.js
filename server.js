import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { GameState, Card } from "./backendClasses.js";
import {Response} from "./responseTypes.js" 

const MIN_HAND_SIZE = 3;

// Struct to represent a user and their information
class User {

    constructor(name, sock, ready) {
        this.name = name;
        this.sock = sock;
        this.ready = ready;
    }

    send(msg) {
        this.sock.send(msg);
    }
}

const users = new Map();
const app = new Application();
const port = 8080;
const router = new Router();
const state = new GameState();

var running = false;

// Gets a user by socket, or null if not
function getUserBySocket(sock) {
    for (let user of users.values()) {
        if (user.sock == sock) {
            return user;
        }
    }
    return null;
}

// Sends a message to al connected clients
function broadcast(msg) {

    for (const user of users.values()) {
        user.send(msg);
    }
}

// Sends a message to a specific client
function sendMessage(user, msg) {

    user.send(msg);
}

// Sends a list of all connected clients to all connected clients
function broadcast_users() {

    let userString = '{"event": "setUserList", "users": [';
    for (const user of users.values()) {
        userString += '{"username": "' + user.name + '", "ready": "' + user.ready + '"},'
    }
    userString = userString.slice(0, -1);
    userString += ']}'
    broadcast(userString);
}

// Initialises the backend gamestate, and draws cards from the deck for each player
function initGamestate() {

    for (let user of users.values()) {

        let toAdd = state.initHand(user.name, MIN_HAND_SIZE + 3);
        for (let card of toAdd.faceDown) {
            sendMessage(user, JSON.stringify({
                event: "addCardFaceDown",
                cardSuit: card.suit,
                cardNum: card.num
            }),);
        }
        
        for (let card of toAdd.hand) {
            sendMessage(user, JSON.stringify({
                event: "addCardHand",
                cardSuit: card.suit,
                cardNum: card.num
            }),);
        }
    }
}

function nextTurn(currentPlayer) {

    sendMessage(users.get([...users.keys()][state.turn]), JSON.stringify({
        event: "endTurn"
    }),);

    // Fills the players hand up to the minimum amount if possible
    let toAdd = state.fillHand(currentPlayer.name, MIN_HAND_SIZE);
    for (let card of toAdd) {

        sendMessage(currentPlayer, JSON.stringify({
            event: "addCardHand",
            cardSuit: card.suit,
            cardNum: card.num
        }),);
    }
    
    let nextPlayer = users.get(state.nextPlayer());
    sendMessage(nextPlayer, JSON.stringify({
        event: "startTurn"
    }),);

    // Adds the playpile to the players hand if they are unable to play
    if (!state.validPlayExists(nextPlayer.name)) {
        sendMessage(nextPlayer, JSON.stringify({
            event: "setText",
            msg: "No valid plays, adding play pile to hand..."
        }));

        broadcast(JSON.stringify({
            event: "emptyPile",
        }));

        for (let card of state.playPile.getPile()) {
            sendMessage(nextPlayer, JSON.stringify({
                event: "addCardHand",
                cardSuit: card.suit,
                cardNum: card.num
            }));
        }
    
        state.addPileToHand(nextPlayer.name);
    }
}

// Creates a web socket between the server and a client accessed by username
router.get("/start_web_socket", async (ctx) => {

    const sock = await ctx.upgrade();
    const username = ctx.request.url.searchParams.get("username");
    
    // Checks if there is a client of the same name
    if (users.has(username)) {
        sock.close(1008, "username is taken");
        return;
    }
    
    sock.username = username;
    users.set(username, new User(username, sock, 0));
    console.log(`${username} connected to server.`);
    
    // Sends the client the initial data they require
    sock.onopen = () => {
        broadcast_users();

        if (running) {
            sock.send(JSON.stringify({
                event: "invalid",
                message: "The game has already begun"
            }));
        }
    };

    // Manages the disconnection of a client
    sock.onclose = () => {
        console.log(`${sock.username} has disconnected.`);
        users.delete(sock.username);
        broadcast_users();
    };

    // Relays messages from the client to other clients
    sock.onmessage = (m) => {
        const data = JSON.parse(m.data);

        switch (data.event) {

            case "startGame":
                initGamestate();
                console.log("Started Game");
                broadcast(JSON.stringify({
                    event: "startGame"
                }),);
                break;

            case "ready":
                console.log("Player " + data.player + " is ready!");
                users.get(data.player).ready = 1;
                console.log(data.faceUp);

                if (!state.setFaceUp(data.player, state.JSONToCards(data.faceUp))) {
                    broadcast(JSON.stringify({
                        event: "setText",
                        msg: "DEBUG ERROR, CARDS INCORRECTLY INITIALIZED"
                    }));

                    exit();
                }
                broadcast_users();

                let valid = true;
                for (const user of users.values()) {
                    if (user.ready != 1) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    for (const user of users.values()) {
                        user.ready = -1;
                    }
                    broadcast_users();
                    broadcast(JSON.stringify({
                        event: "setText",
                        msg: "The game has started! Waiting for your turn..."
                    }));

                    sendMessage(users.get([...users.keys()][state.turn]), JSON.stringify({
                        event: "startTurn"
                    }),);
                }
                break;
            
            // Handles an attempt to play a selection of cards
            case "playCards":

                let user = getUserBySocket(sock);
                if (user == null) {
                    console.log("invalid user");
                    return;
                }

                console.log(data.cards);
                let cards = state.JSONToCards(data.cards)
                console.log(cards);
                // validates and plays the selected cards
                let result = state.playCards(user.name, cards);
                
                // sends the result of this attempt to the player
                sendMessage(user, JSON.stringify({
                    event: "playCardsResponse",
                    response: result,
                }));

                // Updates the turn and playpile for all players if the play was successful
                if (result != Response.INVALID && result != Response.WRONG_TURN) {

                    // Clears the pile if a 10 was played, otherwise adds cards to the pile
                    if (result == Response.CLEAR_PILE) {
                        broadcast(JSON.stringify({
                            event: "emptyPile",
                        }));

                    } else {   
                        for (let card of cards) {
                            broadcast(JSON.stringify({
                                event: "addToPlayPile",
                                cardSuit: card.suit,
                                cardNum: card.num,
                            }));
                        }
                    }

                    nextTurn(user);
                }
                break;
        }
    };
});

// Routing settings
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/`,
        index: "index.html",
    });
  });

console.log("Listening at http://localhost:" + port);
await app.listen({ port });