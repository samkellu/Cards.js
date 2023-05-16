import {Two} from "./two.js";
import {Card} from "./card.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);

sock.onmessage = (m) => {
    const data = JSON.parse(m.data);

    switch (data.event) {
        case "addCard":
            addCard(data.cardSuit, data.cardNum, data.cardX, data.cardY);
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

function addCard(cardSuit, cardNum, cardX, cardY) {
    var card = new Card(cardX, cardY, cardSuit, cardNum, two);
    card.draw(two);
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