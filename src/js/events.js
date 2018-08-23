$(() => {
    console.log("Loading template of events");
    $("#wrapper").load("view/events.html", () => {
        new APICall("events/list")
            .authorize()
            .onSuccess(events => {
                renderEvents(events);
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

    new APICall("events/list")
        .authorize()
        .params({
            until: window.lastObject.id
        })
        .onSuccess(events => {
            renderEvents(events);
            extraLoader.removeClass("active");
        })
        .execute();
});
