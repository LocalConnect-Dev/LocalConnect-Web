$(() => {
    console.log("Loading template of create-event");
    $("#wrapper").load("view/create-event.html", () => {
        window.isWritingMode = true;
        window.attachments = [];

        createEditor("#editor", () => {
            hideLoader();
        });

        const now = new Date();
        $("#year").val(now.getFullYear());
        $("#month").val(now.getMonth());
        $("#day").val(now.getDate());
        $("#hour").val(now.getHours());
        $("#minute").val(now.getMinutes());
    });
});

onClick("#submit", () => {
    showLoader();
    window.isWritingMode = false;

    const title = $("#title").val();
    const content = window.ckeditor.getData();
    const date = Math.floor(
        new Date(
            $("#year").val(),
            $("#month").val(),
            $("#day").val(),
            $("#hour").val(),
            $("#minute").val(),
            0
        ).getTime() / 1000
    );

    const attachmentIds = [];
    window.attachments.forEach(attachment => {
        attachmentIds.push(attachment.id);
    });

    new APICall("documents/create")
        .authorize()
        .post()
        .params({
            title: title,
            content: content,
            attachments: attachmentIds
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
                        new APICall("attachments/create")
                            .authorize()
                            .post()
                            .params({
                                type: "Image",
                                object_id: image.id
                            })
                            .onSuccess(attachment => {
                                window.attachments.push(attachment);

                                const element =
                                    $("#attachment-template")
                                        .clone()
                                        .removeAttr("id")
                                        .data("id", attachment.id);
                                element.appendTo("#attachments");

                                new Vue({
                                    el: element.get(0),
                                    data: attachment
                                });

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

onClick(".delete-attachment", event => {
    const id = $(event.currentTarget).data("id");
    window.attachments = window.attachments.filter(attachment => attachment.id !== id);

    $("#attachments")
        .children()
        .each((index, element) => {
            const attachment = $(element);
            if (attachment.data("id") === id) {
                attachment.remove();
            }
        });
});
