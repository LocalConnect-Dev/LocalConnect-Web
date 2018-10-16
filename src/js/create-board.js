$(() => {
    console.log("Loading template of create-board");
    $("#wrapper").load("view/create-board.html", () => {
        window.isWritingMode = true;
        window.attachments = [];

        createEditor("#editor", () => {
            new APICall("events/list")
                .authorize()
                .onSuccess(events => {
                    new Vue({
                        el: "#attachable-events",
                        data: {
                            events: events
                        }
                    });

                    $('.ui.dropdown').dropdown({
                        onChange: eventId => {
                            showLoader();

                            new APICall("attachments/create")
                                .authorize()
                                .post()
                                .params({
                                    type: "Event",
                                    object_id: eventId
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
                                        data: attachment,
                                        filters: {
                                            moment: date => moment.unix(date).fromNow(),
                                            year: date => moment.unix(date).format("Y"),
                                            month: date => moment.unix(date).format("M"),
                                            day: date => moment.unix(date).format("D"),
                                            dayOfWeek: date => moment.unix(date).format("dd"),
                                            time: date => moment.unix(date).format("H時 m分"),
                                            summary: str => {
                                                const striped = $("<div>").html(str.replace(/<(?:.|\n)*?>/gm, '')).text();
                                                return striped.length > 32 ? striped.substr(0, 32) + "…" : striped;
                                            }
                                        }
                                    });

                                    hideLoader();
                                })
                                .execute();
                        }
                    });

                    hideLoader();
                })
                .execute();
        });
    });
});

onClick("#submit", () => {
    showLoader();
    window.isWritingMode = false;

    const title = $("#title").val();
    const content = window.ckeditor.getData();

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
            attachments: attachmentIds.join(",")
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
