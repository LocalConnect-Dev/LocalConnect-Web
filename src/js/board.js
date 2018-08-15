$(() => {
    console.log("Loading template of board");
    $("#wrapper").load("view/board.html", () => {
        new APICall("boards/show")
            .authorize()
            .params({
                id: URI(location.href).search(true).id
            })
            .onSuccess(board => {
                new Vue({
                    el: "#board",
                    data: board,
                    filters: {
                        moment: date => moment.unix(date).fromNow()
                    }
                });

                hideLoader();
            })
            .execute();
    });
});