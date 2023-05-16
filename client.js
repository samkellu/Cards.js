import {Two} from "./two.js";
import {Card} from "./card.js"

const username = prompt("Enter your username: ");
const sock = new WebSocket(`ws://localhost:8080/start_web_socket?username=${username}`,);

sock.onmessage = (m) => {
    const data = JSON.parse(m.data);

    switch (data.event) {
        case "sendMessage":
            addToConversation(data.username, data.message);
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

function addToConversation(username, msg) {
    document.getElementById('conversation').innerHTML += `</br><b> ${username} </b>: ${msg}`;
}

window.onload = () => {

    var screen = document.getElementById("screen");
    var two = new Two( {fullscreen: true}).appendTo(screen);
    // var card = new Card(500, 500, 4, 3, two);
    // card.draw(two);
    var img = new Image();
    img.src = "./card.png";

    var rect = two.makeRectangle(two.width / 2, two.height / 2, img.width, img.height);
    var texture = new Two.Texture(img);
    var sprite = new Two.Sprite(texture);
    sprite.scale = rect.scale;
    sprite.translation.set(rect.translation.x, rect.translation.y);
    two.add(sprite);
    two.update();

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