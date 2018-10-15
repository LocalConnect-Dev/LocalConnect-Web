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
                    el: "#board-contents",
                    data: board,
                    filters: {
                        moment: date => moment.unix(date).fromNow()
                    }
                });

                new APICall("boards/reads")
                    .authorize()
                    .params({
                        id: board.id
                    })
                    .onSuccess(reads => {
                        if (!reads.filter(read => read.user.id === window.user.id)[0]) {
                            new APICall("boards/read")
                                .authorize()
                                .post()
                                .params({
                                    board: board.id
                                })
                                .onSuccess(read => {
                                    reads.push(read);
                                    renderBoardReads(reads);
                                })
                                .execute();
                        } else {
                            renderBoardReads(reads);
                        }

                        hideLoader();
                    })
                    .execute();
            })
            .execute();
    });
});