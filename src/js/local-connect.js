$(document).ajaxError(() => {
    hideLoader();
    fetchError({
        error: "ページを読み込めませんでした"
    });
});

$(() => {
    console.log("Hello, Local Connect!");

    if (navigator.appVersion.indexOf("Win") === -1) {
        console.log("Not Windows, applying Migu font CSS");
        $("<link>", {
            rel: "stylesheet",
            href: "css/migu.css"
        }).appendTo("head");
    }

    const kanaDb = {
        "あ": "0",
        "い": "1",
        "う": "2",
        "え": "3",
        "お": "4",
        "か": "5",
        "き": "6",
        "く": "7",
        "け": "8",
        "こ": "9",
        "さ": "a",
        "し": "b",
        "す": "c",
        "せ": "d",
        "そ": "e",
        "た": "f",
        "ち": "g",
        "つ": "h",
        "て": "i",
        "と": "j",
        "な": "k",
        "に": "l",
        "ぬ": "m",
        "ね": "n",
        "の": "o",
        "は": "p",
        "ひ": "q",
        "ふ": "r",
        "へ": "s",
        "ほ": "t",
        "ま": "u",
        "み": "v",
        "む": "w",
        "め": "x",
        "も": "y",
        "や": "z",
    };

    window.encodeToken = token => {
        let result = "";

        [].forEach.call(token, ch => {
            result = result.concat(kanaDb[ch]);
        });

        console.log(result);
        return result;
    };

    window.fetchError = error => {
        new Vue({
            el: "#error",
            data: error
        });

        $("#error").modal("show");
    };

    showLoader();

    if (Cookies.get("LocalConnect-Session")) {
        loadView(URI(location.href));
    } else {
        move(URI("/login.view", location.href));
    }
});

$("a").click(e => {
    e.preventDefault();

    let uri;
    if (Cookies.get("LocalConnect-Session")) {
        const path = $(e.currentTarget).attr("href");
        uri = URI(path, location.href);
    } else {
        uri = URI("/login.view", location.href);
    }

    showLoader();
    move(uri);

    return false;
});

$("#go-top").click(() => {
    $("html, body").animate({ scrollTop: 0 }, "ease");
});

function loadView(uri) {
    console.log("Loading view");
    if (uri.suffix() === "view") {
        const name = uri.filename().split(".")[0];
        $.getScript("/js/" + name + ".js");
    }
}

function move(uri) {
    loadView(uri);
    window.history.pushState(null, null, uri.toString());
}

function showLoader() {
    $("#loader").addClass("active");
}

function hideLoader() {
    $("#loader").removeClass("active");
}