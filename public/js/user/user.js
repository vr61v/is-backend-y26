document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    document.querySelector('#id').textContent = userData.id;
    document.querySelector('#email').textContent = userData.email;

    const links = document.querySelectorAll('.account-nav__link');
    const sections = document.querySelectorAll('.account__section');

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            links.forEach(link => link.classList.remove('account-nav__link--active'));
            this.classList.add('account-nav__link--active');

            sections.forEach(section => section.classList.remove('account__section--active'));
            const targetSection = document.querySelector(this.getAttribute('href'));
            targetSection.classList.add('account__section--active');
        });
    });
});
