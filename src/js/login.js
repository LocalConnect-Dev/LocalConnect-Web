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
                block[key] = kanaDb[key];
            }

            if (Object.keys(block).length !== 0) blocks.push(block);
        }

        console.log(blocks);

        new Vue({
            el: "#keyboard",
            data: {
                blocks: blocks
            }
        });

        $("<button>", {
            "class": "ui button",
            id: "backspace",
            text: "一字消す"
        }).appendTo("#keyboard > .grid > .column:last-child");

        $("<div>", {
            "class": "column"
        }).appendTo("#keyboard > .grid");

        hideLoader();
    });
});

onClick("#keyboard .button:not(#backspace)", e => {
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
