$(() => {
    console.log("Loading template of users");
    $("#wrapper").load("view/users.html", () => {
        let call =
            new APICall("users/list")
                .authorize()
                .onSuccess(users => {
                    new Vue({
                        el: "#users",
                        data: {
                            users: users
                        }
                    });

                    hideLoader();
                });

        const group = URI(location.href).search(true).group;
        if (group) {
            call = call.params({
                group: group
            });
        }

        call.execute();
    });
});