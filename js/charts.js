let lucroChartInstance = null;
let carteiraChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("lucroChart")) {
        return;
    }

    atualizarDashboard();
});

function atualizarDashboard() {

    const data = getData();

    const totalDepositado =
        data.deposits.reduce(
            (sum, item) =>
                sum + Number(item.value),
            0
        );

    const totalSacado =
        data.withdrawals.reduce(
            (sum, item) =>
                sum + Number(item.value),
            0
        );

    const totalInvestido =
        data.carros.reduce(
            (sum, car) =>
                sum + Number(car.valorCompra),
            0
        );

    let lucroPrevisto = 0;

    data.carros.forEach(car => {

        const calc =
            calcularCarro(car);

        lucroPrevisto +=
            calc.lucroMax;
    });

    const saldo =
        totalDepositado -
        totalSacado -
        totalInvestido;

    const roi =
        totalInvestido > 0
            ? (lucroPrevisto / totalInvestido) * 100
            : 0;

    const ativos =
        data.carros.filter(
            car =>
                calcularDias(car.dataFim) > 0
        ).length;

    setText(
        "saldoAtual",
        formatCurrency(saldo)
    );

    setText(
        "totalDepositado",
        formatCurrency(totalDepositado)
    );

    setText(
        "totalSacado",
        formatCurrency(totalSacado)
    );

    setText(
        "totalInvestido",
        formatCurrency(totalInvestido)
    );

    setText(
        "lucroPrevisto",
        formatCurrency(lucroPrevisto)
    );

    setText(
        "lucroRecebido",
        formatCurrency(0)
    );

    setText(
        "roi",
        `${roi.toFixed(2)}%`
    );

    setText(
        "veiculosAtivos",
        ativos
    );

    renderizarGraficoLucro(data);
    renderizarGraficoCarteira(
        totalDepositado,
        totalSacado,
        totalInvestido,
        saldo
    );
}

function renderizarGraficoLucro(data) {

    const canvas =
        document.getElementById("lucroChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels =
        data.carros.map(
            car => car.nome
        );

    const investimento =
        data.carros.map(
            car => Number(car.valorCompra)
        );

    const retorno =
        data.carros.map(
            car => {

                const calc =
                    calcularCarro(car);

                return calc.rendimentoMax;
            }
        );

    if (lucroChartInstance) {
        lucroChartInstance.destroy();
    }

    lucroChartInstance =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        label: "Investimento",
                        data: investimento,
                        backgroundColor:
                            "rgba(37, 99, 235, .75)",
                        borderRadius: 6
                    },

                    {
                        label: "Retorno previsto",
                        data: retorno,
                        backgroundColor:
                            "rgba(34, 197, 94, .75)",
                        borderRadius: 6
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        labels: {
                            color: "#94a3b8"
                        }
                    }

                },

                scales: {

                    x: {
                        ticks: {
                            color: "#94a3b8"
                        },
                        grid: {
                            color: "rgba(148,163,184,.08)"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#94a3b8"
                        },
                        grid: {
                            color: "rgba(148,163,184,.08)"
                        }
                    }

                }

            }

        });
}

function renderizarGraficoCarteira(
    depositado,
    sacado,
    investido,
    saldo
) {

    const canvas =
        document.getElementById("carteiraChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    if (carteiraChartInstance) {
        carteiraChartInstance.destroy();
    }

    carteiraChartInstance =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Investido",
                    "Saldo disponível",
                    "Sacado"
                ],

                datasets: [

                    {
                        data: [
                            Math.max(investido, 0),
                            Math.max(saldo, 0),
                            Math.max(sacado, 0)
                        ],

                        backgroundColor: [
                            "#2563eb",
                            "#22c55e",
                            "#ef4444"
                        ],

                        borderWidth: 0
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#94a3b8"
                        }
                    }

                }

            }

        });
}

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}
