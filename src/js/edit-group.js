$(() => {
    console.log("Loading template of edit-group");
    $("#wrapper").load("view/edit-group.html", () => {
        checkPermissions();
        window.isWritingMode = true;

        new APICall("groups/show")
            .authorize()
            .params({
                id: URI(location.href).search(true).id
            })
            .onSuccess(group => {
                window.group = group;

                new Vue({
                    el: "#group",
                    data: group
                });

                createEditor("#editor", editor => {
                    editor.setData(group.description);
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#submit", () => {
    showLoader();
    window.isWritingMode = false;

    const name = $("#name").val();
    const description = window.ckeditor.getData();

    new APICall("groups/create")
        .authorize()
        .post()
        .params({
            id: window.group.id,
            name: name,
            description: description
        })
        .onSuccess(group => {
            $("#edited-group").clone().prop("id", "edited-group-instance").appendTo("body");

            const selector = "#edited-group-instance";
            const element = $(selector);
            element.modal({
                closable: false,
                onApprove: () => {
                    showLoader();
                    move(URI("/users.view?group=" + window.group.id, location.href));
                },
                onHidden: () => {
                    finalizeModal();
                }
            }).modal("show");

            hideLoader();
        })
        .execute();
});
