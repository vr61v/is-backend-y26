let additionalServices = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/api/services');
        additionalServices = await response.json();

        document
            .getElementById('hours')
            .addEventListener('input', calculateTotal);

        document
            .querySelectorAll('.form-radio, .form-checkbox')
            .forEach(item => item.addEventListener('change', calculateTotal));

        calculateTotal();
    } catch (error) {
        alert(`Ошибка (${error.message}) ${error.message}`);
    }
});

function calculateTotal() {
    if (!additionalServices.length) return;

    const hours = parseInt(document.querySelector('#hours').value) || 0;
    const costOfRent = getCostOfRent();
    let totalCost = 0;
    let resultHtml = '';

    const serviceCost = calculateServiceCost(hours, costOfRent);
    if (serviceCost) {
        totalCost += serviceCost.cost;
        resultHtml += createResultItemBlock(serviceCost.description, serviceCost.cost);
    }

    additionalServices.forEach(service => {
        const serviceCheckbox = document.getElementById(service.nameValue);
        if (serviceCheckbox?.checked && !service.isRent) {
            totalCost += service.price;
            resultHtml += createResultItemBlock(service.name, service.price);
        }
    });

    document.getElementById('result').innerHTML = resultHtml;
    document.getElementById('sum').textContent = `Итого: ${totalCost} руб.`;
}

function getCostOfRent() {
    const rentService = document.querySelector('input[name="rent"]:checked');
    if (!rentService) return 0;
    const rentServiceData = additionalServices.find(service => service.nameValue === rentService.value);
    return rentServiceData ? rentServiceData.price : 0;
}

function calculateServiceCost(hours, costOfRent) {
    if (hours > 0 && costOfRent > 0) {
        const rentService = additionalServices.find(service => service.price === costOfRent);
        return {
            description: rentService?.name || 'Неизвестная аренда',
            cost: hours * costOfRent
        };
    }
    return null;
}

function createResultItemBlock(description, price) {
    return `
        <div class="form-result__item">
            <div class="form-result__item-work">${description}</div>
            <div class="form-result__item-price">${price} руб.</div>
        </div>
    `;
}
