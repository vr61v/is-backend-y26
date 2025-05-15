document.addEventListener("DOMContentLoaded", function () {
    const container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);

    const eventSources = {
        create: new EventSource("api/services/notification/create"),
        update: new EventSource("api/services/notification/update"),
        delete: new EventSource("api/services/notification/delete"),
    };

    const handleMessage = (type) => (event) => {
        try {
            const { name } = JSON.parse(event.data);
            const messages = {
                create: `На сайте появилась новая услуга "${name}".`,
                update: `Обновлена услуга "${name}".`,
                delete: `Удалена услуга "${name}".`,
            };
            showNotification(messages[type]);
        } catch (error) {
            console.error(`Ошибка обработки данных из потока ${type}:`, error);
        }
    };

    Object.entries(eventSources).forEach(([type, source]) => {
        source.onmessage = handleMessage(type);
        source.onerror = () => {
            console.error(`Ошибка подключения к потоку ${type}`);
        };
    });

    function showNotification(message) {
        const container = document.getElementById("notification-container");
        if (!container) {
            console.error("Ошибка: контейнер для уведомлений не найден!");
            return;
        }

        const notification = document.createElement("div");
        notification.classList.add("notification", "notification--enter");
        notification.innerHTML = `
            <span class="notification__text">${message}</span>
            <button class="notification__close">&times;</button>
        `;
        container.appendChild(notification);

        notification
            .querySelector(".notification__close")
            .addEventListener("click", () => {
                notification.classList.add("notification--exit");
                setTimeout(() => notification.remove(), 500);
            });

        setTimeout(() => {
            notification.classList.add("notification--exit");
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
});
