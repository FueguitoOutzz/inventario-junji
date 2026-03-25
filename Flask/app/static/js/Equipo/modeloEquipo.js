
$(document).ready(function () {
    console.log("El DOM esta listo");
    cargarMarcas();
    // Deshabilitar select de tipos hasta que se elija una marca
    $("#tipoSelect, #edit_tipoSelect").prop("disabled", true);

    // Evento para actualizar tipos de equipo al seleccionar una marca en agregar
    $("#marcaSelect").on("change", function () {
        let marcaId = $(this).val();
        if (marcaId) {
            cargarTipos(marcaId, "tipoSelect");
            $("#tipoSelect").prop("disabled", false);
        } else {
            $("#tipoSelect").empty().append('<option value="">Seleccione un tipo</option>').prop("disabled", true);
        }
    });

    // Evento para actualizar tipos de equipo al seleccionar una marca en edición
    $("#edit_marcaSelect").on("change", function () {
        let marcaId = $(this).val();
        if (marcaId) {
            cargarTipos(marcaId, "edit_tipoSelect");
            $("#edit_tipoSelect").prop("disabled", false);
        } else {
            $("#edit_tipoSelect").empty().append('<option value="">Seleccione un tipo</option>').prop("disabled", true);
        }
    });

    // **Validación y Envío del Formulario de Agregar Modelo**
    $("#addModeloForm").on("submit", function (e) {
        e.preventDefault();
        let nombreModelo = $("#nombre_modelo_equipo").val().trim().toLowerCase();
        let tipoEquipo = $("#tipoSelect").val();
        let marcaEquipo = $("#marcaSelect").val();

        if (!nombreModelo) {
            mostrarMensaje("El nombre del modelo no puede estar vacío.", "warning");
            return;
        }
        if (!marcaEquipo) {
            mostrarMensaje("Debe seleccionar una marca antes de guardar.", "warning");
            return;
        }
        if (!tipoEquipo) {
            mostrarMensaje("Debe seleccionar un tipo de equipo antes de guardar.", "warning");
            return;
        }

        $.post("/add_modelo_equipo", $("#addModeloForm").serialize(), function (response) {
            mostrarMensaje(response.message, response.tipo_alerta);
            if (response.status === "success") {
                setTimeout(() => location.reload(), 1500);
            }
        }).fail(function (xhr) {
            let errorMsg = xhr.responseJSON?.message || "Error al agregar el modelo.";
            let tipoAlerta = xhr.responseJSON?.tipo_alerta || "danger";
            mostrarMensaje(errorMsg, tipoAlerta);
        });
    });

    // **Interceptar el envío del formulario de Edición para validación AJAX**
    $(document).on("submit", "#editModeloEquipoForm", function (event) {
        event.preventDefault();

        let formData = $(this).serialize();
        let actionUrl = $(this).attr("action");
        let errorContainer = $("#editModeloError");

        $.post(actionUrl, formData, function (data) {
            if (data.status === "error") {
                errorContainer.html(data.message).removeClass("d-none");
            } else {
                $('#editModeloEquipoModal').modal('hide');
                mostrarMensaje(data.message, data.tipo_alerta || "success");
                setTimeout(() => location.reload(), 1500);
            }
        }).fail(function (xhr) {
            console.error("Error en la actualización:", xhr);
            let errorMsg = xhr.responseJSON?.message || "Ocurrió un error inesperado al editar.";
            errorContainer.html(errorMsg).removeClass("d-none");
        });
    });

    let debounceTimeout;
    const buscador = document.getElementById("buscador_modelos");
    if (buscador) {
        buscador.addEventListener("input", () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => buscarModelos(1), 300);
        });
    }

    $("#eliminarSeleccionados").on("click", function () {
        let seleccionados = $(".row-checkbox:checked").closest("tr").map(function () {
            return $(this).data("id");
        }).get();

        if (seleccionados.length === 0) {
            mostrarMensaje("Debe seleccionar al menos un modelo para eliminar.", "warning");
            return;
        }

        $("#confirmDeleteModal").modal("show");

        $("#confirmDeleteBtn").off("click").on("click", function () {
            $("#confirmDeleteModal").modal("hide");

            $.ajax({
                url: "/delete_modelo_equipo",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ ids: seleccionados }),
                success: function (response) {
                    mostrarMensaje(response.message, response.tipo_alerta);
                    setTimeout(() => location.reload(), 2000);
                },
                error: function (xhr) {
                    let errorMsg = xhr.responseJSON?.message || "Error al eliminar los modelos.";
                    let tipoAlerta = xhr.responseJSON?.tipo_alerta || "danger";
                    mostrarMensaje(errorMsg, tipoAlerta);
                }
            });
        });
    });
}); // Fin de $(document).ready

// --- Funciones de Búsqueda y Paginación en Alcance Global ---

