$(() => {
    console.log("Loading template of boards");
    $("#wrapper").load("view/boards.html", () => {
        hideLoader();
    });
});
