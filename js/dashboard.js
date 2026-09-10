/* =========================================================
   TAXINEXO — DASHBOARD
========================================================= */


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Só executa no dashboard
    if (!document.getElementById("section-dashboard")) {
        return;
    }

    inicializarNavegacao();

    inicializarBotoesLaterais();

    atualizarDashboard();

    // Abre a seção indicada na URL
    const hash =
        window.location.hash
            .replace("#", "")
            .trim();

    if (hash) {
        abrirSecao(hash);
    } else {
        abrirSecao("dashboard");
    }

});


/* =========================================================
   NAVEGAÇÃO DO DASHBOARD
========================================================= */

function inicializarNavegacao() {

    const links =
        document.querySelectorAll(
            ".sidebar-nav .nav-link"
        );

    links.forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                /*
                    IMPORTANTE:

                    Impede o navegador de tentar
                    carregar dashboard.html novamente.

                    Isso corrige o erro:

                    Unsafe attempt to load URL
                    file:///...
                */

                event.preventDefault();

                const section =
                    this.dataset.section;

                if (!section) {
                    return;
                }

                abrirSecao(section);

                /*
                    Atualiza o #dashboard,
                    #carros, #carteira etc.
                    sem recarregar a página.
                */

                history.replaceState(
                    null,
                    "",
                    `#${section}`
                );

            }
        );

    });

}


/* =========================================================
   ABRIR SEÇÃO
========================================================= */

function abrirSecao(nomeSecao) {

    const secoes =
        document.querySelectorAll(
            ".content-section"
        );

    const links =
        document.querySelectorAll(
            ".sidebar-nav .nav-link"
        );


    /*
        Primeiro escondemos todas
    */

    secoes.forEach(secao => {

        secao.classList.remove(
            "active"
        );

    });


    /*
        Removemos active dos menus
    */

    links.forEach(link => {

        link.classList.remove(
            "active"
        );

    });


    /*
        Procura a seção
    */

    const secao =
        document.getElementById(
            `section-${nomeSecao}`
        );


    /*
        Procura o link correspondente
    */

    const linkAtivo =
        document.querySelector(
            `.sidebar-nav .nav-link[data-section="${nomeSecao}"]`
        );


    /*
        Se a seção não existir,
        volta para Dashboard.
    */

    if (!secao) {

        const dashboard =
            document.getElementById(
                "section-dashboard"
            );

        if (dashboard) {
            dashboard.classList.add(
                "active"
            );
        }

        const dashboardLink =
            document.querySelector(
                '.sidebar-nav .nav-link[data-section="dashboard"]'
            );

        if (dashboardLink) {
            dashboardLink.classList.add(
                "active"
            );
        }

        atualizarTitulo(
            "dashboard"
        );

        return;
    }


    /*
        Mostra a seção
    */

    secao.classList.add(
        "active"
    );


    /*
        Ativa o menu
    */

    if (linkAtivo) {

        linkAtivo.classList.add(
            "active"
        );

    }


    /*
        Atualiza título
    */

    atualizarTitulo(
        nomeSecao
    );


    /*
        Atualiza conteúdos quando necessário
    */

    if (
        nomeSecao === "carros" &&
        typeof renderizarCarros === "function"
    ) {

        renderizarCarros();

    }


    if (
        nomeSecao === "carteira" &&
        typeof renderizarCarteira === "function"
    ) {

        renderizarCarteira();

    }


    if (
        nomeSecao === "historico" &&
        typeof renderizarHistorico === "function"
    ) {

        renderizarHistorico();

    }


    /*
        Atualiza gráficos ao voltar
        para o Dashboard.
    */

    if (
        nomeSecao === "dashboard"
    ) {

        atualizarDashboard();

    }

}


/* =========================================================
   TÍTULO DA PÁGINA
========================================================= */

function atualizarTitulo(
    nomeSecao
) {

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (!pageTitle) {
        return;
    }


    const titulos = {

        dashboard:
            "Dashboard",

        carros:
            "Veículos",

        carteira:
            "Carteira",

        historico:
            "Histórico"

    };


    pageTitle.textContent =
        titulos[nomeSecao]
        || "Dashboard";

}


/* =========================================================
   NAVEGAÇÃO PELO HASH
========================================================= */

window.addEventListener(
    "hashchange",
    () => {

        const hash =
            window.location.hash
                .replace("#", "")
                .trim();

        abrirSecao(
            hash || "dashboard"
        );

    }
);


/* =========================================================
   BOTÕES DA SIDEBAR
========================================================= */

function inicializarBotoesLaterais() {

    /*
        MENU MOBILE
    */

    const mobileMenuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        mobileMenuBtn &&
        sidebar
    ) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "show"
                );

            }
        );

    }


    /*
        Fecha menu mobile ao clicar
        em uma opção.
    */

    const links =
        document.querySelectorAll(
            ".sidebar-nav .nav-link"
        );

    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (sidebar) {

                    sidebar.classList.remove(
                        "show"
                    );

                }

            }
        );

    });

}


/* =========================================================
   ATUALIZAR DASHBOARD
========================================================= */

