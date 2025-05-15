document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const signupForm = document.querySelector("#signup");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            await handleFormSubmit(event, "auth/signin");
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            await handleFormSubmit(event, "/auth/signup");
        });
    }
});

async function handleFormSubmit(event, apiEndpoint) {
    showLoadingScreen();
    event.preventDefault();

    try {
        const data = collectAuthData(event.target);
        const response = await fetch(apiEndpoint, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Ошибка (${response.status}) ${error.message}`);
            return;
        }
        if (apiEndpoint.endsWith("signin")) {
            const responseData = await response.json();
            const responseUser = await (await fetch(`/api/users/supertokens/${responseData.user.id}`)).json();
            const accessToken = response.headers.get('st-access-token');
            const refreshToken = response.headers.get('st-refresh-token');
            const userData = {
                id: responseUser.id,
                email: responseUser.email,
            }
            localStorage.setItem("userData", JSON.stringify(userData));
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/user";
        } else {
            alert(`Аккаунт успешно создан, вы будете перенаправленны на страницу входа`);
            window.location.href = "/login";
        }
    } catch (error) {
        console.error(`Ошибка: ${error.message || error}`);
    } finally {
        hideLoadingScreen();
    }
}

function collectAuthData(form) {
    const email = form.querySelector("#email")?.value.trim() || "";
    const password = form.querySelector("#password")?.value.trim() || "";
    return {
        "formFields": [
            {id: "email", value: email},
            {id: "password", value: password}
        ]
    };
}