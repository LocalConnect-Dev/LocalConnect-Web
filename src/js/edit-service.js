$(() => {
    console.log("Loading template of edit-service");
    $("#wrapper").load("view/edit-service.html", () => {
        new APICall("service/show")
            .onSuccess(service => {
                createEditor("#editor", editor => {
                    editor.setData(service.description);
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#submit", () => {
    showLoader();

    const description = window.ckeditor.getData();
    new APICall("service/edit")
        .authorize()
        .post()
        .params({
            description: description
        })
        .onSuccess(service => {
            $("#edited-service").clone().prop("id", "edited-service-instance").appendTo("body");
            $("#edited-service-instance")
                .modal({
                    closable: false,
                    onApprove: () => {
                        showLoader();
                        move(URI("/regions.view"));
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
