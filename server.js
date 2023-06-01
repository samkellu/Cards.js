import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { CardBack, HandBack, DecksBack } from "./backendClasses.js";

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
const deck = new DecksBack();

var turn = 0;
var running = false;

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
    for (const user of users.values()) {
        user.hand = new HandBack();

        // TODO should this draw more cards for the faceDown hand cards?
        for (let i = 0; i < 5; i++) {
            var card = deck.draw();
            user.hand.addToHand(card);

            sendMessage(user, JSON.stringify({
                event: "addCard",
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

            case "addToPlayPile":
                broadcast(JSON.stringify({
                    event: "addToPlayPile",
                    cardSuit: data.cardSuit,
                    cardNum: data.cardNum
                }),);

                sendMessage(users.get([...users.keys()][turn % users.size]), JSON.stringify({
                    event: "endTurn"
                }),);

                turn++;
                sendMessage(users.get([...users.keys()][turn % users.size]), JSON.stringify({
                    event: "startTurn"
                }),);

                // add cards to backend deck +++ TODO
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

                    sendMessage(users.get([...users.keys()][turn % users.size]), JSON.stringify({
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