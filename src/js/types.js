$(() => {
    console.log("Loading template of types");
    $("#wrapper").load("view/types.html", () => {
        checkPermissions();

        new APICall("types/list")
            .authorize()
            .onSuccess(types => {
                new Vue({
                    el: "#types",
                    data: {
                        types: types
                    },
                    filters: {
                        join: permissions => {
                            const names = [];
                            permissions.forEach(permission => {
                                names.push(permission.name);
                            });

                            return names.join(", ");
                        }
                    }
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#back-to-panel", () => {
    $("#go-to-panel").click();
});
