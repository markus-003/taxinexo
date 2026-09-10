let carroModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("carrosTableBody")) {
        return;
    }

    const modalElement =
        document.getElementById("carroModal");

    if (modalElement && window.bootstrap) {
        carroModalInstance =
            new bootstrap.Modal(modalElement);
    }

    const form =
        document.getElementById("carroForm");

    if (form) {
        form.addEventListener(
            "submit",
            salvarCarro
        );
    }

    const newCarBtn =
        document.getElementById("newCarBtn");

    if (newCarBtn) {
        newCarBtn.addEventListener(
            "click",
            limparFormularioCarro
        );
    }

    renderizarCarros();
});


/* =========================================================
   CONTAGEM DE DIAS DE RENDIMENTO
========================================================= */

function contarDiasRendimento(
    dataInicio,
    dataFim,
    trabalhaDomingo = true
) {

    if (!dataInicio || !dataFim) {
        return 0;
    }

    const inicio =
        new Date(`${dataInicio}T00:00:00`);

    const fim =
        new Date(`${dataFim}T00:00:00`);

    if (fim <= inicio) {
        return 0;
    }

    let dias = 0;

    const dataAtual =
        new Date(inicio);

    /*
        Mantemos a mesma regra anterior:
        o dia de término não entra na contagem.

        Exemplo:
        10/09 -> 25/09 = 15 dias
    */

    while (dataAtual < fim) {

        const diaSemana =
            dataAtual.getDay();

        /*
            getDay():

            0 = Domingo
            1 = Segunda
            2 = Terça
            3 = Quarta
            4 = Quinta
            5 = Sexta
            6 = Sábado
        */

        if (
            diaSemana !== 0 ||
            trabalhaDomingo
        ) {
            dias++;
        }

        dataAtual.setDate(
            dataAtual.getDate() + 1
        );
    }

    return dias;
}


/* =========================================================
   DIAS RESTANTES
========================================================= */

function calcularDiasRestantes(
    dataFim,
    trabalhaDomingo = true
) {

    if (!dataFim) {
        return 0;
    }

    const hoje =
        new Date();

    hoje.setHours(0, 0, 0, 0);

    const fim =
        new Date(`${dataFim}T00:00:00`);

    if (fim <= hoje) {
        return 0;
    }

    let dias = 0;

    const dataAtual =
        new Date(hoje);

    while (dataAtual < fim) {

        const diaSemana =
            dataAtual.getDay();

        if (
            diaSemana !== 0 ||
            trabalhaDomingo
        ) {
            dias++;
        }

        dataAtual.setDate(
            dataAtual.getDate() + 1
        );
    }

    return dias;
}


/* =========================================================
   COMPATIBILIDADE
========================================================= */

function calcularDias(dataFim) {

    return calcularDiasRestantes(
        dataFim,
        true
    );
}


/* =========================================================
   STATUS
========================================================= */

function obterStatus(
    dataFim,
    trabalhaDomingo = true
) {

    const dias =
        calcularDiasRestantes(
            dataFim,
            trabalhaDomingo
        );

    const hoje =
        new Date();

    hoje.setHours(0, 0, 0, 0);

    const fim =
        new Date(`${dataFim}T00:00:00`);

    if (fim <= hoje) {

        return {
            texto: "Encerrado",
            classe: "status-ended"
        };
    }

    if (dias <= 3) {

        return {
            texto: "Vencendo",
            classe: "status-ending"
        };
    }

    return {
        texto: "Ativo",
        classe: "status-active"
    };
}


/* =========================================================
   CÁLCULOS DO VEÍCULO
========================================================= */

function calcularCarro(car) {

    const trabalhaDomingo =
        car.trabalhaDomingo !== false;

    const diasPeriodo =
        contarDiasRendimento(
            car.dataCompra,
            car.dataFim,
            trabalhaDomingo
        );

    const diasRestantes =
        calcularDiasRestantes(
            car.dataFim,
            trabalhaDomingo
        );

    const rendimentoMin =
        Number(car.rendaMin) *
        diasPeriodo;

    const rendimentoMax =
        Number(car.rendaMax) *
        diasPeriodo;

    const lucroMin =
        rendimentoMin -
        Number(car.valorCompra);

    const lucroMax =
        rendimentoMax -
        Number(car.valorCompra);

    return {

        diasPeriodo,

        diasRestantes,

        rendimentoMin,

        rendimentoMax,

        lucroMin,

        lucroMax,

        trabalhaDomingo
    };
}


/* =========================================================
   SALVAR VEÍCULO
========================================================= */

