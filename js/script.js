document.addEventListener("DOMContentLoaded", function () {
    const salesData = document.getElementById("sales-data");
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Carregar dados do localStorage
    const savedData = JSON.parse(localStorage.getItem("metaTracker_salesData")) || {};

    meses.forEach(mes => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${mes}</td>
            <td><input type="text" class="meta" placeholder="00.000,00" value="${savedData[mes]?.meta || ''}"></td>
            <td><input type="text" class="realizado" placeholder="00.000,00" value="${savedData[mes]?.realizado || ''}"></td>
            <td class="percentual">0,00%</td>
        `;

        salesData.appendChild(row);
    });

    // Seleciona automaticamente o texto ao focar no input
    salesData.addEventListener("focusin", function (e) {
        if (e.target.classList.contains('meta') || e.target.classList.contains('realizado')) {
            e.target.select();
        }
    });

    // Adiciona evento para formatar e calcular automaticamente após inserção
    salesData.addEventListener("input", function (e) {
        if (e.target.classList.contains('meta') || e.target.classList.contains('realizado')) {
            e.target.value = formatarNumero(e.target.value);
        }
        calcular();
    });

    // Executa o cálculo para exibir os percentuais salvos
    calcular();

    // Adicionar funcionalidade de geração de PDF
    document.getElementById("download-pdf").addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Meta Tracker", 14, 20);
        doc.text(`Vendedor: ${document.getElementById('vendedor').value}`, 14, 30);
        doc.text(`Ano: ${document.getElementById('ano').value}`, 14, 40);

        const rows = [];

        // Preenche as linhas da tabela para o PDF
        salesData.querySelectorAll("tr").forEach(tr => {
            const row = [];
            tr.querySelectorAll("td").forEach(td => {
                const input = td.querySelector("input");
                row.push(input ? input.value : td.textContent);
            });
            rows.push(row);
        });

        // Adiciona a tabela ao PDF
        doc.autoTable({
            head: [['Mês', 'Meta', 'Realizado', '%']],
            body: rows,
            startY: 50,
        });

        // Baixa o PDF
        doc.save('meta_tracker.pdf');
    });
});

function calcular() {
    const metas = document.querySelectorAll(".meta");
    const realizados = document.querySelectorAll(".realizado");
    const percentuais = document.querySelectorAll(".percentual");

    let salesData = {};

    metas.forEach((meta, index) => {
        let valorMeta = parseFloat(meta.value.replace(/\./g, '').replace(',', '.')) || 0;
        let valorRealizado = parseFloat(realizados[index].value.replace(/\./g, '').replace(',', '.')) || 0;
        let percentual = (valorRealizado / valorMeta) * 100;

        // Armazenar dados no objeto salesData
        let mes = meta.closest('tr').querySelector('td:first-child').textContent;
        salesData[mes] = {
            meta: meta.value,
            realizado: realizados[index].value
        };

        if (percentual === 0 || isNaN(percentual)) {
            percentuais[index].style.color = "#f0f0f0";  // Branco para 0,00%
            percentuais[index].textContent = "0,00%";
        } else if (percentual >= 100) {
            percentuais[index].style.color = "gold";  // Dourado para meta alcançada ou ultrapassada
            percentuais[index].textContent = percentual.toFixed(2).replace('.', ',') + "%";
        } else {
            percentuais[index].style.color = "red";  // Vermelho para meta não alcançada
            percentuais[index].textContent = percentual.toFixed(2).replace('.', ',') + "%";
        }
    });

    // Salvar os dados no localStorage com chave única
    localStorage.setItem("metaTracker_salesData", JSON.stringify(salesData));
}

function formatarNumero(valor) {
    valor = valor.replace(/\D/g, ""); // Remove qualquer caractere que não seja número
    valor = (valor / 100).toFixed(2) + ""; // Divide por 100 e fixa 2 casas decimais
    valor = valor.replace(".", ","); // Substitui o ponto por vírgula
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Adiciona pontos a cada 3 dígitos
    return valor;
}
