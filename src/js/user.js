$(() => {
    console.log("Loading template of user");
    $("#wrapper").load("view/user.html", () => {
        const id = URI(location.href).search(true).id;
        new APICall("users/show")
            .authorize()
            .params({
                id: id
            })
            .onSuccess(user => {
                new APICall("profiles/show")
                    .authorize()
                    .params({
                        user: id
                    })
                    .onSuccess(profile => {
                        new APICall("posts/list_user")
                            .authorize()
                            .onSuccess(posts => {
                                new Vue({
                                    el: "#profile",
                                    data: {
                                        avatar: user.avatar,
                                        profile: profile
                                    }
                                });

                                renderPosts(posts);
                                hideLoader();
                            })
                            .execute();
                    })
                    .execute();
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

    new APICall("posts/list_user")
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
