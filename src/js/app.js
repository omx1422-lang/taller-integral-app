const STORAGE_KEY = "taller_integral_presupuestos_v1";

const listaItems = document.getElementById("listaItems");
const montoTotalEl = document.getElementById("montoTotal");
const btnAgregarItem = document.getElementById("btnAgregarItem");
const btnInmediata = document.getElementById("btnInmediata");
const btnNuevoPresupuesto = document.getElementById("btnNuevoPresupuesto");

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

const listaGuardadosEl = document.getElementById("listaGuardados");
const contadorGuardadosEl = document.getElementById("contadorGuardados");

let totalActualGs = 0;
let anticipoActualGs = 0;
let saldoActualGs = 0;

function establecerFechaHoy() {
  if (fechaInicioInput) {
    fechaInicioInput.value = new Date().toISOString().split("T")[0];
  }
}

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
  if (listaItems) {
    listaItems.querySelectorAll(".monto-input").forEach((input) => {
      sumaItems += limpiarMonto(input.value);
    });
  }

  totalActualGs = sumaItems;
  const anticipoIngresado = limpiarMonto(anticipoInput ? anticipoInput.value : "");
  anticipoActualGs = Math.min(anticipoIngresado, totalActualGs);
  saldoActualGs = Math.max(totalActualGs - anticipoActualGs, 0);

  if (montoTotalEl) montoTotalEl.textContent = formatearGuaranies(totalActualGs);
  if (resumenTotalEl) resumenTotalEl.textContent = formatearGuaranies(totalActualGs);
  if (resumenAnticipoEl) resumenAnticipoEl.textContent = formatearGuaranies(anticipoActualGs);
  if (resumenSaldoEl) resumenSaldoEl.textContent = formatearGuaranies(saldoActualGs);
}

function crearFilaItem(descripcion = "", monto = "") {
  if (!listaItems) return;

  const fila = document.createElement("div");
  fila.className = "item-fila";

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.className = "desc-input";
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

function obtenerItemsActuales() {
  const items = [];
  if (!listaItems) return items;

  listaItems.querySelectorAll(".item-fila").forEach((fila) => {
    const descripcion = fila.querySelector(".desc-input")?.value.trim() || "";
    const montoGs = limpiarMonto(fila.querySelector(".monto-input")?.value);
    if (descripcion || montoGs > 0) {
      items.push({ descripcion: descripcion || "Trabajo sin descripción", montoGs });
    }
  });
  return items;
}

function leerGuardados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escribirGuardados(registros) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  } catch {
    alert("No se pudo guardar en el almacenamiento del navegador.");
  }
}

function obtenerSiguienteNumeroRecibo(registros) {
  let maxNum = 0;
  registros.forEach((reg) => {
    const match = String(reg.codigo || "").match(/REC-(\d+)/i);
    if (match) {
      const n = Number(match[1]);
      if (n > maxNum) maxNum = n;
    }
  });
  return maxNum + 1;
}

function guardarPresupuestoEnStorage(codigoRecibo) {
  actualizarResumenFinanciero();
  const registros = leerGuardados();

  const nuevoRegistro = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    codigo: codigoRecibo,
    fechaGuardado: new Date().toLocaleDateString("es-PY"),
    cliente: (clienteInput?.value || "").trim() || "Cliente sin especificar",
    modeloRodado: (modeloRodadoInput?.value || "").trim() || "No especificado",
    fechaInicio: fechaInicioInput?.value || "",
    fechaEntrega: (fechaEntregaInput?.value || "").trim(),
    medioPago: medioPagoSelect?.value || "Efectivo",
    items: obtenerItemsActuales(),
    totalGs: totalActualGs,
    anticipoGs: anticipoActualGs,
    saldoGs: saldoActualGs,
  };

  registros.unshift(nuevoRegistro);
  escribirGuardados(registros);
  renderizarGuardados();
}

