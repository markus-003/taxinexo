/*
========================================================
TAXINEXO
dashboard.js

IMPORTANTE:
Este é o ÚNICO arquivo responsável pelo Dashboard.

NÃO criar:
dashboard-ui.js
========================================================
*/

(function () {

    "use strict";


    /* ==================================================
       TÍTULOS
    ================================================== */

    const titulos = {

        dashboard: "Dashboard",

        carros: "Veículos",

        carteira: "Carteira",

        historico: "Histórico"

    };


    /* ==================================================
       DADOS
    ================================================== */

    function obterDados() {

        try {

            if (typeof getData === "function") {

                const data = getData();

                if (data) {
                    return data;
                }

            }

        } catch (erro) {

            console.error(
                "Erro ao obter dados:",
                erro
            );

        }


        try {

            const salvo =
                localStorage.getItem(
                    "taxinexoData"
                );

            if (salvo) {

                return JSON.parse(salvo);

            }

        } catch (erro) {

            console.error(
                "Erro no localStorage:",
                erro
            );

        }


        return {

            carros: [],

            history: []

        };

    }


    /* ==================================================
       MOEDA
    ================================================== */

    function moeda(valor) {

        const numero =
            Number(valor) || 0;


        if (
            typeof formatCurrency ===
            "function"
        ) {

            return formatCurrency(
                numero
            );

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* ==================================================
       DATA
    ================================================== */

    function formatarData(data) {

        if (!data) {
            return "-";
        }


        if (
            typeof formatDate ===
            "function"
        ) {

            return formatDate(data);

        }


        const partes =
            String(data).split("-");


        if (partes.length !== 3) {
            return data;
        }


        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    /* ==================================================
       ESCAPE HTML
    ================================================== */

    function escapeHtml(valor) {

        if (
            typeof escapeHTML ===
            "function"
        ) {

            return escapeHTML(
                valor
            );

        }


        return String(
            valor ?? ""
        ).replace(
            /[&<>"']/g,
            function (caractere) {

                const mapa = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };

                return mapa[
                    caractere
                ];

            }
        );

    }


    /* ==================================================
       ELEMENTO
    ================================================== */

    function definirTexto(
        id,
        valor
    ) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                valor;

        }

    }


    /* ==================================================
       TOTAIS
    ================================================== */

    function calcularTotais() {

        const dados =
            obterDados();


        const carros =
            Array.isArray(
                dados.carros
            )
                ? dados.carros
                : [];


        const historico =
            Array.isArray(
                dados.history
            )
                ? dados.history
                : [];


        let totalDepositado = 0;

        let totalSacado = 0;

        let lucroRecebido = 0;

        let totalInvestido = 0;

        let lucroMin = 0;

        let lucroMax = 0;

        let lucroDiarioTotal = 0;

        let veiculosAtivos = 0;


        /* HISTÓRICO */

        historico.forEach(
            function (item) {

                const tipo =
                    String(
                        item.type || ""
                    ).toLowerCase();


                const valor =
                    Number(
                        item.value
                    ) || 0;


                if (
                    tipo === "depósito" ||
                    tipo === "deposito"
                ) {

                    totalDepositado +=
                        valor;

                }


                if (
                    tipo === "saque" ||
                    tipo === "retirada"
                ) {

                    totalSacado +=
                        valor;

                }


                if (
                    tipo === "recebimento" ||
                    tipo === "rendimento" ||
                    tipo === "lucro"
                ) {

                    lucroRecebido +=
                        valor;

                }

            }
        );


        /* VEÍCULOS */

        carros.forEach(
            function (carro) {

                let calculo;


                if (
                    typeof calcularCarro ===
                    "function"
                ) {

                    calculo =
                        calcularCarro(
                            carro
                        );

                } else {

                    calculo = {

                        rendaMin:
                            Number(
                                carro.rendaTotalMin
                            ) || 0,

                        rendaMax:
                            Number(
                                carro.rendaTotalMax
                            ) || 0,

                        lucroMin:
                            (
                                Number(
                                    carro.rendaTotalMin
                                ) || 0
                            ) -
                            (
                                Number(
                                    carro.valorCompra
                                ) || 0
                            ),

                        lucroMax:
                            (
                                Number(
                                    carro.rendaTotalMax
                                ) || 0
                            ) -
                            (
                                Number(
                                    carro.valorCompra
                                ) || 0
                            ),

                        lucroDiarioMedio: 0

                    };

                }


                totalInvestido +=
                    Number(
                        carro.valorCompra
                    ) || 0;


                lucroMin +=
                    Number(
                        calculo.lucroMin
                    ) || 0;


                lucroMax +=
                    Number(
                        calculo.lucroMax
                    ) || 0;


                lucroDiarioTotal +=
                    Number(
                        calculo.lucroDiarioMedio
                    ) || 0;


                const hoje =
                    new Date()
                        .toISOString()
                        .slice(0, 10);


                if (
                    carro.dataFim &&
                    carro.dataFim > hoje
                ) {

                    veiculosAtivos++;

                }

            }
        );


        const lucroPrevisto =
            (
                lucroMin +
                lucroMax
            ) / 2;


        const saldoAtual =
            totalDepositado +
            lucroRecebido -
            totalSacado -
            totalInvestido;


        const roi =
            totalInvestido > 0
                ? (
                    lucroPrevisto /
                    totalInvestido
                ) * 100
                : 0;


        return {

            totalDepositado,

            totalSacado,

            lucroRecebido,

            totalInvestido,

            lucroPrevisto,

            saldoAtual,

            roi,

            veiculosAtivos,

            lucroDiarioTotal

        };

    }


    /* ==================================================
       ATUALIZAR DASHBOARD
    ================================================== */

    function atualizarDashboard() {

        const totais =
            calcularTotais();


        definirTexto(
            "saldoAtual",
            moeda(
                totais.saldoAtual
            )
        );


        definirTexto(
            "totalDepositado",
            moeda(
                totais.totalDepositado
            )
        );


        definirTexto(
            "totalSacado",
            moeda(
                totais.totalSacado
            )
        );


        definirTexto(
            "totalInvestido",
            moeda(
                totais.totalInvestido
            )
        );


        definirTexto(
            "lucroPrevisto",
            moeda(
                totais.lucroPrevisto
            )
        );


        definirTexto(
            "lucroRecebido",
            moeda(
                totais.lucroRecebido
            )
        );


        definirTexto(
            "roi",
            totais.roi.toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits: 2
                }
            ) + "%"
        );


        definirTexto(
            "veiculosAtivos",
            totais.veiculosAtivos
        );


        definirTexto(
            "lucroDiarioTotal",
            moeda(
                totais.lucroDiarioTotal
            )
        );


        renderizarLucroDiario();

    }


    /* ==================================================
       LUCRO DIÁRIO POR VEÍCULO
    ================================================== */

    function renderizarLucroDiario() {

        const tabela =
            document.getElementById(
                "dashboardLucroVeiculosBody"
            );


        if (!tabela) {
            return;
        }


        const dados =
            obterDados();


        const carros =
            Array.isArray(
                dados.carros
            )
                ? dados.carros
                : [];


        if (
            carros.length === 0
        ) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="empty-state"
                    >
                        Nenhum veículo cadastrado.
                    </td>
                </tr>
            `;

            return;

        }


        tabela.innerHTML =
            carros.map(
                function (carro) {

                    const calculo =
                        typeof calcularCarro ===
                        "function"
                            ? calcularCarro(
                                carro
                            )
                            : {
                                lucroDiarioMedio: 0,
                                diasRestantes: 0
                            };


                    let status =
                        "Ativo";


                    let classe =
                        "badge-active";


                    const hoje =
                        new Date()
                            .toISOString()
                            .slice(0, 10);


                    if (
                        carro.dataFim &&
                        carro.dataFim <= hoje
                    ) {

                        status =
                            "Encerrado";

                        classe =
                            "badge-ended";

                    }

                    else if (
                        calculo.diasRestantes <= 3
                    ) {

                        status =
                            "Vencendo";

                        classe =
                            "badge-warning";

                    }


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHtml(
                                        carro.nome
                                    )}
                                </strong>

                            </td>


                            <td>

                                <strong>
                                    ${moeda(
                                        calculo.lucroDiarioMedio
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${
                                    calculo.diasRestantes
                                    || 0
                                }

                                dias

                            </td>


                            <td>

                                <span
                                    class="
                                        badge-status
                                        ${classe}
                                    "
                                >

                                    ${status}

                                </span>

                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    /* ==================================================
       CARTEIRA
    ================================================== */

    function atualizarCarteira() {

        const totais =
            calcularTotais();


        definirTexto(
            "carteiraSaldo",
            moeda(
                totais.saldoAtual
            )
        );


        definirTexto(
            "carteiraDepositado",
            moeda(
                totais.totalDepositado
            )
        );


        definirTexto(
            "carteiraSacado",
            moeda(
                totais.totalSacado
            )
        );

    }


    /* ==================================================
       HISTÓRICO
    ================================================== */

    function renderizarHistorico() {

        const tabela =
            document.getElementById(
                "historicoTableBody"
            );


        if (!tabela) {
            return;
        }


        const dados =
            obterDados();


        const historico =
            Array.isArray(
                dados.history
            )
                ? [...dados.history]
                : [];


        historico.sort(
            function (a, b) {

                return String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                );

            }
        );


        if (
            historico.length === 0
        ) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="empty-state"
                    >
                        Nenhum registro encontrado.
                    </td>
                </tr>
            `;

            return;

        }


        tabela.innerHTML =
            historico.map(
                function (item) {

                    return `

                        <tr>

                            <td>
                                ${formatarData(
                                    item.date
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.type || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.description || "-"
                                )}
                            </td>

                            <td>
                                ${moeda(
                                    item.value
                                )}
                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    /* ==================================================
       NAVEGAÇÃO
    ================================================== */

    function abrirSecao(
        nomeSecao
    ) {

        const permitidas = [

            "dashboard",

            "carros",

            "carteira",

            "historico"

        ];


        if (
            !permitidas.includes(
                nomeSecao
            )
        ) {

            nomeSecao =
                "dashboard";

        }


        document
            .querySelectorAll(
                ".content-section"
            )
            .forEach(
                function (section) {

                    section.classList.remove(
                        "active"
                    );

                }
            );


        document
            .querySelectorAll(
                ".sidebar-nav .nav-link"
            )
            .forEach(
                function (link) {

                    link.classList.remove(
                        "active"
                    );

                }
            );


        const section =
            document.getElementById(
                "section-" +
                nomeSecao
            );


        const link =
            document.querySelector(
                `.sidebar-nav
                 .nav-link[data-section="${nomeSecao}"]`
            );


        if (section) {

            section.classList.add(
                "active"
            );

        }


        if (link) {

            link.classList.add(
                "active"
            );

        }


        definirTexto(
            "pageTitle",
            titulos[
                nomeSecao
            ]
        );


        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }


        if (
            nomeSecao ===
            "dashboard"
        ) {

            atualizarDashboard();

            if (
                typeof atualizarGraficos ===
                "function"
            ) {

                atualizarGraficos();

            }

        }


        if (
            nomeSecao ===
            "carros"
        ) {

            if (
                typeof renderizarCarros ===
                "function"
            ) {

                renderizarCarros();

            }

        }


        if (
            nomeSecao ===
            "carteira"
        ) {

            atualizarCarteira();

        }


        if (
            nomeSecao ===
            "historico"
        ) {

            renderizarHistorico();

        }

    }


    /* ==================================================
       NAVEGAÇÃO
    ================================================== */

    function inicializarNavegacao() {

        const links =
            document.querySelectorAll(
                ".sidebar-nav .nav-link"
            );


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (evento) {

                        evento.preventDefault();


                        const secao =
                            link.dataset.section;


                        if (!secao) {
                            return;
                        }


                        abrirSecao(
                            secao
                        );


                        history.replaceState(
                            null,
                            "",
                            "#" + secao
                        );

                    }
                );

            }
        );

    }


    /* ==================================================
       TEMA
    ================================================== */

    function inicializarTema() {

        const botao =
            document.getElementById(
                "themeToggle"
            );


        const tema =
            localStorage.getItem(
                "taxinexoTheme"
            );


        if (
            tema === "light"
        ) {

            document.body.classList.add(
                "light-mode"
            );

        }


        if (!botao) {
            return;
        }


        botao.addEventListener(
            "click",
            function () {

                document.body.classList.toggle(
                    "light-mode"
                );


                localStorage.setItem(
                    "taxinexoTheme",

                    document.body.classList.contains(
                        "light-mode"
                    )
                        ? "light"
                        : "dark"
                );

            }
        );

    }


    /* ==================================================
       MENU MOBILE
    ================================================== */

    function inicializarMobile() {

        const botao =
            document.getElementById(
                "mobileMenuBtn"
            );


        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (
            !botao ||
            !sidebar
        ) {

            return;

        }


        botao.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* ==================================================
       BACKUP
    ================================================== */

    function inicializarBackup() {

        const botao =
            document.getElementById(
                "backupBtn"
            );


        if (!botao) {
            return;
        }


        botao.addEventListener(
            "click",
            function () {

                const dados =
                    obterDados();


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                dados,
                                null,
                                2
                            )
                        ],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    "taxinexo-backup.json";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );

            }
        );

    }


    /* ==================================================
       IMPORTAR
    ================================================== */

    function inicializarImportacao() {

        const botao =
            document.getElementById(
                "importBtn"
            );


        const input =
            document.getElementById(
                "importFile"
            );


        if (
            !botao ||
            !input
        ) {

            return;

        }


        botao.addEventListener(
            "click",
            function () {

                input.click();

            }
        );


        input.addEventListener(
            "change",
            function () {

                const arquivo =
                    input.files &&
                    input.files[0];


                if (!arquivo) {
                    return;
                }


                const leitor =
                    new FileReader();


                leitor.onload =
                    function () {

                        try {

                            const dados =
                                JSON.parse(
                                    leitor.result
                                );


                            if (
                                typeof saveData ===
                                "function"
                            ) {

                                saveData(
                                    dados
                                );

                            } else {

                                localStorage.setItem(
                                    "taxinexoData",
                                    JSON.stringify(
                                        dados
                                    )
                                );

                            }


                            alert(
                                "Backup importado com sucesso."
                            );


                            location.reload();

                        }

                        catch (erro) {

                            console.error(
                                erro
                            );


                            alert(
                                "Arquivo de backup inválido."
                            );

                        }

                    };


                leitor.readAsText(
                    arquivo
                );

            }
        );

    }


    /* ==================================================
       INICIALIZAÇÃO
    ================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            inicializarNavegacao();

            inicializarTema();

            inicializarMobile();

            inicializarBackup();

            inicializarImportacao();


            atualizarDashboard();

            atualizarCarteira();

            renderizarHistorico();


            const hash =
                window.location.hash
                    .replace(
                        "#",
                        ""
                    )
                    .trim();


            abrirSecao(
                hash ||
                "dashboard"
            );


            setInterval(
                function () {

                    atualizarDashboard();

                    atualizarCarteira();

                },
                30000
            );

        }
    );


    /* ==================================================
       FUNÇÕES GLOBAIS
    ================================================== */

    window.abrirSecao =
        abrirSecao;


    window.atualizarDashboard =
        atualizarDashboard;


    window.atualizarCarteira =
        atualizarCarteira;


    window.renderizarHistorico =
        renderizarHistorico;

})();