$(() => {
    console.log("Loading template of boards");
    $("#wrapper").load("view/boards.html", () => {
        new APICall("boards/list")
            .authorize()
            .onSuccess(boards => {
                new Vue({
                    el: "#boards",
                    data: {
                        boards: boards
                    },
                    filters: {
                        moment: date => moment.unix(date).fromNow(),
                        summary: str => str.substr(0, 32) + "…"
                    }
                });

                hideLoader();
            })
            .execute();
    });
});

onClick("#create", () => {
    showLoader();
    move(URI("/create-board.view", location.href));
});
