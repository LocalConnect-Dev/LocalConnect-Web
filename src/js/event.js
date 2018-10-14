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
                    el: "#event",
                    data: event,
                    filters: {
                        moment: date => moment.unix(date).fromNow(),
                        year: date => moment.unix(date).format("Y"),
                        month: date => moment.unix(date).format("MM"),
                        day: date => moment.unix(date).format("DD"),
                        dayOfWeek: date => moment.unix(date).format("dd"),
                        time: date => moment.unix(date).format("kk:mm"),
                        count: attendances => attendances.length
                    }
                });

                const button = $(".join-event");
                if (event.attendances.filter(attendance => attendance.user.id === window.user.id).length > 0) {
                    button.addClass("disabled");
                    button.removeClass("positive");
                    button.children("i").attr("class", "check icon");
                    button.children("span").text("参加登録済み");
                }

                hideLoader();
            })
            .execute();
    });
});
