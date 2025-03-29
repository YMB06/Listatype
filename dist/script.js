"use strict";
const lista = document.getElementById("lista");
const itemInput = document.getElementById("itemInput");
// Cargar la lista desde el servidor
function cargarLista() {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/items")
            .then((response) => response.json())
            .then((data) => {
            if (lista) {
                lista.innerHTML = ""; // Limpiar la lista antes de renderizar
                data.items.forEach((item) => renderizarItem(item));
            }
            resolve();
        })
            .catch((error) => reject("Error al cargar la lista"));
    });
}
// Agregar un nuevo item
function agregarItem() {
    if (!itemInput)
        return;
    const item = itemInput.value.trim();
    if (!item)
        return;
    itemInput.value = "";
    const itemNormalizado = item.toLowerCase();
    // Verificar si ya existe en la lista
    const itemsExistentes = Array.from(document.querySelectorAll("#lista li span"))
        .map((span) => { var _a; return ((_a = span.textContent) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) || ""; });
    if (itemsExistentes.includes(itemNormalizado)) {
        alert("Este producto ya está en la lista.");
        return;
    }
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descripcion: item }),
        })
            .then((response) => response.json())
            .then((data) => {
            renderizarItem(data);
            resolve();
        })
            .catch((error) => reject("Error al agregar item"));
    });
}
// Renderizar un item en la lista
function renderizarItem(item) {
    const li = document.createElement("li");
    li.innerHTML = `
    <span id="${item.id}">${item.descripcion}</span> 
    <button class="danger" onclick="eliminarItem(${item.id}, this)">❌</button>
    <button class="edit" onclick="editarItem(${item.id}, this)">✏️</button>
  `;
    lista === null || lista === void 0 ? void 0 : lista.appendChild(li);
}
// Eliminar un item
function eliminarItem(id, boton) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
            var _a;
            (_a = boton.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
            resolve();
        })
            .catch((error) => reject("Error al eliminar item"));
    });
}
// Editar un item
function editarItem(id, boton) {
    var _a, _b, _c;
    const nuevoTexto = prompt("Editar item:", ((_c = (_b = (_a = boton.parentElement) === null || _a === void 0 ? void 0 : _a.firstChild) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "");
    if (!nuevoTexto)
        return;
    fetch(`http://localhost:3000/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: nuevoTexto }),
    })
        .then((response) => response.json())
        .then((data) => {
        const span = document.getElementById(`${id}`);
        if (span) {
            span.textContent = nuevoTexto;
        }
    })
        .catch((error) => console.error("Error al editar item", error));
}
// Cargar la lista al iniciar
cargarLista().catch((error) => console.error(error));
