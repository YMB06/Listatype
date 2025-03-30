const lista = document.getElementById("lista") as HTMLUListElement;
const itemInput = document.getElementById("itemInput") as HTMLInputElement;
const searchInput = document.createElement("input");
searchInput.placeholder = "Buscar producto...";
searchInput.addEventListener("input", filtrarLista);
document.body.insertBefore(searchInput, lista);

const categorias: string[] = ["Frutas", "Verduras", "Lácteos", "Otros"];
interface Item {
  id: number;
  descripcion: string;
  cantidad: number;
  estado: "pendiente" | "comprado";
  categoria: string;
}

function renderizarCategorias(): void {
  lista.innerHTML = ""; // Limpiar el contenedor principal

  categorias.forEach((categoria) => {
    const divCategoria = document.createElement("div");
    divCategoria.classList.add("categoria-container");
    divCategoria.id = `categoria-${categoria.toLowerCase()}`;

    const tituloCategoria = document.createElement("h3");
    tituloCategoria.textContent = categoria;
    divCategoria.appendChild(tituloCategoria);

    const ulCategoria = document.createElement("ul");
    ulCategoria.classList.add("lista-categoria");
    ulCategoria.setAttribute("data-categoria", categoria);
    divCategoria.appendChild(ulCategoria);

    // Habilitar el drop en cada categoría
    divCategoria.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    divCategoria.addEventListener("drop", async (event) => {
      event.preventDefault();
      const id = event.dataTransfer?.getData("text/plain");
      if (id) {
        await cambiarCategoria(parseInt(id), categoria);
      }
    });

    lista.appendChild(divCategoria);
  });
}

