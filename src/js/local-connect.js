$(() => {
    console.log("Hello, Local Connect!");

    if (navigator.appVersion.indexOf("Win") === -1) {
        console.log("Not Windows, applying Migu font CSS");
        $('head').append('<link rel="stylesheet" href="css/migu.css">');
    }
});

$(".keyboard > .button").click((e) => {
    const token = $("#token");
    token.val(token.val() + e.currentTarget.innerText);
});

$("#backspace").click(() => {
    const textarea = $("#token");
    textarea.val(textarea.val().substring(0, textarea.val().length - 1));
});