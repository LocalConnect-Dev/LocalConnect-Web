$(() => {
    console.log("Loading template of login");
    $("#wrapper").load("view/posts.html", () => {
        new APICall("posts/list_group")
            .authorize()
            .onSuccess(posts => {
                new Vue({
                    el: "#posts",
                    data: {
                        posts: posts
                    }
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#create", () => {
    showLoader();
    move(URI("/create-post.view", location.href));
});
