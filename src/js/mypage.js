$(() => {
    console.log("Loading template of mypage");
    $("#wrapper").load("view/mypage.html", () => {
        new APICall("profiles/mine")
            .authorize()
            .onSuccess(profile => {
                new Vue({
                    el: "#profile",
                    data: profile
                });

                hideLoader();
            })
            .execute();
    });
});
