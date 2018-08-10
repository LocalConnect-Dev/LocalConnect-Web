$(() => {
    console.log("Loading template of create-post");
    $("#wrapper").load("view/create-post.html", () => {
        hideLoader();
    });
});

$("body").on("click", "#submit", () => {
    showLoader();

    const title = $("#title").val();
    const content = $("#content").val();

    fetch("https://api.local-connect.ga/documents/create", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "X-LocalConnect-Session": Cookies.get("LocalConnect-Session")
        },
        body: encodeURI("title=" + title + "&content=" + content)
    })
        .then(response => response.json())
        .then(json => {
            console.log(json.error);

            if (json.error) {
                fetchError(json);
            } else {
                fetch("https://api.local-connect.ga/posts/create", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "X-LocalConnect-Session": Cookies.get("LocalConnect-Session")
                    },
                    body: encodeURI("document=" + json.id)
                })
                    .then(response => response.json())
                    .then(json => {
                        console.log(json.error);

                        if (json.error) {
                            fetchError(json);
                        } else {
                            new Vue({
                                el: "#created-post",
                                data: json
                            });

                            $("#created-post")
                                .modal({
                                    closable: false,
                                    onApprove: () => {
                                        showLoader();
                                        move(URI("/posts.view", location.href));
                                    }
                                })
                                .modal("show");
                        }

                        hideLoader();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }

            hideLoader();
        })
        .catch(error => {
            console.error(error);
        });
});
