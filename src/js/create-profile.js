$(() => {
    console.log("Loading template of create-profile");
    $("#wrapper").load("view/create-profile.html", () => {
        window.isWritingMode = true;
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
    window.isWritingMode = false;

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
    const input =
        $("<input>")
            .attr("class", "hidden")
            .attr("type", "file")
            .attr("accept", "image/*")
            .on("change", event => {
                showLoader();

                const reader = new FileReader();
                reader.onload = () => {
                    input.remove();

                    new APICall("images/create")
                        .authorize()
                        .post()
                        .body(reader.result)
                        .onSuccess(image => {
                            const avatarNotSet = $("#avatar-not-set");
                            if (avatarNotSet.length) {
                                $("<img>")
                                    .attr("id", "preview")
                                    .attr("class", "ui avatar medium circular image")
                                    .appendTo(avatarNotSet.parent());

                                avatarNotSet.remove();
                            }

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
            });

    input.appendTo("body");
    input.click();
});