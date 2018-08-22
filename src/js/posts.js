const renderPosts = posts => {
    if (posts.length === 0) {
        window.allLoaded = true;
    } else {
        window.lastObject = posts[posts.length - 1];

        $("#posts-block")
            .clone()
            .attr("id", "posts-block-instance")
            .appendTo("#posts");

        new Vue({
            el: "#posts-block-instance",
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
            if (!post) return;
            if (post.likes.filter(like => like.user.id === window.user.id).length > 0) {
                button.addClass("disabled");
                button.removeClass("red");
                button.children("i").attr("class", "check icon");
            }
        });

        $("#posts-block-instance").removeAttr("id");
    }
};

$(() => {
    console.log("Loading template of posts");
    $("#wrapper").load("view/posts.html", () => {
        new APICall("posts/list_group")
            .authorize()
            .onSuccess(posts => {
                renderPosts(posts);
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

    new APICall("posts/list_group")
        .authorize()
        .params({
            until: window.lastObject.id
        })
        .onSuccess(posts => {
            renderPosts(posts);
            extraLoader.removeClass("active");
        })
        .execute();
});
