import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Decks } from "./decks.js";
import { CardBack, HandBack } from "./cardBack.js";
// import { HandBack } from "./cardFront.js";


const connected = new Map();
const hands = new Map();

const app = new Application();
const port = 8080;
const router = new Router();
const deck = new Decks();

function broadcast(msg) {

    for (const client of connected.values()) {
        client.send(msg);
    }
}

function broadcast_users() {

    const usernames = [...connected.keys()];
    broadcast(JSON.stringify({
        event: "setUserList",
        usernames: usernames,
    }),);
}

function initGamestate() {
    for (let [player, hand] of hands) {
        for (let i = 0; i < 6; i++) {
            var card = deck.draw();
            hand.addToHand(card);

            broadcast(JSON.stringify({
                event: "addCard",
                cardSuit: card.suit,
                cardNum: card.num
            }),);
        }
    }
}

router.get("/start_web_socket", async (ctx) => {

    
    const sock = await ctx.upgrade();
    const username = ctx.request.url.searchParams.get("username");
    
    if (connected.has(username)) {
        sock.close(1008, "username is taken");
        return;
    }
    
    sock.username = username;
    connected.set(username, sock);
    console.log(`${username} connected to server.`);
    
    sock.onopen = () => {
        hands.set(username, new HandBack());
        broadcast_users();
        initGamestate();
    };

    sock.onclose = () => {
        console.log(`${sock.username} has disconnected.`);
        connected.delete(sock.username);
        broadcast_users();
    };

    sock.onmessage = (m) => {
        const data = JSON.parse(m.data);
        if (data.event == "addCard") {

            broadcast(JSON.stringify({
                event: "addCard",
                cardSuit: data.cardSuit,
                cardNum: data.cardNum,
            }),);
        }
        
        if (data.event == "sendMessage") {
            broadcast(JSON.stringify({
                event: "sendMessage",
                username: sock.username,
                message: data.message,
            }),);
        } 
    };

});

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