function atualizarDashboard() {

    if (
        typeof getData !== "function"
    ) {
        return;
    }


    const data =
        getData();


    if (!data) {
        return;
    }


    const carros =
        Array.isArray(data.carros)
            ? data.carros
            : [];


    const history =
        Array.isArray(data.history)
            ? data.history
            : [];


    /* =====================================================
       CARTEIRA
    ===================================================== */

    let totalDepositado = 0;
    let totalSacado = 0;


    history.forEach(item => {

        const tipo =
            String(
                item.type || ""
            )
            .toLowerCase()
            .trim();


        const valor =
            Number(
                item.value
            ) || 0;


        if (
            tipo === "depósito" ||
            tipo === "deposito"
        ) {

            totalDepositado += valor;

        }


        if (
            tipo === "saque" ||
            tipo === "retirada"
        ) {

            totalSacado += valor;

        }

    });


    /* =====================================================
       INVESTIMENTOS
    ===================================================== */

    let totalInvestido = 0;

    let lucroPrevistoMin = 0;
    let lucroPrevistoMax = 0;

    let rendimentoPrevistoMin = 0;
    let rendimentoPrevistoMax = 0;


    carros.forEach(car => {

        const valorCompra =
            Number(
                car.valorCompra
            ) || 0;


        totalInvestido +=
            valorCompra;


        /*
            Usa o cálculo do carros.js.

            Dessa forma o domingo
            é respeitado.
        */

        if (
            typeof calcularCarro ===
            "function"
        ) {

            const calc =
                calcularCarro(car);


            lucroPrevistoMin +=
                Number(
                    calc.lucroMin
                ) || 0;


            lucroPrevistoMax +=
                Number(
                    calc.lucroMax
                ) || 0;


            rendimentoPrevistoMin +=
                Number(
                    calc.rendimentoMin
                ) || 0;


            rendimentoPrevistoMax +=
                Number(
                    calc.rendimentoMax
                ) || 0;

        }

    });


    /* =====================================================
       LUCRO RECEBIDO
    ===================================================== */

    let lucroRecebido = 0;


    history.forEach(item => {

        const tipo =
            String(
                item.type || ""
            )
            .toLowerCase()
            .trim();


        const valor =
            Number(
                item.value
            ) || 0;


        if (
            tipo === "recebimento" ||
            tipo === "rendimento" ||
            tipo === "lucro"
        ) {

            lucroRecebido +=
                valor;

        }

    });


    /* =====================================================
       SALDO ATUAL
    ===================================================== */

    const saldoAtual =
        totalDepositado
        + lucroRecebido
        - totalSacado
        - totalInvestido;


    /* =====================================================
       ROI
    ===================================================== */

    const lucroPrevistoMedio =
        (
            lucroPrevistoMin +
            lucroPrevistoMax
        ) / 2;


    let roi = 0;


    if (
        totalInvestido > 0
    ) {

        roi =
            (
                lucroPrevistoMedio /
                totalInvestido
            ) * 100;

    }


    /* =====================================================
       VEÍCULOS ATIVOS
    ===================================================== */

    let veiculosAtivos = 0;


    carros.forEach(car => {

        if (!car.dataFim) {
            return;
        }


        const hoje =
            new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const fim =
            new Date(
                `${car.dataFim}T00:00:00`
            );


        if (
            fim > hoje
        ) {

            veiculosAtivos++;

        }

    });


    /* =====================================================
       CARDS
    ===================================================== */

    definirTexto(
        "saldoAtual",
        formatCurrency(
            saldoAtual
        )
    );


    definirTexto(
        "totalDepositado",
        formatCurrency(
            totalDepositado
        )
    );


    definirTexto(
        "totalSacado",
        formatCurrency(
            totalSacado
        )
    );


    definirTexto(
        "totalInvestido",
        formatCurrency(
            totalInvestido
        )
    );


    definirTexto(
        "lucroPrevisto",
        `${formatCurrency(
            lucroPrevistoMin
        )} - ${formatCurrency(
            lucroPrevistoMax
        )}`
    );


    definirTexto(
        "lucroRecebido",
        formatCurrency(
            lucroRecebido
        )
    );


    definirTexto(
        "roi",
        `${roi.toFixed(2)}%`
    );


    definirTexto(
        "veiculosAtivos",
        String(
            veiculosAtivos
        )
    );


    /* =====================================================
       GRÁFICOS
    ===================================================== */

    atualizarGraficosDashboard(
        carros,
        totalInvestido,
        rendimentoPrevistoMin,
        rendimentoPrevistoMax
    );

}


/* =========================================================
   DEFINIR TEXTO
========================================================= */

function definirTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        valor;

}


/* =========================================================
   GRÁFICOS
========================================================= */

function atualizarGraficosDashboard(
    carros,
    totalInvestido,
    rendimentoMin,
    rendimentoMax
) {

    if (
        typeof graficoLucro ===
        "function"
    ) {

        graficoLucro();

    }


    if (
        typeof graficoInvestimento ===
        "function"
    ) {

        graficoInvestimento();

    }


    if (
        typeof graficoCarteira ===
        "function"
    ) {

        graficoCarteira();

    }

}


/* =========================================================
   ATUALIZAÇÃO GLOBAL
========================================================= */

window.atualizarDashboard =
    atualizarDashboard;


/* =========================================================
   EXPOR NAVEGAÇÃO
========================================================= */

window.abrirSecao =
    abrirSecao;
