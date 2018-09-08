$(() => {
    console.log("Loading template of create-user");
    $("#wrapper").load("view/create-user.html", () => {
        hideLoader();
    });
});

onClick("#submit", () => {
    showLoader();

    const name = $("#name").val();
    new APICall("users/create")
        .authorize()
        .post()
        .params({
            name: name
        })
        .onSuccess(user => {
            $("#created-user").clone().prop("id", "created-user-instance").appendTo("body");

            const selector = "#created-user-instance";
            new Vue({
                el: selector,
                data: user
            });

            const element = $(selector);
            element.modal({
                closable: false,
                onApprove: () => {
                    move(URI("/users.view", location.href));
                },
                onHidden: () => {
                    $("body > div:last-child").remove();
                }
            }).modal("show");
        })
        .execute();
});
