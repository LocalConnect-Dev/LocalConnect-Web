class APICall {
    static get BASE_URI() {
        return "https://api.local-connect.ga/";
    }

    constructor(path) {
        this.tmp = {};
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

    delete() {
        this.options.method = "DELETE";

        return this;
    }

    body(body) {
        this.options.body = body;

        return this;
    }

    params(params) {
        this.tmp.params = params;
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

    onError(errorCallback) {
        this.errorCallback = errorCallback;

        return this;
    }

    execute() {
        return fetch(APICall.BASE_URI + this.path, this.options)
            .then(response => response.status === 204 ? null : response.json())
            .then(obj => {
                if (obj && obj.error) {
                    let result;
                    if (this.errorCallback) {
                        result = this.errorCallback(obj.error);
                    }

                    if (!result) {
                        fetchError(obj.error);
                    }

                    return;
                }

                this.callback(obj);
            });
    }

    getParams() {
        return this.tmp.params;
    }
}

const setCookieForever = (key, value) => {
    Cookies.set(key, value, {expires: 9999999});
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

const finalizeModal = () => {
    $("body > div:last-child").remove();

    $("body").removeClass("dimmable");
    window.addEventListener("touchmove", event => {
        event.stopPropagation();
    }, true);
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
            i18n: error => {
                const localized = window.errorDb[error];
                return localized ? localized : "エラーコード: " + error;
            }
        }
    });

    const element = $(selector);
    element.modal({
        closable: false,
        onDeny: () => {
            if (error === "INVALID_SESSION_SECRET") {
                $("#logout").click();
            }
        },
        onHidden: () => {
            finalizeModal();
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
                summary: str => {
                    const striped = $("<div>").html(str.replace(/<(?:.|\n)*?>/gm, '')).text();
                    return striped.length > 32 ? striped.substr(0, 32) + "…" : striped;
                }
            }
        });

        $("#boards-block-instance").removeAttr("id");
    }
};

