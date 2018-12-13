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

        const token = URI(location.href).search(true).token;
        if (token) {
            console.log("Trying to login automatically by provided token via URL");

            $("#token").val(decodeToken(token));
            $("#login").click();
        } else {
            hideLoader();
        }
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
        .onSuccess(session => {
            window.user = session.user;
            Cookies.set("LocalConnect-Session", session.secret, { expires: new Date("Tue, 31-Dec-2037 00:00:00 GMT") });

            $(".not-logged-in").addClass("hidden");
            $(".logged-in").removeClass("hidden");

            checkPermissions();
            checkGoToPanel();
            connectSocket();
            move(URI("/mypage.view", location.href));
        })
        .execute();
});
