$(() => {
    console.log("Loading template of create-profile");
    $("#wrapper").load("view/create-profile.html", () => {
        new APICall("profiles/mine")
            .authorize()
            .onSuccess(profile => {
                new Vue({
                    el: "#create-profile",
                    data: profile
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#submit", () => {
    showLoader();

    const hobbies = $("#hobbies").val();
    const favorites = $("#favorites").val();
    const mottoes = $("#mottoes").val();

    new APICall("profiles/create")
        .authorize()
        .post()
        .params({
            hobbies: hobbies,
            favorites: favorites,
            mottoes: mottoes
        })
        .onSuccess(profile => {
            $("#created-profile")
                .modal({
                    closable: false,
                    onApprove: () => {
                        showLoader();
                        move(URI("/mypage.view", location.href));
                    }
                })
                .modal("show");

            hideLoader();
        })
        .execute();
});
