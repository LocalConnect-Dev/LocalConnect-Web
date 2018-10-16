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
                        moment: date => moment.unix(date).fromNow(),
                        year: date => moment.unix(date).format("Y"),
                        month: date => moment.unix(date).format("M"),
                        day: date => moment.unix(date).format("D"),
                        dayOfWeek: date => moment.unix(date).format("dd"),
                        time: date => moment.unix(date).format("H時 m分"),
                        summary: str => {
                            const striped = $("<div>").html(str.replace(/<(?:.|\n)*?>/gm, '')).text();
                            return striped.length > 32 ? striped.substr(0, 32) + "…" : striped;
                        }
                    }
                });

                const events = [];
                board.document.attachments.forEach(attachment => {
                    if (attachment.type === "Event") {
                        events.push(attachment.object);
                    }
                });

                $(".join-event").each((index, element) => {
                    const button = $(element);
                    const event = events.filter(event => event.id === button.data("event"))[0];
                    if (!event) return;
                    if (event.attendances.filter(attendance => attendance.user.id === window.user.id).length > 0) {
                        button.addClass("disabled");
                        button.removeClass("positive");
                        button.children("i").attr("class", "check icon");
                        button.children("span").text("参加登録済み");
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