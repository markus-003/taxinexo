document.addEventListener("DOMContentLoaded", () => {
    inicializarNavegacao();
    inicializarMenuMobile();
    inicializarTema();
    inicializarBackup();
    inicializarImportacao();

    // Abre a seção indicada na URL
    const hash = window.location.hash.replace("#", "");

    if (hash && document.getElementById(`section-${hash}`)) {
        mostrarSecao(hash);
    } else {
        mostrarSecao("dashboard");
    }
});


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function inicializarNavegacao() {

    const links =
        document.querySelectorAll(".sidebar .nav-link");

    links.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const section =
                link.dataset.section;

            if (!section) return;

            mostrarSecao(section);

            // Atualiza a URL
            window.history.replaceState(
                null,
                "",
                `#${section}`
            );

            // Fecha menu no celular
            const sidebar =
                document.querySelector(".sidebar");

            if (sidebar) {
                sidebar.classList.remove("open");
            }
        });
    });
}


/* =========================================================
   MOSTRAR SEÇÃO
========================================================= */

function mostrarSecao(sectionName) {

    const sections =
        document.querySelectorAll(".content-section");

    const links =
        document.querySelectorAll(".sidebar .nav-link");

    let encontrou = false;

    sections.forEach(section => {

        const sectionId =
            section.id.replace("section-", "");

        if (sectionId === sectionName) {

            section.classList.add("active");

            encontrou = true;

        } else {

            section.classList.remove("active");
        }
    });


    links.forEach(link => {

        if (link.dataset.section === sectionName) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");
        }
    });


    if (!encontrou) {
        return;
    }


    // Atualiza título
    const titles = {

        dashboard: "Dashboard",

        carros: "Veículos",

        carteira: "Carteira",

        historico: "Histórico"
    };


    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }


    // Atualiza dados quando entrar em cada seção

    if (
        sectionName === "carros" &&
        typeof renderizarCarros === "function"
    ) {

        renderizarCarros();
    }


    if (
        sectionName === "carteira" &&
        typeof renderizarCarteira === "function"
    ) {

        renderizarCarteira();
    }


    if (
        sectionName === "historico" &&
        typeof renderizarHistorico === "function"
    ) {

        renderizarHistorico();
    }


    if (
        sectionName === "dashboard" &&
        typeof atualizarDashboard === "function"
    ) {

        atualizarDashboard();
    }
}


/* =========================================================
   MENU MOBILE
========================================================= */

function inicializarMenuMobile() {

    const button =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });
}


/* =========================================================
   MODO ESCURO
========================================================= */

function inicializarTema() {

    const button =
        document.getElementById("themeToggle");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");

        const data = getData();

        data.theme =
            isLight ? "light" : "dark";

        saveData(data);

        atualizarBotaoTema();
    });


    const data = getData();

    if (data.theme === "light") {

        document.body.classList.add("light-mode");
    }

    atualizarBotaoTema();
}


function atualizarBotaoTema() {

    const button =
        document.getElementById("themeToggle");

    if (!button) return;

    const isLight =
        document.body.classList.contains("light-mode");

    if (isLight) {

        button.innerHTML = `
            <i class="bi bi-sun"></i>
            Modo claro
        `;

    } else {

        button.innerHTML = `
            <i class="bi bi-moon"></i>
            Modo escuro
        `;
    }
}


/* =========================================================
   BACKUP
========================================================= */

function inicializarBackup() {

    const button =
        document.getElementById("backupBtn");

    if (!button) return;

    button.addEventListener("click", () => {

        backupData();

    });
}


/* =========================================================
   IMPORTAÇÃO
========================================================= */

function inicializarImportacao() {

    const button =
        document.getElementById("importBtn");

    const input =
        document.getElementById("importFile");

    if (!button || !input) {
        return;
    }


    button.addEventListener("click", () => {

        input.click();

    });


    input.addEventListener("change", async event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }


        try {

            await importData(file);

            alert(
                "Backup importado com sucesso!"
            );

            window.location.reload();

        } catch (error) {

            console.error(error);

            alert(
                "Não foi possível importar o backup."
            );
        }


        input.value = "";
    });
}
