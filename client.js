import {Two} from "./two.js";

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
    var rectangle = two.makeRectangle(two.width/2, two.height/2, 250, 350);
    var texture = new Two.Texture('./card.png');
    rectangle.noStroke().fill = texture;
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