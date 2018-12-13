$(() => {
    console.log("Loading template of mypage");
    $("#wrapper").load("view/mypage.html", () => {
        checkPermissions();

        new APICall("profiles/mine")
            .authorize()
            .onSuccess(profile => {
                renderMypage(profile);
            })
            .onError(error => {
                if (error !== "PROFILE_NOT_FOUND") {
                    return false;
                }

                new APICall("profiles/create")
                    .authorize()
                    .post()
                    .params({
                        hobbies: "(未設定)",
                        favorites: "(未設定)",
                        mottoes: "(未設定)"
                    })
                    .onSuccess(profile => {
                        renderMypage(profile);
                    })
                    .execute();

                return true;
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
