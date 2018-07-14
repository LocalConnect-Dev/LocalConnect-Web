$(".keyboard > .button").click((e) => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

$("#backspace").click(() => {
    const token = $("#token");
    token.val(token.val().substring(0, token.val().length - 1));
});

$("#login").click(() => {
    const loader = $("#loader");
    const token = $("#token");

    loader.addClass("active");

    fetch("https://api.local-connect.ga/sessions/create", {
        body: "token=" + window.encodeToken(token.val()),
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            Cookies.set("LocalConnect-Session", json.id);

            location.href = "./mypage.html";
        })
        .catch(error => {
            console.error(error);
        });
});