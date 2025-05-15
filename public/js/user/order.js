let ordersIsLoaded = false;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.account-nav__link[href="#order-history"]')
        ?.addEventListener('click', async (event) => {
            event.preventDefault();
            await loadOrderHistory();
        });

    document.querySelector('#order-form')
        ?.addEventListener('submit', async (event) => {
            event.preventDefault();
            await createOrder();
        });
});

function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.id) {
        alert('Ошибка: Не удалось найти данные пользователя. Перенаправление на страницу входа.');
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }
    return userData;
}

async function loadOrderHistory() {
    if (ordersIsLoaded) return;
    showLoadingScreen();
    const container = document.getElementById('orders-list');

    try {
        const userData = loadUserData();
        if (!userData) return;

        const orders = await fetchOrders(userData.id);

        container.innerHTML = orders.length
            ? orders.map(order => createOrderItem(order)).join('')
            : '<div class="empty-message">У вас пока нет заказов</div>';
        initOrderAccordions();
        ordersIsLoaded = true;

    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        container.innerHTML = '<div class="error-message">Ошибка загрузки истории заказов</div>';
    } finally {
        hideLoadingScreen();
    }
}

async function fetchOrders(userId) {
    const response = await fetch('graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                query GetOrdersByUserId($userId: Int!) {
                    getOrdersByUserId(userId: $userId) {
                        id
                        status
                        createdAt
                        details { 
                            service { 
                                name 
                                price 
                            } 
                            quantity 
                        }
                        totalPrice
                    }
                }
            `,
            variables: { userId: parseInt(userId) }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.getOrdersByUserId || [];
}

function createOrderItem(order) {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">#${order.id}</span>
                <span class="order-status ${order.status.toLowerCase()}">${getStatusText(order.status)}</span>
                <span class="order-date">${formattedDate}</span>
                <button class="toggle-details">▼</button>
            </div>
            <div class="order-details">
                <div class="services-list">
                    ${order.details.map((detail, index) => `
                        <div class="service-item">
                            <span>${index + 1}. ${detail.service.name} × ${detail.quantity}</span>
                            <span>${detail.service.price * detail.quantity} ₽</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <span>Итого:</span>
                    <span>${order.totalPrice} ₽</span>
                </div>
            </div>
        </div>
    `;
}

function initOrderAccordions() {
    document.querySelectorAll('.order-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.order-item');
            const details = item.querySelector('.order-details');
            const toggleBtn = item.querySelector('.toggle-details');
            const isExpanded = details.style.display === 'block';

            document.querySelectorAll('.order-details').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.toggle-details').forEach(el => {
                el.classList.remove('expanded');
            });

            if (!isExpanded) {
                details.style.display = 'block';
                toggleBtn.classList.add('expanded');
            }
        });
    });
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'В обработке',
        'IN_EXECUTE': 'В работе',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен'
    };
    return statusMap[status] || status;
}

async function createOrder() {
    showLoadingScreen();

    let additionalServices = [];
    const userData = loadUserData();
    try {
        const response = await fetch('api/services');
        if (!response.ok) {
            const error = await response.json();
            alert(`Ошибка (${response.status}) ${error.message}`);
            return;
        }
        additionalServices = await response.json();
    } catch (error) {
        console.error(`Ошибка: ${error.message || error}`);
        hideLoadingScreen();
        return;
    }

    const hours = parseInt(document.querySelector('#hours')?.value) || 0;
    let details = [];
    additionalServices.forEach(service => {
        if (document.getElementById(service.nameValue)?.checked) {
            details.push({ serviceId: service.id, quantity: service.isRent ? hours : 1 });
        }
    });

    try {
        await fetch('/auth/session/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`,
                'Content-Type': 'application/json'
            },
        })
        const response = await fetch('api/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userData.id, details: details }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Ошибка (${response.status}) ${error.message}`);
            return;
        }

        alert('Заказ успешно создан!');
        document.querySelector('#order-form').reset();
        document.querySelector('#result').innerHTML = '';
        document.querySelector('#sum').textContent = 'Итого: 0 руб.';
        ordersIsLoaded = false;
    } catch (error) {
        console.error(`Ошибка: ${error.message || error}`);
    } finally {
        hideLoadingScreen();
    }
}