const renderBoards = boards => {
    if (boards.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = boards[boards.length - 1];

        $("#boards-block")
            .clone()
            .attr("id", "boards-block-instance")
            .appendTo("#boards");

        new Vue({
            el: "#boards-block-instance",
            data: {
                boards: boards
            },
            filters: {
                moment: date => moment.unix(date).fromNow(),
                summary: str => str.substr(0, 32) + "…"
            }
        });

        $("#boards-block-instance").removeAttr("id");
    }
};

$(() => {
    console.log("Loading template of boards");
    $("#wrapper").load("view/boards.html", () => {
        new APICall("boards/list")
            .authorize()
            .onSuccess(boards => {
                renderBoards(boards);
                hideLoader();
            })
            .execute();
    });
});

onScrollToEnd(() => {
    if (window.allLoaded) {
        return;
    }

    const extraLoader = $("#extra-loader");
    extraLoader.addClass("active");

    new APICall("boards/list")
        .authorize()
        .params({
            until: window.lastObject.id
        })
        .onSuccess(boards => {
            renderBoards(boards);
            extraLoader.removeClass("active");
        })
        .execute();
});
