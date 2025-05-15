document.addEventListener('DOMContentLoaded', () => {
    const swiperConfig = {
        slidesPerView: 3,
        spaceBetween: 10,
        centeredSlides: true,
        grabCursor: true,
        keyboard: true,
        fade: true,
        mousewheel: {
            enabled: true,
        },

        pagination: {
            dynamicBullets: true,
        },

        breakpoints: {
            0: { slidesPerView: 1 },
            600: { slidesPerView: 2 },
            1000: { slidesPerView: 3 },
        },
    };

    document.querySelectorAll('.swiper-container').forEach((swiperContainer) => {
        const parent = swiperContainer.parentElement;

        const config = {
            ...swiperConfig,
            navigation: {
                nextEl: parent.querySelector('.swiper-button-next'),
                prevEl: parent.querySelector('.swiper-button-prev'),
            },
            pagination: {
                el: parent.querySelector('.swiper-pagination'),
                ...swiperConfig.pagination,
            },
        };

        new Swiper(swiperContainer, config);
    });
});

