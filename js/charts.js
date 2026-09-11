/*
========================================================
TAXINEXO
charts.js

GRÁFICOS DO DASHBOARD
========================================================
*/

(function () {

    "use strict";


    let graficoInvestimentoInstance = null;

    let graficoLucroInstance = null;

    let graficoCarteiraInstance = null;


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


    /* ==================================================
       MOEDA
    ================================================== */

    function moeda(valor) {

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
       OPÇÕES
    ================================================== */

    function opcoes() {

        return {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {

                        color:
                            "#cbd5e1"

                    }

                },

                tooltip: {

                    callbacks: {

                        label:
                            function (
                                contexto
                            ) {

                                return (
                                    contexto.dataset
                                        .label +
                                    ": " +
                                    moeda(
                                        contexto.raw
                                    )
                                );

                            }

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color:
                            "#94a3b8"

                    },

                    grid: {

                        color:
                            "rgba(148,163,184,.08)"

                    }

                },

                y: {

                    ticks: {

                        color:
                            "#94a3b8",

                        callback:
                            function (
                                valor
                            ) {

                                return moeda(
                                    valor
                                );

                            }

                    },

                    grid: {

                        color:
                            "rgba(148,163,184,.08)"

                    }

                }

            }

        };

    }


    /* ==================================================
       INVESTIMENTO X RETORNO
    ================================================== */

    function graficoInvestimento() {

        if (
            typeof Chart ===
            "undefined"
        ) {

            return;

        }


        const canvas =
            document.getElementById(
                "graficoInvestimento"
            );


        if (!canvas) {
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


        let investimento =
            0;


        let retorno =
            0;


        carros.forEach(
            function (carro) {

                investimento +=
                    Number(
                        carro.valorCompra
                    ) || 0;


                if (
                    typeof calcularCarro ===
                    "function"
                ) {

                    const calculo =
                        calcularCarro(
                            carro
                        );


                    retorno +=
                        (
                            calculo.rendaMin +
                            calculo.rendaMax
                        ) / 2;

                }

            }
        );


        if (
            graficoInvestimentoInstance
        ) {

            graficoInvestimentoInstance.destroy();

        }


        graficoInvestimentoInstance =
            new Chart(
                canvas,
                {

                    type:
                        "bar",

                    data: {

                        labels: [
                            "Carteira"
                        ],

                        datasets: [

                            {

                                label:
                                    "Investimento",

                                data: [
                                    investimento
                                ],

                                borderRadius:
                                    8

                            },

                            {

                                label:
                                    "Retorno",

                                data: [
                                    retorno
                                ],

                                borderRadius:
                                    8

                            }

                        ]

                    },

                    options:
                        opcoes()

                }
            );

    }


    /* ==================================================
       LUCRO POR VEÍCULO
    ================================================== */

    function graficoLucro() {

        if (
            typeof Chart ===
            "undefined"
        ) {

            return;

        }


        const canvas =
            document.getElementById(
                "graficoLucro"
            );


        if (!canvas) {
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


        const labels =
            carros.map(
                function (carro) {

                    return carro.nome;

                }
            );


        const valores =
            carros.map(
                function (carro) {

                    if (
                        typeof calcularCarro !==
                        "function"
                    ) {

                        return 0;

                    }


                    const calculo =
                        calcularCarro(
                            carro
                        );


                    return calculo.lucroMedio;

                }
            );


        if (
            graficoLucroInstance
        ) {

            graficoLucroInstance.destroy();

        }


        graficoLucroInstance =
            new Chart(
                canvas,
                {

                    type:
                        "bar",

                    data: {

                        labels,

                        datasets: [

                            {

                                label:
                                    "Lucro previsto",

                                data:
                                    valores,

                                borderRadius:
                                    8

                            }

                        ]

                    },

                    options:
                        opcoes()

                }
            );

    }


    /* ==================================================
       CARTEIRA
    ================================================== */

    function graficoCarteira() {

        if (
            typeof Chart ===
            "undefined"
        ) {

            return;

        }


        const canvas =
            document.getElementById(
                "graficoCarteira"
            );


        if (!canvas) {
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


        const historico =
            Array.isArray(
                dados.history
            )
                ? dados.history
                : [];


        let depositado =
            0;


        let sacado =
            0;


        let recebido =
            0;


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

                    depositado +=
                        valor;

                }


                if (
                    tipo === "saque" ||
                    tipo === "retirada"
                ) {

                    sacado +=
                        valor;

                }


                if (
                    tipo === "recebimento" ||
                    tipo === "rendimento" ||
                    tipo === "lucro"
                ) {

                    recebido +=
                        valor;

                }

            }
        );


        const investido =
            carros.reduce(
                function (
                    total,
                    carro
                ) {

                    return (
                        total +
                        (
                            Number(
                                carro.valorCompra
                            ) || 0
                        )
                    );

                },
                0
            );


        if (
            graficoCarteiraInstance
        ) {

            graficoCarteiraInstance.destroy();

        }


        graficoCarteiraInstance =
            new Chart(
                canvas,
                {

                    type:
                        "doughnut",

                    data: {

                        labels: [

                            "Investido",

                            "Saldo de depósitos",

                            "Lucro recebido",

                            "Sacado"

                        ],

                        datasets: [

                            {

                                data: [

                                    investido,

                                    Math.max(
                                        0,
                                        depositado -
                                        investido
                                    ),

                                    recebido,

                                    sacado

                                ],

                                borderWidth:
                                    0

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    color:
                                        "#cbd5e1"

                                }

                            }

                        }

                    }

                }
            );

    }


    /* ==================================================
       ATUALIZAR TODOS
    ================================================== */

    function atualizarGraficos() {

        graficoInvestimento();

        graficoLucro();

        graficoCarteira();

    }


    /* ==================================================
       GLOBAIS
    ================================================== */

    window.graficoInvestimento =
        graficoInvestimento;


    window.graficoLucro =
        graficoLucro;


    window.graficoCarteira =
        graficoCarteira;


    window.atualizarGraficos =
        atualizarGraficos;

})();