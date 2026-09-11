/* =========================================================
   TAXINEXO - CARROS.JS
   Gerenciamento de veículos
   ========================================================= */


let carroModalInstance = null;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const modalElement = document.getElementById("carroModal");

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


    const novoBtn =
        document.getElementById("novoCarroBtn");

    if (novoBtn) {

        novoBtn.addEventListener(
            "click",
            abrirModalNovoCarro
        );

    }


    renderizarCarros();

});


/* =========================================================
   CONTAGEM DE DIAS
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
   STATUS
   ========================================================= */

function calcularStatus(
    dataFim,
    diasRestantes
) {

    if (!dataFim) {
        return "Encerrado";
    }


    const hoje =
        new Date();

    hoje.setHours(0, 0, 0, 0);


    const fim =
        new Date(`${dataFim}T00:00:00`);


    if (fim <= hoje) {

        return "Encerrado";

    }


    if (diasRestantes <= 3) {

        return "Vencendo";

    }


    return "Ativo";

}


/* =========================================================
   CÁLCULO DO VEÍCULO
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


    /*
       NOVA REGRA:

       rendaTotalMin e rendaTotalMax
       já representam o rendimento TOTAL
       do veículo.

       Portanto NÃO multiplicamos
       esses valores pelos dias.
    */


    const rendaTotalMin =
        Number(
            car.rendaTotalMin ??
            car.rendaMin ??
            0
        );


    const rendaTotalMax =
        Number(
            car.rendaTotalMax ??
            car.rendaMax ??
            0
        );


    const valorCompra =
        Number(car.valorCompra || 0);


    const lucroMin =
        rendaTotalMin - valorCompra;


    const lucroMax =
        rendaTotalMax - valorCompra;


    const status =
        calcularStatus(
            car.dataFim,
            diasRestantes
        );


    return {

        diasPeriodo,

        diasRestantes,

        rendaTotalMin,

        rendaTotalMax,

        rendimentoMin: rendaTotalMin,

        rendimentoMax: rendaTotalMax,

        lucroMin,

        lucroMax,

        trabalhaDomingo,

        status

    };

}


/* =========================================================
   ABRIR NOVO VEÍCULO
   ========================================================= */

function abrirModalNovoCarro() {

    const form =
        document.getElementById("carroForm");


    if (form) {
        form.reset();
    }


    document.getElementById(
        "carroId"
    ).value = "";


    document.getElementById(
        "carroTrabalhaDomingo"
    ).value = "true";


    const titulo =
        document.getElementById(
            "carroModalTitle"
        );


    if (titulo) {

        titulo.textContent =
            "Novo veículo";

    }


    if (carroModalInstance) {

        carroModalInstance.show();

    }

}


/* =========================================================
   SALVAR VEÍCULO
   ========================================================= */

function salvarCarro(event) {

    event.preventDefault();


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
        ).value === "true";


    /* =====================================================
       VALIDAÇÕES
       ===================================================== */

    if (!nome) {

        alert(
            "Informe o nome do veículo."
        );

        return;

    }


    if (
        !Number.isFinite(valorCompra) ||
        valorCompra < 0
    ) {

        alert(
            "Informe um valor de compra válido."
        );

        return;

    }


    if (!dataCompra || !dataFim) {

        alert(
            "Informe as datas de compra e término."
        );

        return;

    }


    if (dataFim <= dataCompra) {

        alert(
            "A data de término deve ser posterior à data de compra."
        );

        return;

    }


    if (
        !Number.isFinite(rendaTotalMin) ||
        rendaTotalMin < 0
    ) {

        alert(
            "Informe uma renda total mínima válida."
        );

        return;

    }


    if (
        !Number.isFinite(rendaTotalMax) ||
        rendaTotalMax < 0
    ) {

        alert(
            "Informe uma renda total máxima válida."
        );

        return;

    }


    if (rendaTotalMax < rendaTotalMin) {

        alert(
            "A renda total máxima deve ser maior ou igual à renda total mínima."
        );

        return;

    }


    /* =====================================================
       STORAGE
       ===================================================== */

    const data =
        typeof getData === "function"
            ? getData()
            : {
                carros: [],
                history: []
            };


    if (!Array.isArray(data.carros)) {

        data.carros = [];

    }


    if (!Array.isArray(data.history)) {

        data.history = [];

    }


    /* =====================================================
       VEÍCULO
       ===================================================== */

    const carro = {

        id:
            id ||
            (
                typeof generateId === "function"
                    ? generateId()
                    : Date.now().toString()
            ),

        nome,

        valorCompra,

        dataCompra,

        dataFim,

        rendaTotalMin,

        rendaTotalMax,

        /*
           Mantemos os campos antigos também para
           evitar problemas com dados antigos.
        */

        rendaMin: rendaTotalMin,

        rendaMax: rendaTotalMax,

        trabalhaDomingo

    };


    /* =====================================================
       EDITAR
       ===================================================== */

    const indice =
        data.carros.findIndex(
            car => car.id === carro.id
        );


    if (indice >= 0) {

        data.carros[indice] =
            carro;

    } else {

        data.carros.push(carro);


        /*
           Histórico somente para
           veículo novo.
        */

        data.history.push({

            id:
                typeof generateId === "function"
                    ? generateId()
                    : Date.now().toString(),

            date:
                typeof todayISO === "function"
                    ? todayISO()
                    : new Date()
                        .toISOString()
                        .split("T")[0],

            type:
                "Investimento",

            description:
                `Compra do veículo ${carro.nome}`,

            value:
                carro.valorCompra

        });

    }


    /* =====================================================
       SALVAR
       ===================================================== */

    if (typeof saveData === "function") {

        saveData(data);

    }


    /* =====================================================
       ATUALIZAR
       ===================================================== */

    renderizarCarros();


    if (
        typeof atualizarDashboard === "function"
    ) {

        atualizarDashboard();

    }


    if (carroModalInstance) {

        carroModalInstance.hide();

    }

}


