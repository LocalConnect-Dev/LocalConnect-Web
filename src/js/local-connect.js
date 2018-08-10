class APICall {
    static get BASE_URI() {
        return "https://api.local-connect.ga/";
    }

    constructor(path) {
        this.path = path;
        this.options = {
            mode: "cors",
            headers: {}
        };
    }

    authorize() {
        this.options.headers["X-LocalConnect-Session"] = Cookies.get("LocalConnect-Session");

        return this;
    }

    post() {
        this.options.method = "POST";
        this.options.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";

        return this;
    }

    body(body) {
        this.options.body = body;

        return this;
    }

    params(params) {
        this.body(
            Object
                .keys(params)
                .map(key => key + "=" + encodeURIComponent(params[key]))
                .join("&")
        );

        return this;
    }

    onSuccess(callback) {
        this.callback = callback;

        return this;
    }

    execute() {
        return fetch(APICall.BASE_URI + this.path, this.options)
            .then(response => response.json())
            .then(obj => {
                if (obj.error) {
                    fetchError(obj.error);
                    return;
                }

                this.callback(obj);
            })
            .catch(error => {
                console.error(error);
            });
    }
}

const fetchError = error => {
    new Vue({
        el: "#error",
        data: {
            error: error
        }
    });

    $("#error").modal("show");
    hideLoader();
};

const onClick = (selector, callback) => {
    $("body").on("click", selector, callback);
};

$(document).ajaxError(() => {
    hideLoader();
    fetchError("ページを読み込めませんでした");
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

    showLoader();

    if (Cookies.get("LocalConnect-Session")) {
        loadView(URI(location.href));
    } else {
        move(URI("/login.view", location.href));
    }
});

onClick("a", e => {
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

onClick("#go-top", () => {
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