function buscarModelos(page = 1) {
    const query = document.getElementById("buscador_modelos").value.toLowerCase();

    fetch(`/buscar_modelo_equipo?q=${encodeURIComponent(query)}&page=${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al buscar modelos de equipo");
            }
            return response.json();
        })
        .then(data => {
            actualizarTablaModelos(data.modelos);
            actualizarPaginacion(data.total_pages, data.current_page);
        })
        .catch(error => console.error("Error al buscar modelos de equipo:", error));
}

function actualizarTablaModelos(modelos) {
    const tbody = document.getElementById("myTableBody");
    tbody.innerHTML = "";

    if (modelos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay datos disponibles.</td></tr>';
        return;
    }

    modelos.forEach(modelo => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", modelo.idModelo_Equipo);
        row.innerHTML = `
        <td class="checkbox-column">
            <input type="checkbox" class="checkbox-table row-checkbox">
        </td>
        <td>${modelo.nombreModeloequipo}</td>
        <td>${modelo.nombreTipo_equipo}</td>
        <td>${modelo.nombreMarcaEquipo}</td>
        <td>
            <button class="btn button-info btn-sm btn-editar-modelo" data-bs-toggle="modal"
                data-bs-target="#editModeloEquipoModal" data-id="${modelo.idModelo_Equipo}"
                data-nombre="${modelo.nombreModeloequipo}">
                <i class="bi bi-pencil-square"></i>
            </button>
        </td>
    `;
        tbody.appendChild(row);
    });
}

function actualizarPaginacion(totalPages, currentPage) {
    const pagination = document.querySelector(".pagination");
    if (!pagination) return;
    pagination.innerHTML = "";

    if (currentPage > 1) {
        const prevPage = document.createElement("li");
        prevPage.className = "page-item";
        prevPage.innerHTML = `<a class="page-link" href="javascript:void(0)" onclick="buscarModelos(${currentPage - 1})">Anterior</a>`;
        pagination.appendChild(prevPage);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageItem.innerHTML = `<a class="page-link" href="javascript:void(0)" onclick="buscarModelos(${i})">${i}</a>`;
        pagination.appendChild(pageItem);
    }

    if (currentPage < totalPages) {
        const nextPage = document.createElement("li");
        nextPage.className = "page-item";
        nextPage.innerHTML = `<a class="page-link" href="javascript:void(0)" onclick="buscarModelos(${currentPage + 1})">Siguiente</a>`;
        pagination.appendChild(nextPage);
    }
}

// **Editar Modelo (Delegación de Eventos)**
$(document).on("click", ".btn-editar-modelo", function () {
    let modeloId = $(this).data("id");

    $.get(`/get_modelo/${modeloId}`, function (modelo) {
        $("#edit_nombreModelo_equipo").val(modelo.nombreModeloequipo);

        $.get("/get_marcas", function (marcas) {
            let select = $("#edit_marcaSelect");
            select.empty().append('<option value="">Seleccione una marca</option>');

            $.each(marcas, function (i, marca) {
                let selected = modelo.idMarca_Equipo == marca.idMarca_Equipo ? "selected" : "";
                select.append(`<option value="${marca.idMarca_Equipo}" ${selected}>${marca.nombreMarcaEquipo}</option>`);
            });

            cargarTipos(modelo.idMarca_Equipo, "edit_tipoSelect", modelo.idTipo_equipo);
            $("#edit_tipoSelect").prop("disabled", false);
        });

        $("#editModeloEquipoForm").attr("action", `/update_modelo_equipo/${modeloId}`);
        $("#editModeloEquipoModal").modal("show");
    }).fail(function () {
        mostrarMensaje("Error al obtener datos del modelo.", "danger");
    });
});

function mostrarMensaje(mensaje, tipo) {
    let alertContainer = $("#alertContainer");
    if (alertContainer.length === 0) {
        $("body").prepend('<div id="alertContainer" class="alert d-none" role="alert"></div>');
        alertContainer = $("#alertContainer");
    }

    alertContainer.removeClass("d-none alert-success alert-warning alert-danger")
        .addClass(`alert alert-${tipo}`)
        .html(`<i class="bi bi-info-circle"></i> ${mensaje}`)
        .fadeIn();

    setTimeout(() => {
        alertContainer.fadeOut("slow", function () {
            $(this).addClass("d-none");
        });
    }, 4000);
}

function cargarMarcas() {
    $.get("/get_marcas", function (marcas) {
        let select = $("#marcaSelect, #edit_marcaSelect");
        select.empty().append('<option value="">Seleccione una marca</option>');
        $.each(marcas, function (i, marca) {
            select.append(`<option value="${marca.idMarca_Equipo}">${marca.nombreMarcaEquipo}</option>`);
        });
    }).fail(function () {
        mostrarMensaje("Error al cargar marcas.", "danger");
    });
}

function cargarTipos(marcaId, selectId, tipoSeleccionado = null) {
    if (!marcaId) {
        $(`#${selectId}`).empty().append('<option value="">Seleccione un tipo</option>').prop("disabled", true);
        return;
    }

    $.get(`/get_tipos/${marcaId}`, function (tipos) {
        let select = $(`#${selectId}`);
        select.empty().append('<option value="">Seleccione un tipo</option>');
        $.each(tipos, function (i, tipo) {
            let selected = tipoSeleccionado && tipo.idTipo_equipo == tipoSeleccionado ? "selected" : "";
            select.append(`<option value="${tipo.idTipo_equipo}" ${selected}>${tipo.nombreTipo_equipo}</option>`);
        });
    }).fail(function () {
        mostrarMensaje("Error al cargar tipos de equipo.", "danger");
    });
}
