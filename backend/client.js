function ajaxUpdate() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        document.getElementById("text").innerHtml = "Fresh";
    }

    xhttp.open("GET", "fresh content", true);
    xhttp.send();
}