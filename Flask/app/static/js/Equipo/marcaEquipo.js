// --- Buscador en vivo para la tabla de marcas ---
// Mueve esta función fuera de $(document).ready para que sea global
function busqueda(tbodyId) {
    var input = document.getElementById("buscador");
    if (!input) return;
    var filter = input.value.toLowerCase();
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    var rows = tbody.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        var rowText = rows[i].innerText.toLowerCase();
        rows[i].style.display = rowText.includes(filter) ? "" : "none";
    }
}

$(document).ready(function () {
    // Detectar cambios en los checkboxes para actualizar los botones
    $(document).on("change", ".row-checkbox, #selectAll", function () {
        actualizarBotonesAcciones();
    });

    function actualizarBotonesAcciones() {
        const seleccionados = $(".row-checkbox:checked");
        const deleteButton = $(".delete-marca-btn");
        const editButton = $(".edit-button");

        if (seleccionados.length > 0) {
            // Construir la URL para eliminar (con múltiples IDs separados por comas)
            const ids = seleccionados.map(function () {
                return $(this).closest("tr").data("id");
            }).get().join(",");

            deleteButton.data("url", `/delete_marca_equipo/${ids}`);
            deleteButton.prop("disabled", false);
        } else {
            deleteButton.data("url", ""); // Limpiar URL cuando no hay selección
            deleteButton.prop("disabled", true);
        }

        if (seleccionados.length === 1) {
            // Obtener el ID de la única fila seleccionada para edición
            const selectedRow = seleccionados.closest("tr");
            const id = selectedRow.data("id");
            const nombre = selectedRow.find("td:nth-child(2)").text().trim();

            editButton.data("url", `/update_marca_equipo/${id}`);
            editButton.prop("disabled", false);

            // Guardamos el valor original en un atributo `data-original`
            $("#modal-edit-marca-input")
                .val(nombre)
                .attr("data-original", nombre);
            $("#modal-edit-marca-title").text(`Editar marca: ${nombre}`);
            $("#form-edit-marca-equipo").attr("action", `/update_marca_equipo/${id}`);

        } else {
            editButton.data("url", "");
            editButton.prop("disabled", true);
        }
    }

    // Manejar selección/deselección de todos los checkboxes
    $(document).on("change", "#selectAll", function () {
        $(".row-checkbox").prop("checked", this.checked);
        actualizarBotonesAcciones();
    });

    // Manejar clic en el botón "Editar" para abrir el modal
    $(".edit-button").on("click", function () {
        if ($(this).prop("disabled")) return; // Evita abrir el modal si está deshabilitado

        // Restablecer el valor original antes de abrir el modal
        const inputMarca = $("#modal-edit-marca-input");
        inputMarca.val(inputMarca.attr("data-original"));

        $("#modal-edit-marca").modal("show");
    });

    // Manejar clic en el botón "Eliminar" para abrir el modal de confirmación o redirigir directamente
    $(".delete-marca-btn").on("click", function () {
        if ($(this).prop("disabled")) return; // Evita la acción si está deshabilitado

        const deleteUrl = $(this).data("url");

        if (!deleteUrl || !deleteUrl.includes("/delete_marca_equipo/")) {
            return;
        }

        // Si tienes un modal de confirmación, descomenta y usa esto:
        // $("#confirm-delete-button").attr("href", deleteUrl);
        // $("#modal-delete-marca").modal("show");

        // Modal genérico de Bootstrap
        $("#confirmDeleteModal").modal("show");

        // Accionar la eliminación desde el modal
        $("#confirmDeleteBtn").off("click").on("click", function () {
            $("#confirmDeleteModal").modal("hide");

            $.ajax({
                url: deleteUrl,
                type: "POST",
                success: function (response) {
                    if (response.status === "success") {
                        mostrarAlerta(response.message, "success");
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        mostrarAlerta(response.message, "danger");
                    }
                },
                error: function (xhr) {
                    let errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Error al eliminar marcas.";
                    mostrarAlerta(errorMsg, "danger");
                }
            });
        });
    });

    var buscador = document.getElementById("buscador");
    if (buscador) {
        buscador.addEventListener("input", function () {
            busqueda('myTableBody');
        });
    }
});

// Función para mostrar alertas dinámicas (Bootstrap)
function mostrarAlerta(mensaje, tipo = "success") {
    let alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) return;

    alertContainer.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Hacer scroll hacia arriba para que se vea la alerta
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ocultar alerta automáticamente después de 4 segundos
    setTimeout(() => {
        alertContainer.classList.remove("show");
        alertContainer.classList.add("d-none");
    }, 4000);
}
