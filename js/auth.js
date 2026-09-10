document.addEventListener("DOMContentLoaded", () => {

    const data = getData();

    const currentPage = window.location.pathname.split("/").pop();

    if (
        currentPage === "dashboard.html" &&
        !data.currentUser
    ) {
        window.location.href = "index.html";
        return;
    }

    if (
        currentPage === "index.html" &&
        data.currentUser
    ) {
        window.location.href = "dashboard.html";
        return;
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", login);
    }

    const createAccountBtn =
        document.getElementById("createAccountBtn");

    if (createAccountBtn) {

        createAccountBtn.addEventListener(
            "click",
            criarConta
        );
    }

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );
    }

    const welcomeUser =
        document.getElementById("welcomeUser");

    if (
        welcomeUser &&
        data.currentUser
    ) {
        welcomeUser.textContent =
            `Olá, ${data.currentUser.name}`;
    }
});

function login(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("password").value;

    const data = getData();

    const user = data.users.find(
        item =>
            item.email === email &&
            item.password === password
    );

    if (!user) {

        showAuthMessage(
            "E-mail ou senha incorretos.",
            "danger"
        );

        return;
    }

    data.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    saveData(data);

    window.location.href = "dashboard.html";
}

function criarConta() {

    const email =
        document.getElementById("email").value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        showAuthMessage(
            "Preencha e-mail e senha para criar sua conta.",
            "warning"
        );

        return;
    }

    if (password.length < 4) {

        showAuthMessage(
            "A senha deve ter pelo menos 4 caracteres.",
            "warning"
        );

        return;
    }

    const data = getData();

    const existingUser =
        data.users.find(
            user => user.email === email
        );

    if (existingUser) {

        showAuthMessage(
            "Já existe uma conta com este e-mail.",
            "danger"
        );

        return;
    }

    const name =
        email.split("@")[0];

    const user = {
        id: generateId(),
        name,
        email,
        password
    };

    data.users.push(user);

    data.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    saveData(data);

    window.location.href = "dashboard.html";
}

function logout() {

    const data = getData();

    data.currentUser = null;

    saveData(data);

    window.location.href = "index.html";
}

function showAuthMessage(message, type) {

    const container =
        document.getElementById("authMessage");

    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${message}
        </div>
    `;
}
