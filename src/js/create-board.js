$(() => {
    console.log("Loading template of create-board");
    $("#wrapper").load("view/create-board.html", () => {
        hideLoader();
    });
});

onClick("#submit", () => {
    showLoader();

    const title = $("#title").val();
    const content = $("#content").val();

    new APICall("documents/create")
        .authorize()
        .post()
        .params({
            title: title,
            content: content
        })
        .onSuccess(document => {
            new APICall("boards/create")
                .authorize()
                .post()
                .params({
                    document: document.id
                })
                .onSuccess(board => {
                    $("#created-board").clone().prop("id", "created-board-instance").appendTo("body");
                    $("#created-board-instance")
                        .modal({
                            closable: false,
                            onApprove: () => {
                                showLoader();
                                move(URI("/board.view?id=" + board.id, location.href));
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
