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

    new APICall("documents/create")
        .authorize()
        .post()
        .params({
            title: title,
            content: content
        })
        .onSuccess(document => {
            new APICall("posts/create")
                .authorize()
                .post()
                .params({
                    document: document.id
                })
                .onSuccess(post => {
                    new Vue({
                        el: "#created-post",
                        data: post
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

                    hideLoader();
                })
        })
        .execute();
});
