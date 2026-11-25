const listaItems = document.getElementById("listaItems");
const montoTotalEl = document.getElementById("montoTotal");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const btnInmediata = document.getElementById("btnInmediata");

const clienteInput = document.getElementById("cliente");
const modeloRodadoInput = document.getElementById("modeloRodado");
const fechaInicioInput = document.getElementById("fechaInicio");
const fechaEntregaInput = document.getElementById("fechaEntrega");

const anticipoInput = document.getElementById("anticipoGs");
const medioPagoSelect = document.getElementById("medioPago");
const resumenTotalEl = document.getElementById("resumenTotal");
const resumenAnticipoEl = document.getElementById("resumenAnticipo");
const resumenSaldoEl = document.getElementById("resumenSaldo");

const btnGenerarRecibo = document.getElementById("btnGenerarRecibo");
const btnCopiarRecibo = document.getElementById("btnCopiarRecibo");
const btnImprimirRecibo = document.getElementById("btnImprimirRecibo");
const reciboPreview = document.getElementById("reciboPreview");
const reciboNumeroEl = document.getElementById("reciboNumero");
const reciboDetalleEl = document.getElementById("reciboDetalle");

let totalActualGs = 0;
let anticipoActualGs = 0;
let saldoActualGs = 0;
let contadorRecibo = 1;

if (fechaInicioInput && !fechaInicioInput.value) {
  const hoy = new Date().toISOString().split("T")[0];
  fechaInicioInput.value = hoy;
}

btnInmediata?.addEventListener("click", () => {
  fechaEntregaInput.value = "Inmediata";
});

function formatearGuaranies(valor) {
  const numero = Number(valor) || 0;
  return `${Math.round(numero).toLocaleString("es-PY")} Gs`;
}

function limpiarMonto(texto) {
  const soloDigitos = String(texto || "").replace(/[^\d]/g, "");
  return soloDigitos ? Number(soloDigitos) : 0;
}

function actualizarResumenFinanciero() {
  let sumaItems = 0;
  listaItems.querySelectorAll(".monto-input").forEach((input) => {
    sumaItems += limpiarMonto(input.value);
  });

  totalActualGs = sumaItems;
  const anticipoIngresado = limpiarMonto(anticipoInput?.value);
  anticipoActualGs = Math.min(anticipoIngresado, totalActualGs);
  saldoActualGs = Math.max(totalActualGs - anticipoActualGs, 0);

  if (montoTotalEl) montoTotalEl.textContent = formatearGuaranies(totalActualGs);
  if (resumenTotalEl) resumenTotalEl.textContent = formatearGuaranies(totalActualGs);
  if (resumenAnticipoEl) resumenAnticipoEl.textContent = formatearGuaranies(anticipoActualGs);
  if (resumenSaldoEl) resumenSaldoEl.textContent = formatearGuaranies(saldoActualGs);
}

anticipoInput?.addEventListener("input", () => {
  const limpio = limpiarMonto(anticipoInput.value);
  anticipoInput.value = limpio ? limpio.toLocaleString("es-PY") : "";
  actualizarResumenFinanciero();
});

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
    actualizarResumenFinanciero();
  });

  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.className = "btn-eliminar";
  btnEliminar.textContent = "Quitar";
  btnEliminar.addEventListener("click", () => {
    fila.remove();
    actualizarResumenFinanciero();
  });

  fila.append(descInput, montoInput, btnEliminar);
  listaItems.appendChild(fila);
  actualizarResumenFinanciero();
}

function obtenerDatosRecibo() {
  const cliente = (clienteInput?.value || "").trim() || "Cliente sin especificar";
  const equipo = (modeloRodadoInput?.value || "").trim() || "No especificado";
  const fecha = new Date().toLocaleDateString("es-PY");
  const medio = medioPagoSelect?.value || "Efectivo";
  const codigo = `REC-${String(contadorRecibo).padStart(4, "0")}`;

  return {
    codigo,
    fecha,
    cliente,
    equipo,
    medio,
    total: formatearGuaranies(totalActualGs),
    anticipo: formatearGuaranies(anticipoActualGs),
    saldo: formatearGuaranies(saldoActualGs),
  };
}

btnGenerarRecibo?.addEventListener("click", () => {
  actualizarResumenFinanciero();
  const datos = obtenerDatosRecibo();
  if (reciboNumeroEl) reciboNumeroEl.textContent = datos.codigo;

  if (reciboDetalleEl) {
    reciboDetalleEl.innerHTML = `
      <p><strong>Fecha:</strong> ${datos.fecha}</p>
      <p><strong>Cliente:</strong> ${datos.cliente}</p>
      <p><strong>Modelo / Rodado:</strong> ${datos.equipo}</p>
      <p><strong>Medio de pago:</strong> ${datos.medio}</p>
      <p><strong>Total presupuesto:</strong> ${datos.total}</p>
      <p><strong>Monto recibido (anticipo):</strong> ${datos.anticipo}</p>
      <p><strong>Saldo pendiente:</strong> ${datos.saldo}</p>
    `;
  }

  if (reciboPreview) reciboPreview.hidden = false;
  contadorRecibo += 1;
});

btnCopiarRecibo?.addEventListener("click", async () => {
  actualizarResumenFinanciero();
  const d = obtenerDatosRecibo();
  const texto = [
    `*TALLER INTEGRAL S.A.*`,
    `Comprobante: ${d.codigo} (${d.fecha})`,
    `Cliente: ${d.cliente}`,
    `Equipo/Rodado: ${d.equipo}`,
    `Total presupuesto: ${d.total}`,
    `Anticipo/Cobrado (${d.medio}): ${d.anticipo}`,
    `Saldo pendiente: ${d.saldo}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(texto);
    alert("Resumen copiado al portapapeles para enviar por WhatsApp.");
  } catch {
    alert("No se pudo copiar automáticamente; revisá el recibo en pantalla.");
  }
});

btnImprimirRecibo?.addEventListener("click", () => {
  window.print();
});

btnAgregarItem?.addEventListener("click", () => crearFilaItem());
crearFilaItem();