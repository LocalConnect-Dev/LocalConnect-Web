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
                            el: "#mypage",
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
