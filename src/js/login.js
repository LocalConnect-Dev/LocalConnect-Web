const encodeToken = token => {
    let result = "";

    [].forEach.call(token, ch => {
        result = result.concat(window.kanaDb[ch]);
    });

    console.log(result);
    return result;
};

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

onClick("#keyboard > .button", e => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

onClick("#backspace", () => {
    const token = $("#token");
    token.val(token.val().substring(0, token.val().length - 1));
});

onClick("#login", () => {
    showLoader();

    new APICall("sessions/create")
        .post()
        .body("token=" + encodeToken($("#token").val()))
        .onSuccess(json => {
            Cookies.set("LocalConnect-Session", json.secret, { expires: 9999999 });
            move(URI("/mypage.view", location.href));
        })
        .execute();
});
