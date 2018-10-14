$(() => {
    console.log("Loading template of create-event");
    $("#wrapper").load("view/create-event.html", () => {
        createEditor("#editor", () => {
            hideLoader();
        });
    });
});

onClick("#submit", () => {
    showLoader();

    const title = $("#title").val();
    const content = window.ckeditor.getData();
    const date = Math.floor(
        new Date(
            $("#year").val(),
            $("#month").val() - 1,
            $("#day").val(),
            $("#hour").val(),
            $("#minute").val(),
            0
        ).getTime() / 1000
    );

    new APICall("documents/create")
        .authorize()
        .post()
        .params({
            title: title,
            content: content
        })
        .onSuccess(document => {
            new APICall("events/create")
                .authorize()
                .post()
                .params({
                    document: document.id,
                    date: date
                })
                .onSuccess(event => {
                    $("#created-event").clone().prop("id", "created-event-instance").appendTo("body");
                    $("#created-event-instance")
                        .modal({
                            closable: false,
                            onApprove: () => {
                                showLoader();
                                move(URI("/event.view?id=" + event.id, location.href));
                            },
                            onHidden: () => {
                                finalizeModal();
                            }
                        })
                        .modal("show");

                    hideLoader();
                })
                .execute();
        })
        .execute();
});
