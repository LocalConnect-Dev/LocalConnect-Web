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
