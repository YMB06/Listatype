const lista = document.getElementById("lista") as HTMLUListElement;
const itemInput = document.getElementById("itemInput") as HTMLInputElement;
const searchInput = document.createElement("input");
searchInput.placeholder = "Buscar producto...";
searchInput.addEventListener("input", filtrarLista);
document.body.insertBefore(searchInput, lista);

interface Item {
  id: number;
  descripcion: string;
  cantidad: number;
  estado: "pendiente" | "comprado";
}

async function cargarLista(): Promise<void> {
  try {
    const response = await fetch("http://localhost:3000/items");
    const data: { items: Item[] } = await response.json();
    localStorage.setItem("lista", JSON.stringify(data.items));
    renderizarLista(data.items);
  } catch (error) {
    console.error("Error al cargar la lista", error);
  }
}

function renderizarLista(items: Item[]): void {
  lista.innerHTML = "";
  items.sort((a, b) => {
    if (a.estado === b.estado) return 0; // Si ambos tienen el mismo estado, no se reordenan
    return a.estado === "comprado" ? 1 : -1; // Los "comprados" van al final
  });
    items.forEach(renderizarItem);
}

function renderizarItem(item: Item): void {
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
  
  

async function agregarItem(): Promise<void> {
  const descripcion = itemInput.value.trim();
  if (!descripcion) return;
  const cantidad = parseInt(prompt("Cantidad:") || "1");
  const nuevoItem: Item = { id: Date.now(), descripcion, cantidad, estado: "pendiente" };
  try {
    await fetch("http://localhost:3000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoItem),
    });
    cargarLista();
  } catch (error) {
    console.error("Error al agregar item", error);
  }
}

async function eliminarItem(id: number): Promise<void> {
  try {
    await fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" });
    cargarLista();
  } catch (error) {
    console.error("Error al eliminar item", error);
  }
}

async function editarItem(id: number): Promise<void> {
  const nuevoTexto = prompt("Editar item:", document.getElementById(`desc-${id}`)?.textContent || "");
  if (!nuevoTexto) return;
  try {
    await fetch(`http://localhost:3000/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: nuevoTexto }),
    });
    cargarLista();
  } catch (error) {
    console.error("Error al editar item", error);
  }
}

async function cambiarEstado(id: number, estado: boolean): Promise<void> {
  try {
    await fetch(`http://localhost:3000/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estado ? "comprado" : "pendiente" }),
    });
    cargarLista();
  } catch (error) {
    console.error("Error al cambiar estado", error);
  }
}

function filtrarLista(): void {
  const filtro = searchInput.value.toLowerCase();
  document.querySelectorAll<HTMLLIElement>('#lista li').forEach((li) => {
    const texto = li.textContent?.toLowerCase() || "";
    li.style.display = texto.includes(filtro) ? "block" : "none";
  });
}


cargarLista().catch((error) => console.error(error));
