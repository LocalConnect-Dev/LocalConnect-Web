$(() => {
    console.log("Loading template of events");
    $("#wrapper").load("view/events.html", () => {
        new APICall("events/list")
            .authorize()
            .onSuccess(events => {
                new Vue({
                    el: "#events",
                    data: {
                        events: events
                    },
                    filters: {
                        year: date => moment.unix(date).format("Y"),
                        month: date => moment.unix(date).format("MM"),
                        day: date => moment.unix(date).format("DD"),
                        dayOfWeek: date => moment.unix(date).format("dd"),
                        time: date => moment.unix(date).format("kk:mm")
                    }
                });

                hideLoader();
            })
            .execute();
    });
});
