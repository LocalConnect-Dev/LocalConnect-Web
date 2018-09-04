$(() => {
    console.log("Loading template of events");
    $("#wrapper").load("view/events.html", () => {
        new APICall("events/list")
            .authorize()
            .onSuccess(events => {
                new APICall("events/list_joined")
                    .authorize()
                    .onSuccess(joined => {
                        new Vue({
                            el: "#joined-events",
                            data: {
                                events: joined
                            },
                            filters: {
                                year: date => moment.unix(date).format("Y"),
                                month: date => moment.unix(date).format("MM"),
                                day: date => moment.unix(date).format("DD"),
                                dayOfWeek: date => moment.unix(date).format("dd"),
                                time: date => moment.unix(date).format("kk:mm"),
                                summary: str => str.substr(0, 32) + "…"
                            }
                        });

                        renderEvents(events);
                        hideLoader();
                    })
                    .execute();
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
