/*
========================================================
TAXINEXO
carros.js

CRUD DOS VEÍCULOS
========================================================
*/

(function () {

    "use strict";


    /* ==================================================
       DADOS
    ================================================== */

    function obterDados() {

        if (
            typeof getData ===
            "function"
        ) {

            const data =
                getData();

            if (data) {
                return data;
            }

        }


        try {

            return JSON.parse(
                localStorage.getItem(
                    "taxinexoData"
                )
            ) || {

                carros: [],

                history: []

            };

        } catch {

            return {

                carros: [],

                history: []

            };

        }

    }


    function salvarDados(
        dados
    ) {

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

    }


    /* ==================================================
       ID
    ================================================== */

    function gerarId() {

        return (
            "carro-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }


    /* ==================================================
       DATA ATUAL
    ================================================== */

    function hojeISO() {

        if (
            typeof todayISO ===
            "function"
        ) {

            return todayISO();

        }


        return new Date()
            .toISOString()
            .slice(0, 10);

    }


    /* ==================================================
       MOEDA
    ================================================== */

    function moeda(valor) {

        if (
            typeof formatCurrency ===
            "function"
        ) {

            return formatCurrency(
                Number(valor) || 0
            );

        }


        return (
            Number(valor) || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* ==================================================
       ESCAPE
    ================================================== */

    function escapeHtml(valor) {

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
       CONTAR DIAS
    ================================================== */

    function contarDiasRendimento(
        dataInicio,
        dataFim,
        trabalhaDomingo
    ) {

        if (
            !dataInicio ||
            !dataFim
        ) {

            return 0;

        }


        if (
            trabalhaDomingo ===
            undefined
        ) {

            trabalhaDomingo =
                true;

        }


        const inicio =
            new Date(
                dataInicio +
                "T00:00:00"
            );


        const fim =
            new Date(
                dataFim +
                "T00:00:00"
            );


        if (
            fim <= inicio
        ) {

            return 0;

        }


        let dias = 0;


        const atual =
            new Date(
                inicio
            );


        /*
        O dia final não entra.
        */


        while (
            atual < fim
        ) {

            const diaSemana =
                atual.getDay();


            /*
            0 = domingo
            */

            if (
                diaSemana !== 0 ||
                trabalhaDomingo
            ) {

                dias++;

            }


            atual.setDate(
                atual.getDate() + 1
            );

        }


        return dias;

    }


    /* ==================================================
       DIAS RESTANTES
    ================================================== */

    function calcularDiasRestantes(
        dataFim,
        trabalhaDomingo
    ) {

        if (!dataFim) {
            return 0;
        }


        const agora =
            new Date();


        agora.setHours(
            0,
            0,
            0,
            0
        );


        const fim =
            new Date(
                dataFim +
                "T00:00:00"
            );


        if (
            fim <= agora
        ) {

            return 0;

        }


        const inicio =
            agora
                .toISOString()
                .slice(0, 10);


        return contarDiasRendimento(
            inicio,
            dataFim,
            trabalhaDomingo
        );

    }


    /* ==================================================
       CÁLCULO DO VEÍCULO
    ================================================== */

    function calcularCarro(
        carro
    ) {

        const trabalhaDomingo =
            carro.trabalhaDomingo !==
            false;


        const diasPeriodo =
            contarDiasRendimento(
                carro.dataCompra,
                carro.dataFim,
                trabalhaDomingo
            );


        const diasRestantes =
            calcularDiasRestantes(
                carro.dataFim,
                trabalhaDomingo
            );


        let rendaMin =
            Number(
                carro.rendaTotalMin
            );


        let rendaMax =
            Number(
                carro.rendaTotalMax
            );


        /*
        Compatibilidade com
        registros antigos.
        */

        if (
            !Number.isFinite(
                rendaMin
            )
        ) {

            rendaMin =
                Number(
                    carro.rendaMin
                ) *
                diasPeriodo ||
                0;

        }


        if (
            !Number.isFinite(
                rendaMax
            )
        ) {

            rendaMax =
                Number(
                    carro.rendaMax
                ) *
                diasPeriodo ||
                0;

        }


        const valorCompra =
            Number(
                carro.valorCompra
            ) || 0;


        /*
        LUCRO TOTAL
        */

        const lucroMin =
            rendaMin -
            valorCompra;


        const lucroMax =
            rendaMax -
            valorCompra;


        /*
        LUCRO DIÁRIO
        */

        const lucroDiarioMin =
            diasPeriodo > 0
                ? lucroMin /
                  diasPeriodo
                : 0;


        const lucroDiarioMax =
            diasPeriodo > 0
                ? lucroMax /
                  diasPeriodo
                : 0;


        const lucroDiarioMedio =
            (
                lucroDiarioMin +
                lucroDiarioMax
            ) / 2;


        const lucroMedio =
            (
                lucroMin +
                lucroMax
            ) / 2;


        return {

            diasPeriodo,

            diasRestantes,

            rendaMin,

            rendaMax,

            lucroMin,

            lucroMax,

            lucroDiarioMin,

            lucroDiarioMax,

            lucroDiarioMedio,

            lucroMedio,

            trabalhaDomingo

        };

    }


    /* ==================================================
       STATUS
    ================================================== */

    function statusCarro(
        carro,
        calculo
    ) {

        const hoje =
            hojeISO();


        if (
            carro.dataFim <=
            hoje
        ) {

            return [
                "Encerrado",
                "badge-ended"
            ];

        }


        if (
            calculo.diasRestantes <=
            3
        ) {

            return [
                "Vencendo",
                "badge-warning"
            ];

        }


        return [
            "Ativo",
            "badge-active"
        ];

    }


    /* ==================================================
       NOVO VEÍCULO
    ================================================== */

    function abrirModalNovo() {

        const formulario =
            document.getElementById(
                "carroForm"
            );


        if (!formulario) {
            return;
        }


        formulario.reset();


        document.getElementById(
            "carroId"
        ).value = "";


        document.getElementById(
            "carroModalTitle"
        ).textContent =
            "Novo veículo";


        document.getElementById(
            "carroTrabalhaDomingo"
        ).value =
            "true";


        const modal =
            document.getElementById(
                "carroModal"
            );


        if (
            modal &&
            window.bootstrap
        ) {

            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                )
                .show();

        }

    }


    /* ==================================================
       EDITAR
    ================================================== */

    function editarCarro(
        id
    ) {

        const dados =
            obterDados();


        const carro =
            (dados.carros || [])
                .find(
                    function (item) {

                        return (
                            item.id ===
                            id
                        );

                    }
                );


        if (!carro) {
            return;
        }


        document.getElementById(
            "carroId"
        ).value =
            carro.id;


        document.getElementById(
            "carroNome"
        ).value =
            carro.nome || "";


        document.getElementById(
            "carroValor"
        ).value =
            carro.valorCompra ?? "";


        document.getElementById(
            "carroDataCompra"
        ).value =
            carro.dataCompra || "";


        document.getElementById(
            "carroDataFim"
        ).value =
            carro.dataFim || "";


        document.getElementById(
            "carroRendaTotalMin"
        ).value =
            carro.rendaTotalMin ?? "";


        document.getElementById(
            "carroRendaTotalMax"
        ).value =
            carro.rendaTotalMax ?? "";


        document.getElementById(
            "carroTrabalhaDomingo"
        ).value =
            carro.trabalhaDomingo === false
                ? "false"
                : "true";


        document.getElementById(
            "carroModalTitle"
        ).textContent =
            "Editar veículo";


        const modal =
            document.getElementById(
                "carroModal"
            );


        if (
            modal &&
            window.bootstrap
        ) {

            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                )
                .show();

        }

    }


    /* ==================================================
       EXCLUIR
    ================================================== */

    function removerCarro(
        id
    ) {

        const dados =
            obterDados();


        const carro =
            (dados.carros || [])
                .find(
                    function (item) {

                        return (
                            item.id ===
                            id
                        );

                    }
                );


        if (!carro) {
            return;
        }


        const confirmou =
            confirm(
                `Excluir o veículo "${carro.nome}"?`
            );


        if (!confirmou) {
            return;
        }


        dados.carros =
            (dados.carros || [])
                .filter(
                    function (item) {

                        return (
                            item.id !==
                            id
                        );

                    }
                );


        salvarDados(
            dados
        );


        renderizarCarros();


        if (
            typeof atualizarDashboard ===
            "function"
        ) {

            atualizarDashboard();

        }


        if (
            typeof atualizarGraficos ===
            "function"
        ) {

            atualizarGraficos();

        }

    }


    /* ==================================================
       SALVAR
    ================================================== */

    function salvarCarro(
        evento
    ) {

        evento.preventDefault();


        const dados =
            obterDados();


        if (
            !Array.isArray(
                dados.carros
            )
        ) {

            dados.carros = [];

        }


        if (
            !Array.isArray(
                dados.history
            )
        ) {

            dados.history = [];

        }


        const id =
            document.getElementById(
                "carroId"
            ).value.trim();


        const nome =
            document.getElementById(
                "carroNome"
            ).value.trim();


        const valorCompra =
            Number(
                document.getElementById(
                    "carroValor"
                ).value
            );


        const dataCompra =
            document.getElementById(
                "carroDataCompra"
            ).value;


        const dataFim =
            document.getElementById(
                "carroDataFim"
            ).value;


        const rendaTotalMin =
            Number(
                document.getElementById(
                    "carroRendaTotalMin"
                ).value
            );


        const rendaTotalMax =
            Number(
                document.getElementById(
                    "carroRendaTotalMax"
                ).value
            );


        const trabalhaDomingo =
            document.getElementById(
                "carroTrabalhaDomingo"
            ).value ===
            "true";


        /* VALIDAÇÕES */

        if (!nome) {

            alert(
                "Informe o nome do veículo."
            );

            return;

        }


        if (
            !Number.isFinite(
                valorCompra
            ) ||
            valorCompra < 0
        ) {

            alert(
                "Informe um valor de compra válido."
            );

            return;

        }


        if (
            !dataCompra ||
            !dataFim
        ) {

            alert(
                "Informe as datas."
            );

            return;

        }


        if (
            dataFim <=
            dataCompra
        ) {

            alert(
                "A data de término deve ser posterior à data de compra."
            );

            return;

        }


        if (
            !Number.isFinite(
                rendaTotalMin
            ) ||
            rendaTotalMin < 0
        ) {

            alert(
                "Informe a renda total mínima."
            );

            return;

        }


        if (
            !Number.isFinite(
                rendaTotalMax
            ) ||
            rendaTotalMax < 0
        ) {

            alert(
                "Informe a renda total máxima."
            );

            return;

        }


        if (
            rendaTotalMax <
            rendaTotalMin
        ) {

            alert(
                "A renda total máxima não pode ser menor que a mínima."
            );

            return;

        }


        /* OBJETO */

        const carro = {

            id:
                id ||
                gerarId(),

            nome,

            valorCompra,

            dataCompra,

            dataFim,

            rendaTotalMin,

            rendaTotalMax,

            trabalhaDomingo

        };


        /* EDITAR OU CRIAR */

        const indice =
            dados.carros.findIndex(
                function (item) {

                    return (
                        item.id ===
                        id
                    );

                }
            );


        if (
            indice >= 0
        ) {

            dados.carros[
                indice
            ] = carro;

        } else {

            dados.carros.push(
                carro
            );


            /*
            REGISTRA NO HISTÓRICO
            */

            dados.history.push({

                id:
                    gerarId(),

                date:
                    hojeISO(),

                type:
                    "Investimento",

                description:
                    `Compra do veículo ${nome}`,

                value:
                    valorCompra

            });

        }


        salvarDados(
            dados
        );


        renderizarCarros();


        if (
            typeof atualizarDashboard ===
            "function"
        ) {

            atualizarDashboard();

        }


        if (
            typeof atualizarGraficos ===
            "function"
        ) {

            atualizarGraficos();

        }


        const modal =
            document.getElementById(
                "carroModal"
            );


        if (
            modal &&
            window.bootstrap
        ) {

            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                )
                .hide();

        }

    }


    /* ==================================================
       RENDERIZAR
    ================================================== */

    function renderizarCarros() {

        const tabela =
            document.getElementById(
                "carrosTableBody"
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
                        colspan="8"
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
                        calcularCarro(
                            carro
                        );


                    const status =
                        statusCarro(
                            carro,
                            calculo
                        );


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHtml(
                                        carro.nome
                                    )}
                                </strong>

                                <div class="text-secondary small">

                                    Domingo:
                                    ${
                                        calculo.trabalhaDomingo
                                            ? "Sim"
                                            : "Não"
                                    }

                                </div>

                            </td>


                            <td>

                                ${moeda(
                                    carro.valorCompra
                                )}

                            </td>


                            <td>

                                ${calculo.diasPeriodo}
                                dias

                            </td>


                            <td>

                                ${moeda(
                                    calculo.rendaMin
                                )}

                                -

                                ${moeda(
                                    calculo.rendaMax
                                )}

                            </td>


                            <td>

                                <strong>

                                    ${moeda(
                                        calculo.lucroDiarioMedio
                                    )}

                                </strong>

                            </td>


                            <td>

                                ${moeda(
                                    calculo.lucroMedio
                                )}

                            </td>


                            <td>

                                <span
                                    class="
                                        badge-status
                                        ${status[1]}
                                    "
                                >

                                    ${status[0]}

                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="action-button"
                                    onclick="editarCarro('${carro.id}')"
                                    title="Editar"
                                >

                                    <i
                                        class="bi bi-pencil"
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="action-button"
                                    onclick="removerCarro('${carro.id}')"
                                    title="Excluir"
                                >

                                    <i
                                        class="bi bi-trash"
                                    ></i>

                                </button>

                            </td>

                        </tr>

                    `;

                }
            ).join("");

    }


    /* ==================================================
       EVENTOS
    ================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const novo =
                document.getElementById(
                    "novoCarroBtn"
                );


            const formulario =
                document.getElementById(
                    "carroForm"
                );


            if (novo) {

                novo.addEventListener(
                    "click",
                    abrirModalNovo
                );

            }


            if (formulario) {

                formulario.addEventListener(
                    "submit",
                    salvarCarro
                );

            }


            renderizarCarros();

        }
    );


    /* ==================================================
       FUNÇÕES GLOBAIS
    ================================================== */

    window.calcularCarro =
        calcularCarro;


    window.contarDiasRendimento =
        contarDiasRendimento;


    window.calcularDiasRestantes =
        calcularDiasRestantes;


    window.abrirModalNovo =
        abrirModalNovo;


    window.editarCarro =
        editarCarro;


    window.removerCarro =
        removerCarro;


    window.salvarCarro =
        salvarCarro;


    window.renderizarCarros =
        renderizarCarros;

})();