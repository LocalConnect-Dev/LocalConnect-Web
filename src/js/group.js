$(() => {
    console.log("Loading template of group");
    $("#wrapper").load("view/group.html", () => {
        const id = URI(location.href).search(true).id;
        if (id) {
            new APICall("groups/show")
                .authorize()
                .params({
                    id: id
                })
                .onSuccess(group => {
                    renderGroup(group);
                })
                .execute();
        } else {
            renderGroup(window.user.group);
        }
    });
});