$(() => {
    const loader = $("#loader");
    loader.addClass("active");

    fetch("https://api.local-connect.ga/profiles/mine", {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "X-LocalConnect-Session": Cookies.get("LocalConnect-Session")
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json.error);

            if (json.error) {
                fetchError(json);
            } else {
                new Vue({
                    el: "#profile",
                    data: json
                });
            }

            loader.removeClass("active");
        })
        .catch(error => {
            console.error(error);
        });
});