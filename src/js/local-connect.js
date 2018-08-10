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

    console.log("Loading modals");
    $("#modals").load("view/modals.html");

    console.log("Loading kana database");
    fetch("/resources/kana.json")
        .then(response => response.json())
        .then(json => {
            window.kanaDb = json;
        })
        .catch(error => {
            console.error(error);
        });

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