/* =========================================================
   EDITAR VEÍCULO
   ========================================================= */

function editarCarro(id) {

    const data =
        typeof getData === "function"
            ? getData()
            : null;


    if (
        !data ||
        !Array.isArray(data.carros)
    ) {

        return;

    }


    const carro =
        data.carros.find(
            item => item.id === id
        );


    if (!carro) {

        alert(
            "Veículo não encontrado."
        );

        return;

    }


    document.getElementById(
        "carroId"
    ).value = carro.id;


    document.getElementById(
        "carroNome"
    ).value = carro.nome || "";


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


    /*
       Compatibilidade com veículos antigos.
    */

    const rendaMin =
        carro.rendaTotalMin ??
        carro.rendaMin ??
        0;


    const rendaMax =
        carro.rendaTotalMax ??
        carro.rendaMax ??
        0;


    document.getElementById(
        "carroRendaTotalMin"
    ).value = rendaMin;


    document.getElementById(
        "carroRendaTotalMax"
    ).value = rendaMax;


    document.getElementById(
        "carroTrabalhaDomingo"
    ).value =
        carro.trabalhaDomingo === false
            ? "false"
            : "true";


    const titulo =
        document.getElementById(
            "carroModalTitle"
        );


    if (titulo) {

        titulo.textContent =
            "Editar veículo";

    }


    if (carroModalInstance) {

        carroModalInstance.show();

    }

}


/* =========================================================
   EXCLUIR VEÍCULO
   ========================================================= */

function removerCarro(id) {

    const data =
        typeof getData === "function"
            ? getData()
            : null;


    if (
        !data ||
        !Array.isArray(data.carros)
    ) {

        return;

    }


    const carro =
        data.carros.find(
            item => item.id === id
        );


    if (!carro) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja realmente excluir o veículo "${carro.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    data.carros =
        data.carros.filter(
            item => item.id !== id
        );


    if (typeof saveData === "function") {

        saveData(data);

    }


    renderizarCarros();


    if (
        typeof atualizarDashboard === "function"
    ) {

        atualizarDashboard();

    }

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
        typeof getData === "function"
            ? getData()
            : {
                carros: []
            };


    const carros =
        Array.isArray(data.carros)
            ? data.carros
            : [];


    tbody.innerHTML = "";


    if (carros.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-secondary py-4"
                >
                    Nenhum veículo cadastrado.
                </td>

            </tr>

        `;

        return;

    }


    carros.forEach(car => {

        const calculo =
            calcularCarro(car);


        const rendaMin =
            calculo.rendaTotalMin;


        const rendaMax =
            calculo.rendaTotalMax;


        const lucroMin =
            calculo.lucroMin;


        const lucroMax =
            calculo.lucroMax;


        let statusBadge = "";


        if (calculo.status === "Ativo") {

            statusBadge = `
                <span class="badge bg-success">
                    Ativo
                </span>
            `;

        } else if (
            calculo.status === "Vencendo"
        ) {

            statusBadge = `
                <span class="badge bg-warning text-dark">
                    Vencendo
                </span>
            `;

        } else {

            statusBadge = `
                <span class="badge bg-danger">
                    Encerrado
                </span>
            `;

        }


        const valorCompra =
            formatarMoeda(
                car.valorCompra
            );


        const rendaTotal =
            `${formatarMoeda(rendaMin)}
             até
             ${formatarMoeda(rendaMax)}`;


        const lucroPrevisto =
            `${formatarMoeda(lucroMin)}
             até
             ${formatarMoeda(lucroMax)}`;


        const domingo =
            calculo.trabalhaDomingo
                ? "Sim"
                : "Não";


        const periodo = `

            <div>
                ${calculo.diasPeriodo} dias
            </div>

            <small class="text-secondary">
                ${calculo.diasRestantes}
                restantes
            </small>

            <br>

            <small class="text-secondary">
                Domingo: ${domingo}
            </small>

        `;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <strong>
                    ${escapeHTMLSeguro(car.nome)}
                </strong>

            </td>


            <td>
                ${valorCompra}
            </td>


            <td>
                ${periodo}
            </td>


            <td>

                <div>
                    ${rendaTotal}
                </div>

                <small class="text-secondary">
                    Renda total
                </small>

            </td>


            <td>
                ${lucroPrevisto}
            </td>


            <td>
                ${statusBadge}
            </td>


            <td>

                <div class="btn-group">

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="editarCarro('${car.id}')"
                        title="Editar"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick="removerCarro('${car.id}')"
                        title="Excluir"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   FORMATAÇÃO
   ========================================================= */

function formatarMoeda(valor) {

    const numero =
        Number(valor) || 0;


    if (typeof formatCurrency === "function") {

        return formatCurrency(numero);

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTMLSeguro(valor) {

    if (
        typeof escapeHTML === "function"
    ) {

        return escapeHTML(
            String(valor ?? "")
        );

    }


    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}