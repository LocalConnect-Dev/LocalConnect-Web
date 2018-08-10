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
        let blocks = [];
        const count = 5;
        const length = Object.keys(kanaDb).length;
        for (let i = 0; i < length + count; i += count) {
            let block = {};
            for (let j = 0; j < count && i + j < length; j++) {
                const key = Object.keys(kanaDb)[i + j];
                console.log(kanaDb[key]);
                block[key] = kanaDb[key];
            }

            blocks.push(block);
        }

        console.log(blocks);

        new Vue({
            el: "#keyboard",
            data: {
                blocks: blocks
            }
        });

        hideLoader();
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
