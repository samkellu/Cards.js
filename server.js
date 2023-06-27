import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { GameState, Card } from "./backendClasses.js";
import {Response} from "./responseTypes.js" 

// Struct to represent a user and their information
class User {

    constructor(name, sock, hand, ready) {
        this.name = name;
        this.sock = sock;
        this.hand = hand;
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

        let toAdd = state.initHand(user.name);
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
    users.set(username, new User(username, sock, null, 0));
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
                        event: "allReady"
                    }),);

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

                let cards = state.dictToCards(data.cards)
                // validates and plays the selected cards
                let result = state.playCards(user.name, cards);
                
                // sends the result of this attempt to the player
                sendMessage(user, JSON.stringify({
                    event: "playCardsResponse",
                    response: result,
                }));

                // Updates the turn and playpile for all players if the play was successful
                if (result == Response.VALID) {
                    for (let card of cards) {

                        broadcast(JSON.stringify({
                            event: "addToPlayPile",
                            cardSuit: card.suit,
                            cardNum: card.num
                        }),);
                    }
                    
                    sendMessage(users.get([...users.keys()][state.turn]), JSON.stringify({
                        event: "endTurn"
                    }),);
                    
                    let turn = state.incrementTurn();
                    sendMessage(users.get([...users.keys()][turn]), JSON.stringify({
                        event: "startTurn"
                    }),);
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