const renderBoardReads = reads => {
    new Vue({
        el: "#board-reads",
        data: {
            reads: reads
        },
        filters: {
            count: reads => reads.length
        }
    });

    hideLoader();
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
                month: date => moment.unix(date).format("M"),
                day: date => moment.unix(date).format("D"),
                dayOfWeek: date => moment.unix(date).format("dd"),
                time: date => moment.unix(date).format("H時 m分"),
                summary: str => {
                    const striped = $("<div>").html(str.replace(/<(?:.|\n)*?>/gm, '')).text();
                    return striped.length > 32 ? striped.substr(0, 32) + "…" : striped;
                }
            }
        });

        $(".join-event").each((index, element) => {
            const button = $(element);
            const event = events.filter(event => event.id === button.data("event"))[0];
            if (!event) return;
            if (event.attendances.filter(attendance => attendance.user.id === window.user.id).length > 0) {
                button.addClass("disabled");
                button.removeClass("positive");
                button.children("i").attr("class", "check icon");
                button.children("span").text("参加登録済み");
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

const renderMypage = profile => {
    new APICall("posts/list_user")
        .authorize()
        .onSuccess(posts => {
            new Vue({
                el: "#profile",
                data: {
                    avatar: window.user.avatar,
                    profile: profile
                }
            });

            renderPosts(posts);
            hideLoader();
        })
        .execute();
};

const renderGroup = group => {
    new Vue({
        el: "#group",
        data: group,
        filters: {
            moment: date => moment.unix(date).fromNow()
        }
    });

    hideLoader();
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

        const target = $(e.currentTarget);
        if (target.hasClass("disable-link")) {
            return false;
        }

        let uri;
        if (Cookies.get("LocalConnect-Session")) {
            const path = target.attr("href");
            uri = URI(path, location.href);
        } else {
            uri = URI("/login.view", location.href);
        }

        showLoader();
        move(uri);

        return false;
    });

    onClick("#open-settings", () => {
        $("#settings").clone().prop("id", "settings-instance").appendTo("body");
        $("#settings-instance")
            .modal({
                closable: false,
                onHidden: () => {
                    finalizeModal();

                    if (window.reloadAfterModalClosed) {
                        showLoader();
                        location.reload();
                    }
                }
            })
            .modal("show");
    });

    onClick("#go-top", () => {
        $("html, body").animate({scrollTop: 0}, "ease");
    });

    onClick("#go-home", () => {
        showLoader();

        if (Cookies.get("LocalConnect-Session")) {
            console.log("logged in");
            move(URI("/group.view", location.href));
        } else {
            console.log("not logged in");
            move(URI("/over.view", location.href));
        }
    });

    onClick("#go-to-panel", () => {
        $("#settings-instance").modal("hide");
        showLoader();

        let path;
        if (hasPermission("read_regions")) {
            path = "/regions.view";
        } else if (hasPermission("read_groups")) {
            path = "/groups.view";
        } else if (hasPermission("read_users")) {
            path = "/users.view";
        } else {
            return;
        }

        move(URI(path, location.href));
    });

    onClick("#logout", () => {
        $("#settings-instance").modal("hide");
        showLoader();

        if (window.user) {
            new APICall("sessions/destroy")
                .authorize()
                .delete()
                .onSuccess(() => {
                    disconnectSocket();
                    finalizeLoggedOut();
                })
                .execute();
        } else {
            finalizeLoggedOut();
        }
    });

    onClick("#font-small", () => {
        setFontSmall();
        setCookieForever("LocalConnect-FontControl", "font-small");
        window.reloadAfterModalClosed = true;
    });

    onClick("#font-medium", () => {
        setFontMedium();
        setCookieForever("LocalConnect-FontControl", "font-medium");
        window.reloadAfterModalClosed = true;
    });

    onClick("#font-large", () => {
        setFontLarge();
        setCookieForever("LocalConnect-FontControl", "font-large");
        window.reloadAfterModalClosed = true;
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
                    finalizeModal();

                    if (!window.isApproved) return;
                    new APICall("events/join")
                        .authorize()
                        .post()
                        .params({
                            event: $(e.currentTarget).data("event")
                        })
                        .onSuccess(event => {
                            hideLoader();

                            $("#joined-event").clone().prop("id", "joined-event-instance").appendTo("body");
                            $("#joined-event-instance")
                                .modal({
                                    closable: false,
                                    onApprove: () => {
                                        showLoader();
                                        move(URI("/event.view?id=" + event.id, location.href));
                                    },
                                    onHidden: () => {
                                        finalizeModal();
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
    window.previousUri = uri.toString();

    console.log("Loading view");
    if (uri.suffix() === "view") {
        const name = uri.pathname().split(".")[0];
        $.getScript("/js/" + name + ".js");
        window.scrollTo(0, 0);

        const nav = $(".nav-column");
        nav.removeClass("active");
        nav.each((index, element) => {
            const column = $(element);
            if (column.attr("href").indexOf(name) === 0) {
                column.addClass("active");
            }
        });
    }
};

const move = uri => {
    if (window.isWritingMode) {
        hideLoader();
        checkMoving(() => {
            showLoader();
            moveConfirm(uri);
        });

        return;
    }

    moveConfirm(uri);
};

const checkMoving = callback => {
    $("#moving-page").clone().prop("id", "moving-page-instance").appendTo("body");
    $("#moving-page-instance")
        .modal({
            closable: false,
            onDeny: () => {
                window.isWritingMode = false;
                callback();
            },
            onHidden: () => {
                finalizeModal();
            }
        })
        .modal("show");
};

const moveConfirm = uri => {
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

const encodeToken = token => {
    let result = "";

    [].forEach.call(token, ch => {
        result = result.concat(window.kanaDb[ch]);
    });

    console.log(result);
    return result;
};

const decodeToken = token => {
    let result = "";

    [].forEach.call(token, ch => {
        Object.keys(window.kanaDb).forEach(key => {
            if (window.kanaDb[key] === ch) {
                result = result.concat(key);
            }
        });
    });

    console.log(result);
    return result;
};

const createEditor = (selector, callback) => {
    if (window.ckeditor) {
        window.ckeditor.destroy()
            .then(() => {
                window.ckeditor = null;
            })
            .catch(error => {
                console.error(error);
            });
    }

    ClassicEditor
        .create(document.querySelector(selector), {
            language: "ja"
        })
        .then(editor => {
            console.log(editor);
            window.ckeditor = editor;

            callback(editor);
        })
        .catch(error => {
            console.error(error);
        });
};

const notify = (title, body, onclick) => {
    const notification = new Notification(title, {
        body: body,
        icon: "/img/icon-shadow.png"
    });
    notification.onclick = onclick;

    setTimeout(notification.close.bind(notification), 60000);
};

const speech = message => {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = message;
    utterance.lang = "ja-JP";

    speechSynthesis.speak(utterance);
};

const hasPermission = name => {
    if (!window.user) return false;
    return !!window.user.type.permissions.filter(permission => permission.name === name)[0];
};

const checkPermissions = () => {
    $(".require-permission").each((index, element) => {
        const object = $(element);
        if (hasPermission(object.data("permission"))) {
            object.removeClass("require-permission");
            object.addClass("permission-approved");
        }
    });
};

const connectSocket = () => {
    if ("Notification" in window) {
        Notification
            .requestPermission()
            .then(result => {
                if (result !== "default" && result !== "denied") {
                    console.log("Notification enabled");

                    const connection = new WebSocket("wss://api.local-connect.ga/socket", [Cookies.get("LocalConnect-Session")]);
                    connection.onopen = event => {
                        console.log("Connected to WebSocket server");
                    };
                    connection.onmessage = event => {
                        const notification = JSON.parse(event.data);
                        const type = notification.type;
                        const object = notification.object;
                        if (type === "KeepAlive") {
                            console.log("Keep-Alive");
                            return;
                        }

                        console.log("Notification received");
                        if (type === "Board") {
                            speech("新しいかいらんばんが配信されました。通知をクリックまたはタップすると表示します。");
                            notify(
                                "新しい回覧板が配信されました",
                                object.document.title,
                                () => {
                                    showLoader();
                                    move(URI("/board.view?id=" + object.id, location.href));
                                }
                            );
                        } else if (type === "Event") {
                            speech("新しいイベントが公開されました。通知をクリックまたはタップすると表示します。");
                            notify(
                                "新しいイベントが公開されました",
                                object.document.title,
                                () => {
                                    showLoader();
                                    move(URI("/event.view?id=" + object.id, location.href));
                                }
                            )
                        }
                    };
                    connection.onclose = event => {
                        if (event.code !== 1006) {
                            return;
                        }

                        notify(
                            "サーバから切断されました",
                            "クリックまたはタップしてサーバへ再接続してください。",
                            () => {
                                location.reload();
                            }
                        );
                    };

                    window.connection = connection;
                }
            });
    }
};

const disconnectSocket = () => {
    window.connection.close();
};

const checkGoToPanel = () => {
    if (hasPermission("read_regions") ||
        hasPermission("read_groups") ||
        hasPermission("read_users")) {
        $("#go-to-panel").removeClass("require-permission");
    }
};

const finalizeLoggedOut = () => {
    window.user = undefined;
    Cookies.remove("LocalConnect-Session");

    const approved = $(".permission-approved");
    approved.addClass("require-permission");
    approved.removeClass("permission-approved");

    $(".logged-in").addClass("hidden");
    $(".not-logged-in").removeClass("hidden");

    move(URI("/over.view", location.href));
};

Vue.filter('replaceLineBreaks', str => {
    return str.split("\n").join("<br>");
});

$(document).ajaxError(() => {
    hideLoader();
    fetchError("ページを読み込めませんでした");
});

$(() => {
    window.previousUri = location.href;
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

    console.log("Loading templates");
    $("#templates").load("view/templates.html");

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

    if (Cookies.get("LocalConnect-Session")) {
        connectSocket();
        $(".logged-in").removeClass("hidden");

        new APICall("users/me")
            .authorize()
            .onSuccess(user => {
                window.user = user;
                checkGoToPanel();

                if (location.href.endsWith("/")) {
                    move(URI("/boards.view", location.href));
                } else {
                    loadView(URI(location.href));
                }
            })
            .execute();
    } else {
        $(".not-logged-in").removeClass("hidden");

        const name = URI(location.href).pathname().split(".")[0];
        if (name === "/login" || name === "/over") {
            loadView(URI(location.href));
        } else {
            move(URI("/over.view", location.href));
        }
    }
});

window.onpopstate = event => {
    if (event) {
        const uri = URI(location.href);
        if (window.isWritingMode) {
            window.history.pushState(null, null, window.previousUri);

            checkMoving(() => {
                showLoader();
                moveConfirm(uri);
            });

            return;
        }

        showLoader();
        loadView(uri);
    }
};
