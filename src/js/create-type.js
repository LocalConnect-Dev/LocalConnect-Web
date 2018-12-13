$(() => {
    console.log("Loading template of create-type");
    $("#wrapper").load("view/create-type.html", () => {
        new APICall("permissions/list")
            .authorize()
            .onSuccess(permissions => {
                new Vue({
                    el: "#permissions",
                    data: {
                        permissions: permissions
                    }
                });

                $(".ui.checkbox").checkbox();
                hideLoader();
            })
            .execute();
    });
});

onClick("#submit", () => {
    showLoader();

    const permissionIds = [];
    $(".permission-toggle").each((index, element) => {
        const toggle = $(element);
        if (toggle.prop("checked")) {
            permissionIds.push(toggle.data("id"));
        }
    });

    const name = $("#name").val();
    new APICall("types/create")
        .authorize()
        .post()
        .params({
            name: name,
            permissions: permissionIds.join(",")
        })
        .onSuccess(type => {
            hideLoader();

            $("#created-type").clone().prop("id", "created-type-instance").appendTo("body");
            $("#created-type-instance").modal({
                closable: false,
                onApprove: () => {
                    showLoader();
                    move(URI("/types.view", location.href));
                },
                onHidden: () => {
                    finalizeModal();
                }
            }).modal("show");
        })
        .execute();
});
