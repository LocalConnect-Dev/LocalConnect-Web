$(() => {
    console.log("Loading template of regions");
    $("#wrapper").load("view/regions.html", () => {
        checkPermissions();

        new APICall("regions/list")
            .authorize()
            .onSuccess(regions => {
                new Vue({
                    el: "#regions",
                    data: {
                        regions: regions
                    }
                });

                checkPermissions();
                hideLoader();
            })
            .execute();
    });
});