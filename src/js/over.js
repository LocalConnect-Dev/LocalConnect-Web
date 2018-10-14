$(() => {
    console.log("Loading template of over");
    $("#wrapper").load("view/over.html", () => {
        new APICall("service/show")
            .onSuccess(service => {
                new Vue({
                    el: "#service",
                    data: service
                });

                hideLoader();
            })
            .execute();
    });
});
