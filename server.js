import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { CardBack, HandBack, DecksBack } from "./backendClasses.js";

const connected = new Map();
const hands = new Map();
const app = new Application();
const port = 8080;
const router = new Router();
const deck = new DecksBack();

var running = false;

// Sends a message to al connected clients
function broadcast(msg) {

    for (const client of connected.values()) {
        client.send(msg);
    }
}

// Sends a message to a specific client
function sendMessage(user, msg) {

    connected.get(user).send(msg);
}

// Sends a list of all connected clients to all connected clients
function broadcast_users() {

    const usernames = [...connected.keys()];
    broadcast(JSON.stringify({
        event: "setUserList",
        usernames: usernames,
    }),);
}

// Initialises the backend gamestate, and draws cards from the deck for each player
function initGamestate() {
    for (let [player, sock] of connected) {
        hands.set(player, new HandBack());

        // TODO should this draw more cards for the faceDown hand cards?
        for (let i = 0; i < 5; i++) {
            var card = deck.draw();
            hands.get(player).addToHand(card);

            sendMessage(player, JSON.stringify({
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
    if (connected.has(username)) {
        sock.close(1008, "username is taken");
        return;
    }
    
    sock.username = username;
    connected.set(username, sock);
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
        connected.delete(sock.username);
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
                // add to backend deck +++ TODO
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