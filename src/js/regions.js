$(() => {
    console.log("Loading template of regions");
    $("#wrapper").load("view/regions.html", () => {
        new APICall("regions/list")
            .authorize()
            .onSuccess(regions => {
                new Vue({
                    el: "#regions",
                    data: {
                        regions: regions
                    }
                });

                hideLoader();
            })
            .execute();
    });
});