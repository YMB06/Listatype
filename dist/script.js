"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const lista = document.getElementById("lista");
const itemInput = document.getElementById("itemInput");
const searchInput = document.createElement("input");
searchInput.placeholder = "Buscar producto...";
searchInput.addEventListener("input", filtrarLista);
document.body.insertBefore(searchInput, lista);
function cargarLista() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://localhost:3000/items");
            const data = yield response.json();
            localStorage.setItem("lista", JSON.stringify(data.items));
            renderizarLista(data.items);
        }
        catch (error) {
            console.error("Error al cargar la lista", error);
        }
    });
}
function renderizarLista(items) {
    lista.innerHTML = "";
    items.sort((a, b) => {
        if (a.estado === b.estado)
            return 0; // Si ambos tienen el mismo estado, no se reordenan
        return a.estado === "comprado" ? 1 : -1; // Los "comprados" van al final
    });
    items.forEach(renderizarItem);
}
function renderizarItem(item) {
    const li = document.createElement("li");
    li.classList.toggle("comprado", item.estado === "comprado");
    // Crear checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.estado === "comprado";
    checkbox.addEventListener("change", () => {
        cambiarEstado(item.id, checkbox.checked);
        li.classList.toggle("comprado", checkbox.checked); // Actualiza la clase del <li>
    });
    // Crear descripción
    const span = document.createElement("span");
    span.id = `desc-${item.id}`;
    span.textContent = `${item.descripcion} (x${item.cantidad})`;
    if (item.estado === "comprado") {
        span.classList.add("tachado");
    }
    // Crear botón eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.classList.add("danger");
    btnEliminar.addEventListener("click", () => eliminarItem(item.id));
    // Crear botón editar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️";
    btnEditar.addEventListener("click", () => editarItem(item.id));
    // Agregar elementos a la lista
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEditar);
    li.appendChild(btnEliminar);
    lista.appendChild(li);
}
function agregarItem() {
    return __awaiter(this, void 0, void 0, function* () {
        const descripcion = itemInput.value.trim();
        if (!descripcion)
            return;
        const cantidad = parseInt(prompt("Cantidad:") || "1");
        const nuevoItem = { id: Date.now(), descripcion, cantidad, estado: "pendiente" };
        try {
            yield fetch("http://localhost:3000/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoItem),
            });
            cargarLista();
        }
        catch (error) {
            console.error("Error al agregar item", error);
        }
    });
}
function eliminarItem(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" });
            cargarLista();
        }
        catch (error) {
            console.error("Error al eliminar item", error);
        }
    });
}
function editarItem(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const nuevoTexto = prompt("Editar item:", ((_a = document.getElementById(`desc-${id}`)) === null || _a === void 0 ? void 0 : _a.textContent) || "");
        if (!nuevoTexto)
            return;
        try {
            yield fetch(`http://localhost:3000/items/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descripcion: nuevoTexto }),
            });
            cargarLista();
        }
        catch (error) {
            console.error("Error al editar item", error);
        }
    });
}
function cambiarEstado(id, estado) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`http://localhost:3000/items/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: estado ? "comprado" : "pendiente" }),
            });
            cargarLista();
        }
        catch (error) {
            console.error("Error al cambiar estado", error);
        }
    });
}
function filtrarLista() {
    const filtro = searchInput.value.toLowerCase();
    document.querySelectorAll('#lista li').forEach((li) => {
        var _a;
        const texto = ((_a = li.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
        li.style.display = texto.includes(filtro) ? "block" : "none";
    });
}
cargarLista().catch((error) => console.error(error));
