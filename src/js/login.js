const body = $("body");

$(() => {
    console.log("Loading template of login");
    $("#wrapper").load("view/login.html", () => {
        hideLoader();
        new Vue({
            el: "#keyboard",
            data: {
                kanaDb: kanaDb
            }
        })
    });
});

body.on("click", "#keyboard > .button", e => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

body.on("click", "#backspace", () => {
    const token = $("#token");
    token.val(token.val().substring(0, token.val().length - 1));
});

body.on("click", "#login", () => {
    showLoader();

    fetch("https://api.local-connect.ga/sessions/create", {
        body: "token=" + encodeToken($("#token").val()),
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            Cookies.set("LocalConnect-Session", json.secret, { expires: 9999999 });

            move(URI("/mypage.view", location.href));
        })
        .catch(error => {
            console.error(error);
        });
});

function encodeToken(token) {
    let result = "";

    [].forEach.call(token, ch => {
        result = result.concat(window.kanaDb[ch]);
    });

    console.log(result);
    return result;
}
