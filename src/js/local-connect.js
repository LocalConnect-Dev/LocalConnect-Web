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

const setCookieForever = (key, value) => {
    Cookies.set(key, value, { expires: 9999999 });
};

const setFontSmall = () => {
    $("body").attr("class", "");
    $(".font-control").removeClass("active");
    $("#font-small").addClass("active");
};

const setFontMedium = () => {
    $("body").attr("class", "font-medium");
    $(".font-control").removeClass("active");
    $("#font-medium").addClass("active");
};

const setFontLarge = () => {
    $("body").attr("class", "font-large");
    $(".font-control").removeClass("active");
    $("#font-large").addClass("active");
};

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

const renderBoards = boards => {
    if (boards.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = boards[boards.length - 1];

        $("#boards-block")
            .clone()
            .attr("id", "boards-block-instance")
            .appendTo("#boards");

        new Vue({
            el: "#boards-block-instance",
            data: {
                boards: boards
            },
            filters: {
                moment: date => moment.unix(date).fromNow(),
                summary: str => str.substr(0, 32) + "…"
            }
        });

        $("#boards-block-instance").removeAttr("id");
    }
};

const renderEvents = events => {
    if (events.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = events[events.length - 1];

        $("#events-block")
            .clone()
            .attr("id", "events-block-instance")
            .appendTo("#events");

        new Vue({
            el: "#events-block-instance",
            data: {
                events: events
            },
            filters: {
                year: date => moment.unix(date).format("Y"),
                month: date => moment.unix(date).format("MM"),
                day: date => moment.unix(date).format("DD"),
                dayOfWeek: date => moment.unix(date).format("dd"),
                time: date => moment.unix(date).format("kk:mm"),
                summary: str => str.substr(0, 32) + "…"
            }
        });

        $("#events-block-instance").removeAttr("id");
    }
};

const renderPosts = posts => {
    if (posts.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = posts[posts.length - 1];

        $("#posts-block")
            .clone()
            .attr("id", "posts-block-instance")
            .appendTo("#posts");

        new Vue({
            el: "#posts-block-instance",
            data: {
                posts: posts
            },
            filters: {
                count: likes => likes.length
            }
        });

        $(".like-post").each((index, element) => {
            const button = $(element);
            const post = posts.filter(post => post.id === button.data("post"))[0];
            if (!post) return;
            if (post.likes.filter(like => like.user.id === window.user.id).length > 0) {
                button.addClass("disabled");
                button.removeClass("red");
                button.children("i").attr("class", "check icon");
            }
        });

        $("#posts-block-instance").removeAttr("id");
    }
};

const onClick = (selector, callback) => {
    $("body").on("click", selector, callback);
};

const onScrollToEnd = callback => {
    $(window).on("scroll", () => {
        const scrollHeight = $(document).height();
        const scrollPosition = $(window).height() + $(window).scrollTop();
        if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
            callback();
        }
    });
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
        setFontSmall();
        setCookieForever("LocalConnect-FontControl", "font-small");
    });

    onClick("#font-medium", () => {
        setFontMedium();
        setCookieForever("LocalConnect-FontControl", "font-medium");
    });

    onClick("#font-large", () => {
        setFontLarge();
        setCookieForever("LocalConnect-FontControl", "font-large");
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

const offScroll = () => {
    $(window).off("scroll");
};

const resetEvents = () => {
    offClick();
    offScroll();
    commonOnClick();
};

const resetVariables = () => {
    window.allLoaded = false;
    window.lastObject = undefined;
};

const loadView = uri => {
    console.log("Loading view");
    if (uri.suffix() === "view") {
        const name = uri.filename().split(".")[0];
        $.getScript("/js/" + name + ".js");
    }
};

const move = uri => {
    resetEvents();
    resetVariables();
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

    console.log("Applying font control");
    const fontControl = Cookies.get("LocalConnect-FontControl");
    if (fontControl === "font-medium") {
        setFontMedium();
    } else if (fontControl === "font-large") {
        setFontLarge();
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
