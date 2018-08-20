$(() => {
    console.log("Loading template of login");
    $("#wrapper").load("view/posts.html", () => {
        new APICall("posts/list_group")
            .authorize()
            .onSuccess(posts => {
                new Vue({
                    el: "#posts",
                    data: {
                        posts: posts
                    },
                    filters: {
                        count: likes => likes.length
                    }
                });

                $(".like-post").each((index, element) => {
                    const button = $(element);
                    const post = posts.filter(post => post.id === button.data("post"))[0];
                    if (post.likes.filter(like => like.user.id === window.user.id).length > 0) {
                        button.addClass("disabled");
                        button.removeClass("red");
                        button.children("i").attr("class", "check icon");
                    }
                });

                hideLoader();
            })
            .execute();
    });
});
