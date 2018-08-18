$(() => {
    console.log("Loading template of event");
    $("#wrapper").load("view/event.html", () => {
        new APICall("events/show")
            .authorize()
            .params({
                id: URI(location.href).search(true).id
            })
            .onSuccess(event => {
                new Vue({
                    el: "#document",
                    data: event.document,
                    filters: {
                        moment: date => moment.unix(date).fromNow()
                    }
                });

                new Vue({
                    el: "#event",
                    data: event,
                    filters: {
                        year: date => moment.unix(date).format("Y"),
                        month: date => moment.unix(date).format("MM"),
                        day: date => moment.unix(date).format("DD"),
                        dayOfWeek: date => moment.unix(date).format("dd"),
                        time: date => moment.unix(date).format("kk:mm")
                    }
                });

                new APICall("events/attendances")
                    .authorize()
                    .params({
                        event: event.id
                    })
                    .onSuccess(attendances => {
                        new Vue({
                            el: "#attendances",
                            data: {
                                attendances: attendances,
                                count: attendances.length
                            }
                        });

                        hideLoader();
                    })
                    .execute();
            })
            .execute();
    });
});

onClick("#join", () => {
    $("#joining-event").clone().prop("id", "joining-event-instance").appendTo("body");
    $("#joining-event-instance")
        .modal({
            closable: false,
            onApprove: () => {
                showLoader();
                window.isApproved = true;
            },
            onHidden: () => {
                $("body > div:last-child").remove();

                if (!window.isApproved) return;
                new APICall("events/join")
                    .authorize()
                    .post()
                    .params({
                        event: $("#join").data("event")
                    })
                    .onSuccess(attendance => {
                        hideLoader();

                        $("#joined-event").clone().prop("id", "joined-event-instance").appendTo("body");
                        $("#joined-event-instance")
                            .modal({
                                closable: false,
                                onApprove: () => {
                                    showLoader();
                                    move(URI("/event.view?id=" + attendance.event.id, location.href));
                                },
                                onHidden: () => {
                                    $("body > div:last-child").remove();
                                }
                            })
                            .modal("show");
                    })
                    .execute();
            }
        })
        .modal("show");
});
