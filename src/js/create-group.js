$(() => {
    console.log("Loading template of create-group");
    $("#wrapper").load("view/create-group.html", () => {
        hideLoader();
    });
});

onClick("#submit", () => {
    showLoader();

    const name = $("#name").val();
    new APICall("groups/create")
        .authorize()
        .post()
        .params({
            name: name
        })
        .onSuccess(group => {
            $("#created-group").clone().prop("id", "created-group-instance").appendTo("body");

            const selector = "#created-group-instance";
            const element = $(selector);
            element.modal({
                closable: false,
                onApprove: () => {
                    move(URI("/groups.view", location.href));
                },
                onHidden: () => {
                    $("body > div:last-child").remove();
                }
            }).modal("show");

            hideLoader();
        })
        .execute();
});
