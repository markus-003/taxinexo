document.addEventListener("DOMContentLoaded", () => {

    const depositBtn =
        document.getElementById("depositBtn");

    const withdrawBtn =
        document.getElementById("withdrawBtn");

    if (depositBtn) {

        depositBtn.addEventListener(
            "click",
            depositar
        );
    }

    if (withdrawBtn) {

        withdrawBtn.addEventListener(
            "click",
            sacar
        );
    }

    renderizarCarteira();
    renderizarHistorico();
});

function getTotalDepositos() {

    const data = getData();

    return data.deposits.reduce(
        (total, item) =>
            total + Number(item.value),
        0
    );
}

function getTotalSaques() {

    const data = getData();

    return data.withdrawals.reduce(
        (total, item) =>
            total + Number(item.value),
        0
    );
}

function getTotalInvestido() {

    const data = getData();

    return data.carros.reduce(
        (total, car) =>
            total + Number(car.valorCompra),
        0
    );
}

function getSaldo() {

    return (
        getTotalDepositos() -
        getTotalSaques() -
        getTotalInvestido()
    );
}

function depositar() {

    const value =
        prompt("Digite o valor do depósito:");

    if (value === null) return;

    const amount =
        Number(
            value.replace(",", ".")
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert("Digite um valor válido.");

        return;
    }

    const description =
        prompt(
            "Descrição do depósito:",
            "Depósito"
        ) || "Depósito";

    const data = getData();

    const item = {

        id: generateId(),
        date: todayISO(),
        value: amount,
        description
    };

    data.deposits.push(item);

    data.history.push({

        id: generateId(),
        date: item.date,
        type: "Depósito",
        description: item.description,
        value: amount
    });

    saveData(data);

    renderizarCarteira();
    renderizarHistorico();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
}

function sacar() {

    const saldo =
        getSaldo();

    if (saldo <= 0) {

        alert(
            "Você não possui saldo disponível para saque."
        );

        return;
    }

    const value =
        prompt(
            `Saldo disponível: ${formatCurrency(saldo)}\n\nDigite o valor do saque:`
        );

    if (value === null) return;

    const amount =
        Number(
            value.replace(",", ".")
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert("Digite um valor válido.");

        return;
    }

    if (amount > saldo) {

        alert(
            "O valor do saque é maior que o saldo disponível."
        );

        return;
    }

    const description =
        prompt(
            "Descrição do saque:",
            "Saque"
        ) || "Saque";

    const data = getData();

    const item = {

        id: generateId(),
        date: todayISO(),
        value: amount,
        description
    };

    data.withdrawals.push(item);

    data.history.push({

        id: generateId(),
        date: item.date,
        type: "Saque",
        description: item.description,
        value: amount
    });

    saveData(data);

    renderizarCarteira();
    renderizarHistorico();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
}

function renderizarCarteira() {

    const balance =
        document.getElementById("walletBalance");

    const deposits =
        document.getElementById("walletDeposits");

    const withdrawals =
        document.getElementById("walletWithdrawals");

    if (balance) {
        balance.textContent =
            formatCurrency(getSaldo());
    }

    if (deposits) {
        deposits.textContent =
            formatCurrency(getTotalDepositos());
    }

    if (withdrawals) {
        withdrawals.textContent =
            formatCurrency(getTotalSaques());
    }
}

function renderizarHistorico() {

    const tbody =
        document.getElementById("historicoTableBody");

    if (!tbody) return;

    const data = getData();

    const history =
        [...data.history]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    if (!history.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-secondary py-5">
                    Nenhuma movimentação registrada.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        history.map(item => {

            const positive =
                ["Depósito", "Recebimento"]
                    .includes(item.type);

            return `
                <tr>

                    <td>
                        ${formatDate(item.date)}
                    </td>

                    <td>
                        ${item.type}
                    </td>

                    <td>
                        ${escapeHTML(item.description)}
                    </td>

                    <td class="${positive
                        ? "text-success"
                        : "text-danger"}">

                        ${positive ? "+" : "-"}
                        ${formatCurrency(item.value)}

                    </td>

                </tr>
            `;

        }).join("");
}