function cargarRegistroEnFormulario(registro) {
  if (clienteInput) {
    clienteInput.value = registro.cliente === "Cliente sin especificar" ? "" : registro.cliente;
  }
  if (modeloRodadoInput) {
    modeloRodadoInput.value = registro.modeloRodado === "No especificado" ? "" : registro.modeloRodado;
  }
  if (fechaInicioInput && registro.fechaInicio) {
    fechaInicioInput.value = registro.fechaInicio;
  }
  if (fechaEntregaInput) {
    fechaEntregaInput.value = registro.fechaEntrega || "";
  }
  if (medioPagoSelect && registro.medioPago) {
    medioPagoSelect.value = registro.medioPago;
  }
  if (anticipoInput) {
    anticipoInput.value = registro.anticipoGs ? Number(registro.anticipoGs).toLocaleString("es-PY") : "";
  }

  if (listaItems) {
    listaItems.innerHTML = "";
    if (Array.isArray(registro.items) && registro.items.length > 0) {
      registro.items.forEach((it) => crearFilaItem(it.descripcion, it.montoGs));
    } else {
      crearFilaItem();
    }
  }

  actualizarResumenFinanciero();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarRegistro(id) {
  const filtrados = leerGuardados().filter((item) => item.id !== id);
  escribirGuardados(filtrados);
  renderizarGuardados();
}

function renderizarGuardados() {
  const registros = leerGuardados();
  if (contadorGuardadosEl) contadorGuardadosEl.textContent = String(registros.length);
  if (!listaGuardadosEl) return;

  if (registros.length === 0) {
    listaGuardadosEl.innerHTML = `<p class="texto-vacio">Todavía no hay presupuestos guardados.</p>`;
    return;
  }

  listaGuardadosEl.innerHTML = "";
  registros.forEach((reg) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "guardado-item";

    const info = document.createElement("div");
    info.className = "guardado-info";
    info.innerHTML = `
      <strong>${reg.codigo} — ${reg.cliente}</strong>
      <p>${reg.modeloRodado} · Total: ${formatearGuaranies(reg.totalGs)} · Saldo: ${formatearGuaranies(reg.saldoGs)}</p>
    `;

    const acciones = document.createElement("div");
    acciones.className = "guardado-acciones";

    const btnCargar = document.createElement("button");
    btnCargar.type = "button";
    btnCargar.className = "btn-secundario";
    btnCargar.textContent = "Cargar";
    btnCargar.addEventListener("click", () => cargarRegistroEnFormulario(reg));

    const btnBorrar = document.createElement("button");
    btnBorrar.type = "button";
    btnBorrar.className = "btn-eliminar";
    btnBorrar.textContent = "Borrar";
    btnBorrar.addEventListener("click", () => eliminarRegistro(reg.id));

    acciones.append(btnCargar, btnBorrar);
    tarjeta.append(info, acciones);
    listaGuardadosEl.appendChild(tarjeta);
  });
}

function obtenerDatosRecibo() {
  const registros = leerGuardados();
  const cliente = (clienteInput?.value || "").trim() || "Cliente sin especificar";
  const equipo = (modeloRodadoInput?.value || "").trim() || "No especificado";
  const fecha = new Date().toLocaleDateString("es-PY");
  const medio = medioPagoSelect?.value || "Efectivo";
  const siguienteNum = obtenerSiguienteNumeroRecibo(registros);
  const codigo = `REC-${String(siguienteNum).padStart(4, "0")}`;

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

function mostrarReciboEnPantalla(datos) {
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
}

anticipoInput?.addEventListener("input", () => {
  const limpio = limpiarMonto(anticipoInput.value);
  anticipoInput.value = limpio ? limpio.toLocaleString("es-PY") : "";
  actualizarResumenFinanciero();
});

btnInmediata?.addEventListener("click", () => {
  if (fechaEntregaInput) fechaEntregaInput.value = "Inmediata";
});

btnGenerarRecibo?.addEventListener("click", () => {
  actualizarResumenFinanciero();
  const datos = obtenerDatosRecibo();
  mostrarReciboEnPantalla(datos);
  guardarPresupuestoEnStorage(datos.codigo);
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

btnNuevoPresupuesto?.addEventListener("click", () => {
  if (clienteInput) clienteInput.value = "";
  if (modeloRodadoInput) modeloRodadoInput.value = "";
  if (fechaEntregaInput) fechaEntregaInput.value = "";
  if (anticipoInput) anticipoInput.value = "";
  if (medioPagoSelect) medioPagoSelect.value = "Efectivo";
  if (reciboPreview) reciboPreview.hidden = true;
  establecerFechaHoy();
  if (listaItems) {
    listaItems.innerHTML = "";
    crearFilaItem();
  }
  actualizarResumenFinanciero();
});

btnAgregarItem?.addEventListener("click", () => crearFilaItem());

// Inicialización
establecerFechaHoy();
crearFilaItem();
renderizarGuardados();