document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");

    window.onclick = (event) => {
        const openModals = document.querySelectorAll('.modal-window__open');
        openModals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('modal-window__open');
                body.classList.remove('body__modal-open');
            }
        });
    };

    initModal(body, "rules", "rulesOpenButton", "rulesCloseButton");
    initModal(body, "calculator", "calculatorOpenButton", "calculatorCloseButton");
});

function initModal(body, modalClass, openButtonId, closeButtonId) {
    const modal = document.querySelector(`.${modalClass}`);
    const openButton = document.querySelector(`#${openButtonId}`);
    const closeButton = document.querySelector(`#${closeButtonId}`);

    openButton.onclick = () => {
        modal.classList.add('modal-window__open');
        body.classList.add('body__modal-open');
    };

    closeButton.onclick = () => {
        modal.classList.remove('modal-window__open');
        body.classList.remove('body__modal-open');
    };
}