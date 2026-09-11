const STORAGE_KEY = "carInvestData";

const defaultData = {
    users: [],
    currentUser: null,
    carros: [],
    deposits: [],
    withdrawals: [],
    history: [],
    theme: "dark"
};

function getData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        return structuredClone(defaultData);
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        return structuredClone(defaultData);
    }
}

function saveData(data) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

function updateData(callback) {
    const data = getData();

    callback(data);

    saveData(data);

    return data;
}

function backupData() {
    const data = getData();

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `car-invest-backup-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

function importData(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function () {

            try {

                const imported = JSON.parse(reader.result);

                if (
                    typeof imported !== "object" ||
                    imported === null
                ) {
                    throw new Error("Arquivo inválido.");
                }

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(imported)
                );

                resolve(imported);

            } catch (error) {
                reject(error);
            }

        };

        reader.onerror = function () {
            reject(new Error("Não foi possível ler o arquivo."));
        };

        reader.readAsText(file);
    });
}

function generateId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2);
}

function formatCurrency(value) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(Number(value) || 0);
}

function formatDate(date) {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
        return date;
    }

    return `${day}/${month}/${year}`;
}

function todayISO() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}