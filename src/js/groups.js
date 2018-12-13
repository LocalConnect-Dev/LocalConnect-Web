$(() => {
    console.log("Loading template of groups");
    $("#wrapper").load("view/groups.html", () => {
        checkPermissions();

        let region;
        let call =
            new APICall("groups/list")
                .authorize()
                .onSuccess(groups => {
                    new Vue({
                        el: "#region-wrapper",
                        data: region
                    });

                    new Vue({
                        el: "#groups",
                        data: {
                            groups: groups
                        }
                    });

                    checkPermissions();
                    hideLoader();
                });

        const regionId = URI(location.href).search(true).region;
        if (regionId) {
            new APICall("regions/show")
                .authorize()
                .params({
                    id: regionId
                })
                .onSuccess(r => {
                    region = r;

                    call = call.params({
                        region: region.id
                    });
                    call.execute();
                })
                .execute();
        } else {
            region = window.user.group.region;
            call.execute();
        }
    });
});