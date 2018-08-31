$(() => {
    console.log("Loading template of groups");
    $("#wrapper").load("view/groups.html", () => {
        let call =
            new APICall("groups/list")
                .authorize()
                .onSuccess(groups => {
                    new Vue({
                        el: "#groups",
                        data: {
                            groups: groups
                        }
                    });

                    hideLoader();
                });

        const region = URI(location.href).search(true).region;
        if (region) {
            call = call.params({
                region: region
            });
        }

        call.execute();
    });
});