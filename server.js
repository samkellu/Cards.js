import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const connected = new Map();

const app = new Application();
const port = 8080;
const router = new Router();

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
        broadcast_users();
        broadcast(JSON.stringify({
            event: "addCard",
            cardSuit: 4,
            cardNum: 1,
            cardX: 200,
            cardY: 50
        }),);
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
                cardX: data.cardX,
                cardY: data.cardY
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