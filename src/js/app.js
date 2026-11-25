const listaItems = document.getElementById("listaItems");
const montoTotalEl = document.getElementById("montoTotal");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const btnInmediata = document.getElementById("btnInmediata");
const fechaInicioInput = document.getElementById("fechaInicio");
const fechaEntregaInput = document.getElementById("fechaEntrega");

// Poner fecha de hoy por defecto en fecha de inicio
if (fechaInicioInput && !fechaInicioInput.value) {
  const hoy = new Date().toISOString().split("T")[0];
  fechaInicioInput.value = hoy;
}

btnInmediata?.addEventListener("click", () => {
  fechaEntregaInput.value = "Inmediata";
});

function formatearGuaranies(valor) {
  const numero = Number(valor) || 0;
  const formateado = Math.round(numero).toLocaleString("es-PY");
  return `${formateado} Gs`;
}

function limpiarMonto(texto) {
  const soloDigitos = String(texto || "").replace(/[^\d]/g, "");
  return soloDigitos ? Number(soloDigitos) : 0;
}

function recalcularTotal() {
  let total = 0;
  listaItems.querySelectorAll(".monto-input").forEach((input) => {
    total += limpiarMonto(input.value);
  });
  montoTotalEl.textContent = formatearGuaranies(total);
}

function crearFilaItem(descripcion = "", monto = "") {
  const fila = document.createElement("div");
  fila.className = "item-fila";

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.placeholder = "Descripción del trabajo (ej.: Rellenado y torneado...)";
  descInput.value = descripcion;

  const montoInput = document.createElement("input");
  montoInput.type = "text";
  montoInput.inputMode = "numeric";
  montoInput.className = "monto-input";
  montoInput.placeholder = "Monto en Gs.";
  montoInput.value = monto ? Number(monto).toLocaleString("es-PY") : "";

  montoInput.addEventListener("input", () => {
    const limpio = limpiarMonto(montoInput.value);
    montoInput.value = limpio ? limpio.toLocaleString("es-PY") : "";
    recalcularTotal();
  });

  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.className = "btn-eliminar";
  btnEliminar.textContent = "Quitar";
  btnEliminar.addEventListener("click", () => {
    fila.remove();
    recalcularTotal();
  });

  fila.append(descInput, montoInput, btnEliminar);
  listaItems.appendChild(fila);
  recalcularTotal();
}

btnAgregarItem?.addEventListener("click", () => crearFilaItem());

// Cargar una fila inicial vacía
crearFilaItem();