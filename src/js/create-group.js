$(() => {
    console.log("Loading template of create-group");
    $("#wrapper").load("view/create-group.html", () => {
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

    const name = $("#name").val();
    const description = window.ckeditor.getData();

    let regionId = URI(location.href).search(true).region;
    let call =
        new APICall("groups/create")
            .authorize()
            .post()
            .params({
                name: name,
                description: description
            })
            .onSuccess(group => {
                $("#created-group").clone().prop("id", "created-group-instance").appendTo("body");

                const selector = "#created-group-instance";
                const element = $(selector);
                element.modal({
                    closable: false,
                    onApprove: () => {
                        move(URI("/groups.view?region=" + regionId, location.href));
                    },
                    onHidden: () => {
                        finalizeModal();
                    }
                }).modal("show");

                hideLoader();
            });

    if (regionId) {
        let params = call.getParams();
        params.region = regionId;
        call = call.params(params);
    } else {
        regionId = window.user.group.region.id;
    }

    call.execute();
});
