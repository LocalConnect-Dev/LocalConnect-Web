$(() => {
    console.log("Loading template of login");
    $("#wrapper").load("view/posts.html", () => {
        fetch("https://api.local-connect.ga/posts/list_group", {
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
                        el: "#posts",
                        data: {
                            posts: json
                        }
                    });
                }

                hideLoader();
            })
            .catch(error => {
                console.error(error);
            });
    });
});