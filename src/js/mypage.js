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
                            el: "#wrapper",
                            data: {
                                profile: profile,
                                posts: posts
                            }
                        });

                        hideLoader();
                    })
                    .execute();
            })
            .execute();
    });
});

onClick("#create", () => {
    showLoader();
    move(URI("/create-profile.view", location.href));
});
