$(() => {
    console.log("Loading template of create-post");
    $("#wrapper").load("view/create-post.html", () => {
        hideLoader();
    });
});

onClick("#submit", () => {
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
                    $("#created-post").clone().prop("id", "created-post-instance").appendTo("body");

                    const selector = "#created-post-instance";
                    new Vue({
                        el: selector,
                        data: post
                    });

                    const element = $(selector);
                    element.modal({
                        closable: false,
                        onApprove: () => {
                            move(URI("/posts.view", location.href));
                        },
                        onHidden: () => {
                            $("body > div:last-child").remove();
                        }
                    }).modal("show");

                    hideLoader();
                })
                .execute();
        })
        .execute();
});
