const renderEvents = events => {
    if (events.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = events[events.length - 1];

        $("#events-block")
            .clone()
            .attr("id", "events-block-instance")
            .appendTo("#events");

        new Vue({
            el: "#events-block-instance",
            data: {
                events: events
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

        $("#events-block-instance").removeAttr("id");
    }
};

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
