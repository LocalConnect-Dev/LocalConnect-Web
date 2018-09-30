$(() => {
    console.log("Loading template of create-board");
    $("#wrapper").load("view/create-board.html", () => {
        if (window.ckeditor) {
            window.ckeditor.destroy()
                .then(() => {
                    window.ckeditor = null;
                })
                .catch(error => {
                    console.error(error);
                });
        }

        ClassicEditor
            .create(document.querySelector("#editor"), {
                language: "ja"
            })
            .then(editor => {
                console.log(editor);
                window.ckeditor = editor;
            })
            .catch(error => {
                console.error(error);
            });

        hideLoader();
    });
});

onClick("#submit", () => {
    showLoader();

    const title = $("#title").val();
    const content = window.ckeditor.getData();

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
