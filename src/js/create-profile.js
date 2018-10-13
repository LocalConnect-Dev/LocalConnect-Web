$(() => {
    console.log("Loading template of create-profile");
    $("#wrapper").load("view/create-profile.html", () => {
        new APICall("profiles/mine")
            .authorize()
            .onSuccess(profile => {
                new Vue({
                    el: "#create-profile",
                    data: {
                        avatar: window.user.avatar,
                        profile: profile
                    }
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
            $("#created-profile").clone().prop("id", "created-profile-instance").appendTo("body");
            $("#created-profile-instance")
                .modal({
                    closable: false,
                    onApprove: () => {
                        showLoader();
                        move(URI("/mypage.view", location.href));
                    },
                    onHidden: () => {
                        finalizeModal();
                    }
                })
                .modal("show");

            hideLoader();
        })
        .execute();
});

onClick("#open", () => {
    $("<input>")
        .attr("type", "file")
        .attr("accept", ".jpg, image/jpeg")
        .on("change", event => {
            showLoader();

            const reader = new FileReader();
            reader.onload = () => {
                new APICall("images/create")
                    .authorize()
                    .post()
                    .body(reader.result)
                    .onSuccess(image => {
                        $("#preview").attr("src", "//api.local-connect.ga/images/show?id=" + image.id);

                        new APICall("users/set_avatar")
                            .authorize()
                            .post()
                            .params({
                                avatar: image.id
                            })
                            .onSuccess(user => {
                                $("#set-avatar").clone().prop("id", "set-avatar-instance").appendTo("body");

                                const selector = "#set-avatar-instance";
                                const element = $(selector);
                                element.modal({
                                    closable: false,
                                    onHidden: () => {
                                        finalizeModal();
                                    }
                                }).modal("show");

                                hideLoader();
                            })
                            .execute();
                    })
                    .execute();
            };

            reader.readAsArrayBuffer(event.target.files[0]);
        })
        .click();
});