function salvarCarro(event) {

    event.preventDefault();

    const id =
        document.getElementById("carroId").value;

    const trabalhaDomingo =
        document.getElementById(
            "carroTrabalhaDomingo"
        ).value === "true";

    const carro = {

        id:
            id || generateId(),

        nome:
            document.getElementById(
                "carroNome"
            ).value.trim(),

        valorCompra:
            Number(
                document.getElementById(
                    "carroValor"
                ).value
            ),

        dataCompra:
            document.getElementById(
                "carroDataCompra"
            ).value,

        dataFim:
            document.getElementById(
                "carroDataFim"
            ).value,

        rendaMin:
            Number(
                document.getElementById(
                    "carroRendaMin"
                ).value
            ),

        rendaMax:
            Number(
                document.getElementById(
                    "carroRendaMax"
                ).value
            ),

        trabalhaDomingo
    };


    /* =====================================================
       VALIDAÇÕES
    ===================================================== */

    if (
        carro.rendaMax <
        carro.rendaMin
    ) {

        alert(
            "A renda máxima não pode ser menor que a mínima."
        );

        return;
    }


    if (
        carro.dataFim <=
        carro.dataCompra
    ) {

        alert(
            "A data de término deve ser posterior à data da compra."
        );

        return;
    }


    /* =====================================================
       SALVAR
    ===================================================== */

    const data =
        getData();

    const index =
        data.carros.findIndex(
            item =>
                item.id === carro.id
        );


    if (index >= 0) {

        data.carros[index] =
            carro;

    } else {

        data.carros.push(
            carro
        );

        data.history.push({

            id:
                generateId(),

            date:
                todayISO(),

            type:
                "Investimento",

            description:
                `Compra do veículo ${carro.nome}`,

            value:
                carro.valorCompra
        });
    }


    saveData(data);

    renderizarCarros();


    if (
        typeof atualizarDashboard ===
        "function"
    ) {

        atualizarDashboard();
    }


    if (carroModalInstance) {

        carroModalInstance.hide();
    }

    limparFormularioCarro();
}


/* =========================================================
   RENDERIZAR VEÍCULOS
========================================================= */

function renderizarCarros() {

    const tbody =
        document.getElementById(
            "carrosTableBody"
        );

    if (!tbody) {
        return;
    }

    const data =
        getData();


    if (!data.carros.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center text-secondary py-5"
                >
                    Nenhum veículo cadastrado.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        data.carros.map(car => {

            const calc =
                calcularCarro(car);

            const status =
                obterStatus(
                    car.dataFim,
                    calc.trabalhaDomingo
                );


            const renda =
                `${formatCurrency(car.rendaMin)}
                - ${formatCurrency(car.rendaMax)}`;


            const lucro =
                `${formatCurrency(calc.lucroMin)}
                - ${formatCurrency(calc.lucroMax)}`;


            const domingo =
                calc.trabalhaDomingo
                    ? "Domingo: Sim"
                    : "Domingo: Não";


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(car.nome)}
                        </strong>

                        <small class="d-block text-secondary">
                            ${calc.diasRestantes > 0
                                ? `${calc.diasRestantes} dias de rendimento restantes`
                                : "Período encerrado"}
                        </small>

                        <small class="d-block text-secondary">
                            ${domingo}
                        </small>
                    </td>


                    <td>

                        ${formatCurrency(
                            car.valorCompra
                        )}

                        <small class="d-block text-secondary">
                            ${formatDate(
                                car.dataCompra
                            )}
                        </small>

                    </td>


                    <td>

                        ${calc.diasPeriodo} dias

                    </td>


                    <td>

                        ${renda}

                    </td>


                    <td class="text-success">

                        ${lucro}

                    </td>


                    <td>

                        <span
                            class="badge-status ${status.classe}"
                        >
                            ${status.texto}
                        </span>

                    </td>


                    <td>

                        <button
                            class="btn btn-sm btn-outline-primary me-1"
                            onclick="editarCarro('${car.id}')"
                            title="Editar"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>


                        <button
                            class="btn btn-sm btn-outline-danger"
                            onclick="removerCarro('${car.id}')"
                            title="Excluir"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   EDITAR
========================================================= */

function editarCarro(id) {

    const data =
        getData();

    const carro =
        data.carros.find(
            item =>
                item.id === id
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
        carro.nome;


    document.getElementById(
        "carroValor"
    ).value =
        carro.valorCompra;


    document.getElementById(
        "carroDataCompra"
    ).value =
        carro.dataCompra;


    document.getElementById(
        "carroDataFim"
    ).value =
        carro.dataFim;


    document.getElementById(
        "carroRendaMin"
    ).value =
        carro.rendaMin;


    document.getElementById(
        "carroRendaMax"
    ).value =
        carro.rendaMax;


    document.getElementById(
        "carroTrabalhaDomingo"
    ).value =
        carro.trabalhaDomingo !== false
            ? "true"
            : "false";


    document.getElementById(
        "carroModalTitle"
    ).textContent =
        "Editar veículo";


    if (carroModalInstance) {

        carroModalInstance.show();
    }
}


/* =========================================================
   EXCLUIR
========================================================= */

function removerCarro(id) {

    const data =
        getData();

    const carro =
        data.carros.find(
            item =>
                item.id === id
        );

    if (!carro) {
        return;
    }


    const confirmacao =
        confirm(
            `Deseja realmente excluir o veículo "${carro.nome}"?`
        );


    if (!confirmacao) {
        return;
    }


    data.carros =
        data.carros.filter(
            item =>
                item.id !== id
        );


    saveData(data);

    renderizarCarros();


    if (
        typeof atualizarDashboard ===
        "function"
    ) {

        atualizarDashboard();
    }
}


/* =========================================================
   LIMPAR FORMULÁRIO
========================================================= */

function limparFormularioCarro() {

    const form =
        document.getElementById(
            "carroForm"
        );

    if (!form) {
        return;
    }


    form.reset();


    document.getElementById(
        "carroId"
    ).value = "";


    document.getElementById(
        "carroModalTitle"
    ).textContent =
        "Novo veículo";


    document.getElementById(
        "carroDataCompra"
    ).value =
        todayISO();


    /*
        Para novos veículos,
        deixamos Sim como padrão.
    */

    document.getElementById(
        "carroTrabalhaDomingo"
    ).value =
        "true";
}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}
