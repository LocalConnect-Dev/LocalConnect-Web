$(() => {
    console.log("Loading template of users");
    $("#wrapper").load("view/users.html", () => {
        let group;
        let call =
            new APICall("users/list")
                .authorize()
                .onSuccess(users => {
                    new Vue({
                        el: "#group-wrapper",
                        data: group
                    });

                    new Vue({
                        el: "#users",
                        data: {
                            users: users
                        }
                    });

                    hideLoader();
                });

        const groupId = URI(location.href).search(true).group;
        if (groupId) {
            new APICall("groups/show")
                .authorize()
                .params({
                    id: groupId
                })
                .onSuccess(g => {
                    group = g;

                    call = call.params({
                        group: group.id
                    });
                    call.execute();
                })
                .execute();
        } else {
            group = window.user.group;
            call.execute();
        }
    });
});