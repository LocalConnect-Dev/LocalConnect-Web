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
        },
        filters: {
            i18n: error => window.errorDb[error]
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

const commonOnClick = () => {
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
    onClick("#font-small", () => {
        $("body").attr("class", "");
        $(".font-control").removeClass("active");
        $("#font-small").addClass("active");
    });

    onClick("#font-medium", () => {
        $("body").attr("class", "font-medium");
        $(".font-control").removeClass("active");
        $("#font-medium").addClass("active");
    });

    onClick("#font-large", () => {
        $("body").attr("class", "font-large");
        $(".font-control").removeClass("active");
        $("#font-large").addClass("active");
    });

    onClick(".join-event", e => {
        $("#joining-event").clone().prop("id", "joining-event-instance").appendTo("body");
        $("#joining-event-instance")
            .modal({
                closable: false,
                onApprove: () => {
                    showLoader();
                    window.isApproved = true;
                },
                onHidden: () => {
                    $("body > div:last-child").remove();

                    if (!window.isApproved) return;
                    new APICall("events/join")
                        .authorize()
                        .post()
                        .params({
                            event: $(e.currentTarget).data("event")
                        })
                        .onSuccess(attendance => {
                            hideLoader();

                            $("#joined-event").clone().prop("id", "joined-event-instance").appendTo("body");
                            $("#joined-event-instance")
                                .modal({
                                    closable: false,
                                    onApprove: () => {
                                        showLoader();
                                        move(URI("/event.view?id=" + attendance.event.id, location.href));
                                    },
                                    onHidden: () => {
                                        $("body > div:last-child").remove();
                                    }
                                })
                                .modal("show");
                        })
                        .execute();
                }
            })
            .modal("show");
    });

    onClick(".like-post", e => {
        const button = $(e.currentTarget);
        button.addClass("loading disabled");

        new APICall("posts/like")
            .authorize()
            .post()
            .params({
                post: button.data("post")
            })
            .onSuccess(() => {
                button.removeClass("loading");
                button.removeClass("red");
                button.children("i").attr("class", "check icon");

                const label = button.parent().children("label");
                label.text(parseInt(label.text()) + 1);
            })
            .execute();
    });
};

const offClick = () => {
    $("body").off("click");
};

const resetClick = () => {
    offClick();
    commonOnClick();
};

const loadView = uri => {
    console.log("Loading view");
    if (uri.suffix() === "view") {
        const name = uri.filename().split(".")[0];
        $.getScript("/js/" + name + ".js");
    }
};

const move = uri => {
    resetClick();
    loadView(uri);
    window.history.pushState(null, null, uri.toString());
};

const showLoader = () => {
    $("#loader").addClass("active");
};

const hideLoader = () => {
    $("#loader").removeClass("active");
};

Vue.filter('replaceLineBreaks', str => {
    return str.split("\n").join("<br>");
});

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

    console.log("Loading error database");
    fetch("/resources/errors.json")
        .then(response => response.json())
        .then(json => {
            window.errorDb = json;
        })
        .catch(error => {
            console.error(error);
        });

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
    commonOnClick();

    new APICall("users/me")
        .authorize()
        .onSuccess(user => {
            window.user = user;

            if (Cookies.get("LocalConnect-Session")) {
                if (location.href.endsWith("/")) {
                    move(URI("/boards.view", location.href));
                } else {
                    loadView(URI(location.href));
                }
            } else {
                move(URI("/login.view", location.href));
            }
        })
        .execute();
});
