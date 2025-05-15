document.addEventListener("DOMContentLoaded", function() {
    VanillaTilt.init(document.querySelectorAll(".item__content"), {
        reverse: true,
        transition: true,
        scale: 1.05,
        speed: 2000,
        max: 15,
    });
});
