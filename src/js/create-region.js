$(() => {
    console.log("Loading template of create-region");
    $("#wrapper").load("view/create-region.html", () => {
        hideLoader();
    });
});

onClick("#submit", () => {
    showLoader();

    const name = $("#name").val();
    new APICall("regions/create")
        .authorize()
        .post()
        .params({
            name: name
        })
        .onSuccess(region => {
            $("#created-region").clone().prop("id", "created-region-instance").appendTo("body");

            const selector = "#created-region-instance";
            const element = $(selector);
            element.modal({
                closable: false,
                onApprove: () => {
                    move(URI("/regions.view", location.href));
                },
                onHidden: () => {
                    $("body > div:last-child").remove();
                }
            }).modal("show");

            hideLoader();
        })
        .execute();
});
