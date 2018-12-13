$(() => {
    console.log("Loading template of posts");
    $("#wrapper").load("view/posts.html", () => {
        checkPermissions();
        
        new APICall("posts/list_group")
            .authorize()
            .onSuccess(posts => {
                renderPosts(posts);
                hideLoader();
            })
            .execute();
    });
});

onScrollToEnd(() => {
    if (window.allLoaded) {
        return;
    }

    const extraLoader = $("#extra-loader");
    extraLoader.addClass("active");

    new APICall("posts/list_group")
        .authorize()
        .params({
            until: window.lastObject.id
        })
        .onSuccess(posts => {
            renderPosts(posts);
            extraLoader.removeClass("active");
        })
        .execute();
});
