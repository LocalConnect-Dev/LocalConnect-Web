$(() => {
    console.log("Loading template of login");
    $("#wrapper").load("view/login.html");

    hideLoader();
});

$(".keyboard > .button").click((e) => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

$("#backspace").click(() => {
    const token = $("#token");
    token.val(token.val().substring(0, token.val().length - 1));
});

$("body").on("click", "#login", () => {
    showLoader();

    fetch("https://api.local-connect.ga/sessions/create", {
        body: "token=" + window.encodeToken($("#token").val()),
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            Cookies.set("LocalConnect-Session", json.secret);

            location.href = "./mypage.view";
        })
        .catch(error => {
            console.error(error);
        });
});