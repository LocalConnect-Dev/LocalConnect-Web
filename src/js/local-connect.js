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
        const str = Object
            .keys(params)
            .map(key => key + "=" + encodeURIComponent(params[key]))
            .join("&");

        if (this.options.method === "POST") {
            this.body(str);
        } else {
            this.path += "?" + str;
        }

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
            });
    }
}

const fetchError = error => {
    $("#error").clone().prop("id", "error-instance").appendTo("body");

    const selector = "#error-instance";
    new Vue({
        el: selector,
        data: {
            error: error
        }
    });

    const element = $(selector);
    element.modal({
            closable: false,
            onHidden: () => {
                $("body > div:last-child").remove();
            }
        })
        .modal("show");

    hideLoader();
};

const onClick = (selector, callback) => {
    $("body").on("click", selector, callback);
};

const loadView = uri => {
    console.log("Loading view");
    if (uri.suffix() === "view") {
        const name = uri.filename().split(".")[0];
        $.getScript("/js/" + name + ".js");
    }
};

const move = uri => {
    loadView(uri);
    window.history.pushState(null, null, uri.toString());
};

const showLoader = () => {
    $("#loader").addClass("active");
};

const hideLoader = () => {
    $("#loader").removeClass("active");
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
        if (location.href.endsWith("/")) {
            move(URI("/boards.view", location.href));
        } else {
            loadView(URI(location.href));
        }
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
