import {Two} from "./two.js";
import {Card, Hand} from "./card.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);
const screen = document.getElementById("screen");
const two = new Two( {fullscreen: true}).appendTo(screen);
const hand = new Hand();

sock.onmessage = (m) => {
    const data = JSON.parse(m.data);

    switch (data.event) {
        case "addCard":
            console.log(data.cardNum);
            addCard(data.cardSuit, data.cardNum);
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

function addCard(cardSuit, cardNum) {
    hand.addToHand(new Card(cardSuit, cardNum, two));
    hand.draw(two);
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