// Renderizar un producto individual
function renderizarItem(item: Item): HTMLLIElement {
  const li = document.createElement("li");
  li.classList.toggle("comprado", item.estado === "comprado");
  li.draggable = true;
  li.setAttribute("data-id", item.id.toString());

  // Agregar los manejadores de eventos para el dragstart y dragend
  li.addEventListener("dragstart", (event) => {
    event.dataTransfer?.setData("text/plain", item.id.toString());
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = item.estado === "comprado";
  checkbox.addEventListener("change", () => {
    cambiarEstado(item.id, checkbox.checked);
    li.classList.toggle("comprado", checkbox.checked);
  });

  const span = document.createElement("span");
  span.id = `desc-${item.id}`;
  span.textContent = `${item.descripcion} (x${item.cantidad})`;
  if (item.estado === "comprado") {
    span.classList.add("tachado");
  }

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "❌";
  btnEliminar.classList.add("danger");
  btnEliminar.addEventListener("click", () => eliminarItem(item.id));

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "✏️";
  btnEditar.addEventListener("click", () => editarItem(item.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(btnEditar);
  li.appendChild(btnEliminar);
  
  return li;
}

// Renderizar la lista de items agrupados por categoría
function renderizarLista(items: Item[]): void {
  // Agrupar los productos por categoría
  const categoriasMap = agruparPorCategoria(items);

  // Limpiar la lista antes de volver a renderizar
  lista.innerHTML = "";

  // Renderizar categorías y sus productos
  Object.keys(categoriasMap).forEach((categoria) => {
    const divCategoria = document.createElement("div");
    divCategoria.classList.add("categoria-container");

    const tituloCategoria = document.createElement("h3");
    tituloCategoria.textContent = categoria;
    divCategoria.appendChild(tituloCategoria);

    const ulCategoria = document.createElement("ul");
    ulCategoria.classList.add("lista-categoria");
    ulCategoria.setAttribute("data-categoria", categoria);
    
    // Añadir los productos de esta categoría al <ul>
    categoriasMap[categoria].forEach((item) => {
      const itemElement = renderizarItem(item);
      ulCategoria.appendChild(itemElement);  // Agregar el item a la lista de la categoría
    });
    
    divCategoria.appendChild(ulCategoria);
    lista.appendChild(divCategoria);
  });

  // Agregar eventos de drag y drop a cada categoría
  document.querySelectorAll('.categoria-container').forEach((divCategoria) => {
    divCategoria.addEventListener('dragover', (event) => {
      event.preventDefault();  // Permitir el "drop" en la categoría
      divCategoria.classList.add("drag-over");  // Añadir estilo para indicar que se puede soltar
    });

    divCategoria.addEventListener('dragleave', () => {
      divCategoria.classList.remove("drag-over");  // Eliminar el estilo cuando el item sale del área
    });

    divCategoria.addEventListener('drop', async (event) => {
      event.preventDefault();
      divCategoria.classList.remove("drag-over");  // Eliminar el estilo cuando se suelta el item

      // Obtener el item arrastrado
      const draggedItem = document.querySelector(".dragging") as HTMLElement;
      const id = draggedItem?.getAttribute('data-id');  // Obtener el ID del item arrastrado
      const categoria = divCategoria.querySelector("h3")?.textContent || "";  // Obtener el nombre de la categoría desde el título

      if (id && categoria) {
        await cambiarCategoria(parseInt(id), categoria);  // Actualizar la categoría del item en el backend
      }
    });
  });

  // Volver a agregar los manejadores de dragstart y dragend
  agregarEventosDrag();
}

// Función para agregar los manejadores de eventos dragstart y dragend a todos los li
function agregarEventosDrag(): void {
  document.querySelectorAll('li').forEach((li) => {
    li.draggable = true;

    li.addEventListener('dragstart', (event) => {
      const draggedItem = event.target as HTMLElement;
      draggedItem.classList.add('dragging');  // Añadir clase de estilo para el item arrastrado
    });

    li.addEventListener('dragend', () => {
      document.querySelectorAll('li').forEach((li) => {
        li.classList.remove('dragging');  // Eliminar clase cuando el arrastre termine
      });
    });
  });
}

// Habilitar el drop en cada categoría
document.querySelectorAll('.categoria-container').forEach((divCategoria) => {
  divCategoria.addEventListener('dragover', (event) => {
    event.preventDefault();  // Permitir el "drop" en la categoría
    divCategoria.classList.add("drag-over");  // Añadir estilo para indicar que se puede soltar
  });

  divCategoria.addEventListener('dragleave', () => {
    divCategoria.classList.remove("drag-over");  // Eliminar el estilo cuando el item sale del área
  });

  divCategoria.addEventListener('drop', async (event) => {
    event.preventDefault();
    divCategoria.classList.remove("drag-over");  // Eliminar el estilo cuando se suelta el item
    
    // Obtener el item arrastrado
    const draggedItem = document.querySelector(".dragging") as HTMLElement;
    const id = draggedItem?.getAttribute('data-id');  // Obtener el ID del item arrastrado
    const categoria = divCategoria.querySelector("h3")?.textContent || "";  // Obtener el nombre de la categoría desde el título

    if (id && categoria) {
      await cambiarCategoria(parseInt(id), categoria);  // Actualizar la categoría del item en el backend
    }
  });
});

async function cargarLista(): Promise<void> {
  try {
    const response = await fetch("http://localhost:3000/items");
    const data: { items: Item[] } = await response.json();
    localStorage.setItem("lista", JSON.stringify(data.items));
    renderizarLista(data.items); // Usar la nueva función de renderizado
  } catch (error) {
    console.error("Error al cargar la lista", error);
  }
}

async function agregarItem(): Promise<void> {
  const descripcion = itemInput.value.trim();
  if (!descripcion) return;

  const cantidad = parseInt(prompt("Cantidad:") || "1");
  const categoria = categoriaSelect.value; // Usar el select de categorías
  
  const nuevoItem: Item = { 
    id: Date.now(), 
    descripcion, 
    cantidad: Number(cantidad), 
    estado: "pendiente", 
    categoria // Usar la categoría seleccionada
  };

  try {
    await fetch("http://localhost:3000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoItem),
    });
    cargarLista(); // Recargar la lista
  } catch (error) {
    console.error("Error al agregar item", error);
  }
}

// Cambiar la categoría del item en el backend
async function cambiarCategoria(id: number, nuevaCategoria: string): Promise<void> {
  try {
    // Enviar la nueva categoría al backend
    await fetch(`http://localhost:3000/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria: nuevaCategoria }),
    });
    cargarLista();  // Recargar la lista después de mover el item
  } catch (error) {
    console.error("Error al cambiar categoría", error);
  }
}

// Hacer que cada item sea arrastrable
document.querySelectorAll('li').forEach((li) => {
  li.draggable = true;

  li.addEventListener('dragstart', (event) => {
    const draggedItem = event.target as HTMLElement;
    draggedItem.classList.add('dragging');  // Añadir clase de estilo para el item arrastrado
  });

  li.addEventListener('dragend', (event) => {
    const draggedItem = event.target as HTMLElement;
    draggedItem.classList.remove('dragging');  // Eliminar clase cuando el arrastre termine
  });
});


async function eliminarItem(id: number): Promise<void> {
  try {
    await fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" });
    cargarLista();
  } catch (error) {
    console.error("Error al eliminar item", error);
  }
}

function agruparPorCategoria(items: Item[]): { [key: string]: Item[] } {
  return items.reduce((map, item) => {
    // Si la categoría aún no existe en el mapa, la creamos
    if (!map[item.categoria]) {
      map[item.categoria] = [];
    }
    // Agregar el producto a la categoría correspondiente
    map[item.categoria].push(item);
    return map;
  }, {} as { [key: string]: Item[] });
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

const categoriaSelect = document.createElement("select");
categorias.forEach(categoria => {
  const option = document.createElement("option");
  option.value = categoria;
  option.textContent = categoria;
  categoriaSelect.appendChild(option);
});
document.body.insertBefore(categoriaSelect, searchInput);



// Función de filtro por búsqueda (sin filtro de categoría)
function filtrarLista(): void {
  const filtro = searchInput.value.toLowerCase();

  document.querySelectorAll<HTMLLIElement>('#lista li').forEach((li) => {
    const texto = li.textContent?.toLowerCase() || "";
    const mostrar = texto.includes(filtro);  

    li.style.display = mostrar ? "block" : "none";
  });
}

document.body.insertBefore(categoriaSelect, itemInput.nextSibling);

cargarLista().catch((error) => console.error(error));
