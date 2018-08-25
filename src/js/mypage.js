$(() => {
    console.log("Loading template of mypage");
    $("#wrapper").load("view/mypage.html", () => {
        new APICall("profiles/mine")
            .authorize()
            .onSuccess(profile => {
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
