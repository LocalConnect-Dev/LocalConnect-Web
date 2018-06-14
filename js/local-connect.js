$(() => {
    console.log("Hello, Local Connect!");

    if (navigator.appVersion.indexOf("Win") === -1) {
        console.log("Not Windows, applying Migu font CSS");
        $('head').append('<link rel="stylesheet" href="css/migu.css">');
    }
});