$(() => {
    console.log("Hello, Local Connect!");

    if (navigator.appVersion.indexOf("Win") === -1) {
        console.log("Not Windows, applying Migu font CSS");
        $('head').append('<link rel="stylesheet" href="css/migu.css">');
    }
});

$(".keyboard > .button").click((e) => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

$("#backspace").click(() => {
    const token = $("#token");
    token.val(token.val().substring(0, token.val().length - 1));
});

$("#login").click(() => {
    const token = $("token");

    fetch("https://api.local-connect.ga/sessions/create", {
        body: "token=" + token.val(),
        method: "POST",
        mode: "cors"
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
        })
        .catch(error => {
            console.error(error);
        });
});