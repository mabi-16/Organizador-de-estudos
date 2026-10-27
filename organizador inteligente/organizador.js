

document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTOS PRINCIPAIS
    const tabelas = document.querySelectorAll("table");
    const tabelaHorarios = tabelas[0];
    const tabelaNotas = tabelas[1];
    const materias = document.querySelector(".materias");

    if (!materias) return;

    // 1. CRIAR ÁREA DE INFORMAÇÕES
    const painel = document.createElement("section");
    painel.id = "painel-materia";
    painel.innerHTML = `
        <h3>📚 Detalhes da matéria</h3>
        <p>Clique em uma matéria do seu horário para ver seus detalhes.</p>
    `;

    materias.parentNode.insertBefore(painel, materias);

    // 2. ADICIONAR BUSCA DE MATÉRIAS
    const busca = document.createElement("input");
    busca.type = "search";
    busca.placeholder = "🔎 Procurar uma matéria...";
    busca.id = "buscar-materia";
    busca.setAttribute("aria-label", "Procurar uma matéria");

    materias.parentNode.insertBefore(busca, materias);

    busca.addEventListener("input", function () {
        const termo = busca.value.toLowerCase().trim();

        materias.querySelectorAll("details").forEach(function (item) {
            const nome = item.querySelector("summary").textContent.toLowerCase();
            item.hidden = !nome.includes(termo);
        });
    });

    // 3. TRANSFORMAR AS MATÉRIAS DO HORÁRIO EM LINKS CLICÁVEIS
    if (tabelaHorarios) {
        tabelaHorarios.querySelectorAll("tr:not(:first-child) td:not(:first-child)")
            .forEach(function (celula) {

                const nome = celula.textContent.trim();

                if (
                    nome &&
                    !["INTERVALO", "ALMOÇO"].includes(nome.toUpperCase())
                ) {
                    celula.classList.add("materia-clicavel");
                    celula.title = "Clique para ver os detalhes";

                    celula.addEventListener("click", function () {
                        mostrarMateria(nome);
                    });
                }
            });
    }

    function mostrarMateria(nome) {
        const normalizar = texto =>
            texto.toLowerCase().trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const detalhe = [...materias.querySelectorAll("details")]
            .find(item =>
                normalizar(item.querySelector("summary").textContent) ===
                normalizar(nome)
            );

        painel.replaceChildren();

        const titulo = document.createElement("h3");
        titulo.textContent = "📚 " + nome;
        painel.appendChild(titulo);

        if (detalhe) {
            const copia = detalhe.cloneNode(true);
            copia.open = true;
            painel.appendChild(copia);
        } else {
            const texto = document.createElement("p");
            texto.textContent =
                "Ainda não há informações cadastradas para esta matéria.";
            painel.appendChild(texto);
        }

        painel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    // 4. ADICIONAR CHECKBOXES PARA PROVAS E TRABALHOS
    materias.querySelectorAll("details p").forEach(function (paragrafo) {

        const texto = paragrafo.textContent.trim();

        if (
            texto &&
            !texto.toLowerCase().includes("ainda não há provas")
        ) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "tarefa-concluida";
            checkbox.setAttribute(
                "aria-label",
                "Marcar tarefa como concluída: " + texto
            );

            paragrafo.classList.add("item-tarefa");
            paragrafo.prepend(checkbox);

            checkbox.addEventListener("change", function () {
                paragrafo.classList.toggle(
                    "concluida",
                    checkbox.checked
                );
            });
        }
    });

    // 5. CALCULAR AUTOMATICAMENTE AS MÉDIAS
    if (tabelaNotas) {
        const linhas = [...tabelaNotas.querySelectorAll("tr")];

        linhas.slice(1).forEach(function (linha) {
            const celulas = [...linha.querySelectorAll("td")];

            if (celulas.length < 2) return;

            const notas = celulas.slice(1).map(celula =>
                celula.textContent.trim()
            );

            const valoresValidos = notas.every(valor =>
                valor !== "" && !isNaN(Number(valor))
            );

            const media = valoresValidos
                ? notas.reduce((soma, valor) => soma + Number(valor), 0)
                    / notas.length
                : null;

            const celulaMedia = document.createElement("td");

            if (media !== null) {
                celulaMedia.textContent = media.toFixed(1);
                celulaMedia.classList.add("media-nota");
            } else {
                celulaMedia.textContent = "—";
            }

            linha.appendChild(celulaMedia);
        });
    }

});
