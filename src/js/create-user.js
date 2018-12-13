$(() => {
    console.log("Loading template of create-user");
    $("#wrapper").load("view/create-user.html", () => {
        checkPermissions();

        new APICall("types/list")
            .authorize()
            .onSuccess(types => {
                new Vue({
                    el: "#types",
                    data: {
                        types: types
                    }
                });

                $('.ui.dropdown').dropdown();
                hideLoader();
            })
            .execute();
    });
});

onClick("#submit", () => {
    showLoader();

    const name = $("#name").val();
    let groupId = URI(location.href).search(true).group;
    let call =
        new APICall("users/create")
            .authorize()
            .post()
            .params({
                name: name,
                type: $("#type").val()
            })
            .onSuccess(user => {
                $("#created-user").clone().prop("id", "created-user-instance").appendTo("body");

                const selector = "#created-user-instance";
                new Vue({
                    el: selector,
                    data: user,
                    filters: {
                        token: token => decodeToken(token)
                    }
                });

                const element = $(selector);
                element.modal({
                    closable: false,
                    onApprove: () => {
                        move(URI("/users.view?group=" + groupId, location.href));
                    },
                    onHidden: () => {
                        finalizeModal();
                    }
                }).modal("show");
            });

    if (groupId) {
        let params = call.getParams();
        params.group = groupId;
        call = call.params(params);
    } else {
        groupId = window.user.group.id;
    }

    call.execute();
});
