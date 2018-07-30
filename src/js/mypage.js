$(() => {
    console.log("Loading template of mypage");
    $("#wrapper").load("view/mypage.html", () => {
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

                hideLoader();
            })
            .catch(error => {
                console.error(error);
            });
    });
});