const CLAVE_CAMPANIA = "dndhub_campania_seleccionada";
const CLAVE_SOLICITUDES = "dndhub_solicitudes_recientes";

document.addEventListener("DOMContentLoaded", () => {
    iniciarFiltroPartidas();
    iniciarEnlacesSolicitud();
    iniciarPreseleccionCampania();
    iniciarFormularioContacto();
});

function iniciarFiltroPartidas() {
    const selectorDia = document.getElementById("filtro-dia");
    const selectorNivel = document.getElementById("filtro-nivel");
    const botonRestablecer = document.getElementById("restablecer-filtros");
    const contador = document.getElementById("contador-partidas");
    const sinResultados = document.getElementById("sin-resultados");
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

        if (sinResultados) {
            sinResultados.hidden = visibles > 0;
        }
    }

    selectorDia.addEventListener("change", aplicarFiltros);
    if (selectorNivel) {
        selectorNivel.addEventListener("change", aplicarFiltros);
    }

    if (botonRestablecer) {
        botonRestablecer.addEventListener("click", () => {
            selectorDia.value = "todos";
            if (selectorNivel) {
                selectorNivel.value = "todos";
            }
            aplicarFiltros();
        });
    }
}

function iniciarEnlacesSolicitud() {
    const enlaces = document.querySelectorAll(".enlace-solicitar");
    if (enlaces.length === 0) {
        return;
    }

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", () => {
            const valorCampania = enlace.dataset.campania;
            if (valorCampania) {
                try {
                    localStorage.setItem(CLAVE_CAMPANIA, valorCampania);
                } catch (error) {
                    // Ignorar si el navegador bloquea localStorage
                }
            }
        });
    });
}

function iniciarPreseleccionCampania() {
    const selectorCampania = document.getElementById("campania");
    if (!selectorCampania) {
        return;
    }

    try {
        const guardada = localStorage.getItem(CLAVE_CAMPANIA);
        if (guardada) {
            const existeOpcion = Array.from(selectorCampania.options).some(
                (opcion) => opcion.value === guardada
            );
            if (existeOpcion) {
                selectorCampania.value = guardada;
            }
            localStorage.removeItem(CLAVE_CAMPANIA);
        }
    } catch (error) {
        // Ignorar si el navegador bloquea localStorage
    }
}

function leerSolicitudesGuardadas() {
    try {
        const raw = localStorage.getItem(CLAVE_SOLICITUDES);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function guardarSolicitudes(solicitudes) {
    try {
        localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes));
    } catch (error) {
        // Ignorar si el navegador bloquea localStorage
    }
}

function iniciarFormularioContacto() {
    const formulario = document.getElementById("form-contacto");
    const confirmacion = document.getElementById("confirmacion-contacto");
    const seccionSolicitudes = document.getElementById("seccion-solicitudes");
    const listaSolicitudes = document.getElementById("lista-solicitudes");
    const botonBorrar = document.getElementById("borrar-solicitudes");

    if (!formulario || !confirmacion) {
        return;
    }

    function renderizarSolicitudes(solicitudes) {
        if (!seccionSolicitudes || !listaSolicitudes) {
            return;
        }

        listaSolicitudes.innerHTML = "";

        if (solicitudes.length === 0) {
            seccionSolicitudes.hidden = true;
            return;
        }

        solicitudes.forEach((item) => {
            const li = document.createElement("li");
            const fuerte = document.createElement("strong");
            fuerte.textContent = item.nombre;

            const textoCampania = document.createTextNode(` — ${item.campania}`);
            li.appendChild(fuerte);
            li.appendChild(textoCampania);

            if (item.mensaje) {
                const detalle = document.createElement("span");
                detalle.className = "detalle-solicitud";
                detalle.textContent = `«${item.mensaje}»`;
                li.appendChild(detalle);
            }

            listaSolicitudes.appendChild(li);
        });

        seccionSolicitudes.hidden = false;
    }

    renderizarSolicitudes(leerSolicitudesGuardadas());

    if (botonBorrar) {
        botonBorrar.addEventListener("click", () => {
            guardarSolicitudes([]);
            renderizarSolicitudes([]);
        });
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nombreInput = document.getElementById("nombre");
        const campaniaSelect = document.getElementById("campania");
        const mensajeInput = document.getElementById("mensaje");

        const nombre = nombreInput ? nombreInput.value.trim() : "Aventurero";
        const campaniaTexto =
            campaniaSelect && campaniaSelect.selectedOptions.length > 0
                ? campaniaSelect.selectedOptions[0].textContent.trim()
                : "la campaña seleccionada";
        const mensaje = mensajeInput ? mensajeInput.value.trim() : "";

        confirmacion.textContent = `¡Solicitud registrada, ${nombre}! Hemos anotado tu interés en "${campaniaTexto}".`;
        confirmacion.hidden = false;

        const actualizadas = leerSolicitudesGuardadas();
        actualizadas.unshift({
            nombre,
            campania: campaniaTexto,
            mensaje
        });
        guardarSolicitudes(actualizadas.slice(0, 8));
        renderizarSolicitudes(actualizadas.slice(0, 8));

        formulario.reset();
    });
}