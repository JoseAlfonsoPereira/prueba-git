document.addEventListener("DOMContentLoaded", () => {
    iniciarFiltroPartidas();
    iniciarFormularioContacto();
});

function iniciarFiltroPartidas() {
    const selectorDia = document.getElementById("filtro-dia");
    const selectorNivel = document.getElementById("filtro-nivel");
    const contador = document.getElementById("contador-partidas");
    const filas = document.querySelectorAll("table tbody tr");

    if (!selectorDia || !contador || filas.length === 0) {
        return;
    }

    function aplicarFiltros() {
        const diaSeleccionado = selectorDia.value;
        const nivelSeleccionado = selectorNivel ? selectorNivel.value : "todos";
        let visibles = 0;

        filas.forEach((fila) => {
            const celdas = fila.querySelectorAll("td");
            const nivelTexto = celdas[2] ? celdas[2].textContent.trim() : "";
            const diaFila = celdas[4] ? celdas[4].textContent.trim() : "";

            const nivelInicial = parseInt(nivelTexto.split("-")[0], 10);
            const coincideDia = diaSeleccionado === "todos" || diaFila === diaSeleccionado;

            let coincideNivel = true;
            if (nivelSeleccionado === "bajo") {
                coincideNivel = nivelInicial === 1;
            } else if (nivelSeleccionado === "intermedio") {
                coincideNivel = nivelInicial >= 3;
            }

            const coincide = coincideDia && coincideNivel;
            fila.hidden = !coincide;

            if (coincide) {
                visibles++;
            }
        });

        contador.textContent =
            visibles === 1
                ? "Mostrando 1 campaña"
                : `Mostrando ${visibles} campañas`;
    }

    selectorDia.addEventListener("change", aplicarFiltros);
    if (selectorNivel) {
        selectorNivel.addEventListener("change", aplicarFiltros);
    }
}

function iniciarFormularioContacto() {
    const formulario = document.getElementById("form-contacto");
    const confirmacion = document.getElementById("confirmacion-contacto");

    if (!formulario || !confirmacion) {
        return;
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nombreInput = document.getElementById("nombre");
        const campaniaSelect = document.getElementById("campania");

        const nombre = nombreInput ? nombreInput.value.trim() : "Aventurero";
        const campaniaTexto =
            campaniaSelect && campaniaSelect.selectedOptions.length > 0
                ? campaniaSelect.selectedOptions[0].textContent.trim()
                : "la campaña seleccionada";

        confirmacion.textContent = `¡Solicitud registrada, ${nombre}! Hemos anotado tu interés en "${campaniaTexto}".`;
        confirmacion.hidden = false;

        formulario.reset();
    });
}