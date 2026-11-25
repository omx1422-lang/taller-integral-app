const STORAGE_PRESUPUESTOS = "taller_integral_presupuestos_v1";
const STORAGE_CLIENTES = "taller_integral_clientes_v1";
const STORAGE_PROVEEDORES = "taller_integral_proveedores_v1";
const btnIrARecibo = document.getElementById("btnIrARecibo");
const resumenClienteActivoEl = document.getElementById("resumenClienteActivo");
const SESSION_KEY = "taller_integral_sesion_v1";
const USUARIO_ADMIN = "admin";
const CLAVE_ADMIN = "taller2026";

const vistaLogin = document.getElementById("vistaLogin");
const appPrincipal = document.getElementById("appPrincipal");
const formLogin = document.getElementById("formLogin");
const loginUsuarioInput = document.getElementById("loginUsuario");
const loginClaveInput = document.getElementById("loginClave");
const loginErrorEl = document.getElementById("loginError");
const btnAccesoDemo = document.getElementById("btnAccesoDemo");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const usuarioActivoTextoEl = document.getElementById("usuarioActivoTexto");

function activarSesion(nombreUsuario, esDemo = false) {
  const infoSesion = { usuario: nombreUsuario, demo: esDemo };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(infoSesion));
  if (loginErrorEl) loginErrorEl.hidden = true;
  if (vistaLogin) vistaLogin.hidden = true;
  if (appPrincipal) appPrincipal.hidden = false;
  if (usuarioActivoTextoEl) {
    usuarioActivoTextoEl.textContent = esDemo
      ? `Sesión: ${nombreUsuario} (Modo demo)`
      : `Usuario: ${nombreUsuario}`;
  }
}

function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY);
  if (formLogin) formLogin.reset();
  if (appPrincipal) appPrincipal.hidden = true;
  if (vistaLogin) vistaLogin.hidden = false;
}

function verificarSesionInicial() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      cerrarSesion();
      return;
    }
    const sesion = JSON.parse(raw);
    if (sesion && sesion.usuario) {
      activarSesion(sesion.usuario, Boolean(sesion.demo));
    } else {
      cerrarSesion();
    }
  } catch {
    cerrarSesion();
  }
}

formLogin?.addEventListener("submit", (e) => {
  e.preventDefault();
  const userIngresado = (loginUsuarioInput?.value || "").trim().toLowerCase();
  const claveIngresada = loginClaveInput?.value || "";

  if (userIngresado === USUARIO_ADMIN && claveIngresada === CLAVE_ADMIN) {
    activarSesion(USUARIO_ADMIN, false);
  } else {
    if (loginErrorEl) loginErrorEl.hidden = false;
  }
});

btnAccesoDemo?.addEventListener("click", () => {
  activarSesion("Invitado Demo", true);
});

btnCerrarSesion?.addEventListener("click", cerrarSesion);

// Llamá a esto al final de la inicialización de app.js:
verificarSesionInicial();

// Navegación por pestañas
const tabBtns = document.querySelectorAll(".tab-btn");
const vistas = document.querySelectorAll(".vista-seccion");

// Elementos de Presupuesto y Recibo
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

// Elementos de Clientes
const formCliente = document.getElementById("formCliente");
const cliNombreInput = document.getElementById("cliNombre");
const cliTelefonoInput = document.getElementById("cliTelefono");
const cliDireccionInput = document.getElementById("cliDireccion");
const cliNotasInput = document.getElementById("cliNotas");
const buscarClienteInput = document.getElementById("buscarCliente");
const listaClientesEl = document.getElementById("listaClientes");
const contadorClientesEl = document.getElementById("contadorClientes");

// Elementos de Proveedores
const formProveedor = document.getElementById("formProveedor");
const provNombreInput = document.getElementById("provNombre");
const provRubroInput = document.getElementById("provRubro");
const provTelefonoInput = document.getElementById("provTelefono");
const provNotasInput = document.getElementById("provNotas");
const buscarProveedorInput = document.getElementById("buscarProveedor");
const listaProveedoresEl = document.getElementById("listaProveedores");
const contadorProveedoresEl = document.getElementById("contadorProveedores");

let totalActualGs = 0;
let anticipoActualGs = 0;
let saldoActualGs = 0;

function cambiarVista(idVista) {
  vistas.forEach((sec) => {
    sec.hidden = sec.id !== idVista;
  });
  tabBtns.forEach((btn) => {
    btn.classList.toggle("activa", btn.dataset.vista === idVista);
  });
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.vista) cambiarVista(btn.dataset.vista);
  });
});

function leerArrayStorage(clave) {
  try {
    const raw = localStorage.getItem(clave);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escribirArrayStorage(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch {
    alert("No se pudo guardar en el almacenamiento del navegador.");
  }
}

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
    const nombreCli = (clienteInput?.value || "").trim();
  if (resumenClienteActivoEl) {
    resumenClienteActivoEl.textContent = nombreCli ? `Cliente: ${nombreCli}` : "Sin cliente cargado";
  }
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
  const registros = leerArrayStorage(STORAGE_PRESUPUESTOS);

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
  escribirArrayStorage(STORAGE_PRESUPUESTOS, registros);
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
  cambiarVista("vistaPresupuesto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarPresupuesto(id) {
  const filtrados = leerArrayStorage(STORAGE_PRESUPUESTOS).filter((item) => item.id !== id);
  escribirArrayStorage(STORAGE_PRESUPUESTOS, filtrados);
  renderizarGuardados();
}

function renderizarGuardados() {
  const registros = leerArrayStorage(STORAGE_PRESUPUESTOS);
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
    btnBorrar.addEventListener("click", () => eliminarPresupuesto(reg.id));

    acciones.append(btnCargar, btnBorrar);
    tarjeta.append(info, acciones);
    listaGuardadosEl.appendChild(tarjeta);
  });
}

function obtenerDatosRecibo() {
  const registros = leerArrayStorage(STORAGE_PRESUPUESTOS);
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

// --- CLIENTES ---
function renderizarClientes() {
const listaClientesSugeridosEl = document.getElementById("listaClientesSugeridos");
const btnExportarDatos = document.getElementById("btnExportarDatos");
const inputImportarDatos = document.getElementById("inputImportarDatos");

function actualizarDatalistClientes() {
  if (!listaClientesSugeridosEl) return;
  const clientes = leerArrayStorage(STORAGE_CLIENTES);
  listaClientesSugeridosEl.innerHTML = "";

  clientes.forEach((cli) => {
    const opcion = document.createElement("option");
    opcion.value = cli.nombre;
    if (cli.telefono) opcion.label = cli.telefono;
    listaClientesSugeridosEl.appendChild(opcion);
  });
}

btnExportarDatos?.addEventListener("click", () => {
  const respaldo = {
    exportadoEn: new Date().toISOString(),
    presupuestos: leerArrayStorage(STORAGE_PRESUPUESTOS),
    clientes: leerArrayStorage(STORAGE_CLIENTES),
    proveedores: leerArrayStorage(STORAGE_PROVEEDORES),
  };

  const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `taller-integral-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  enlace.click();
  URL.revokeObjectURL(url);
});

inputImportarDatos?.addEventListener("change", async (e) => {
  const archivo = e.target.files?.[0];
  if (!archivo) return;

  try {
    const texto = await archivo.text();
    const data = JSON.parse(texto);

    if (Array.isArray(data.presupuestos)) {
      escribirArrayStorage(STORAGE_PRESUPUESTOS, data.presupuestos);
    }
    if (Array.isArray(data.clientes)) {
      escribirArrayStorage(STORAGE_CLIENTES, data.clientes);
    }
    if (Array.isArray(data.proveedores)) {
      escribirArrayStorage(STORAGE_PROVEEDORES, data.proveedores);
    }

    renderizarGuardados();
    renderizarClientes();
    renderizarProveedores();
    alert("Respaldo importado correctamente.");
  } catch {
    alert("El archivo seleccionado no es un respaldo JSON válido.");
  } finally {
    inputImportarDatos.value = "";
  }
});
  const clientes = leerArrayStorage(STORAGE_CLIENTES);
  const filtro = (buscarClienteInput?.value || "").trim().toLowerCase();
  if (contadorClientesEl) contadorClientesEl.textContent = String(clientes.length);
  if (!listaClientesEl) return;

  const filtrados = clientes.filter((c) => {
    const texto = `${c.nombre} ${c.telefono || ""} ${c.direccion || ""} ${c.notas || ""}`.toLowerCase();
    return texto.includes(filtro);
  });

  if (filtrados.length === 0) {
    listaClientesEl.innerHTML = `<p class="texto-vacio">${
      clientes.length === 0 ? "Todavía no hay clientes registrados." : "No hay coincidencias con la búsqueda."
    }</p>`;
    return;
  }

  listaClientesEl.innerHTML = "";
  filtrados.forEach((cli) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "guardado-item";

    const info = document.createElement("div");
    info.className = "guardado-info";
    const detalles = [cli.telefono, cli.direccion, cli.notas].filter(Boolean).join(" · ");
    info.innerHTML = `
      <strong>${cli.nombre}</strong>
      <p>${detalles || "Sin datos adicionales"}</p>
    `;

    const acciones = document.createElement("div");
    acciones.className = "guardado-acciones";

    const btnUsar = document.createElement("button");
    btnUsar.type = "button";
    btnUsar.className = "btn-secundario";
    btnUsar.textContent = "Usar en presupuesto";
    btnUsar.addEventListener("click", () => {
      if (clienteInput) clienteInput.value = cli.nombre;
      cambiarVista("vistaPresupuesto");
    });

    const btnBorrar = document.createElement("button");
    btnBorrar.type = "button";
    btnBorrar.className = "btn-eliminar";
    btnBorrar.textContent = "Borrar";
    btnBorrar.addEventListener("click", () => {
      const actualizados = leerArrayStorage(STORAGE_CLIENTES).filter((item) => item.id !== cli.id);
      escribirArrayStorage(STORAGE_CLIENTES, actualizados);
      renderizarClientes();
    });

    acciones.append(btnUsar, btnBorrar);
    tarjeta.append(info, acciones);
    listaClientesEl.appendChild(tarjeta);
  });
  actualizarDatalistClientes();
}

formCliente?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = (cliNombreInput?.value || "").trim();
  if (!nombre) return;

  const clientes = leerArrayStorage(STORAGE_CLIENTES);
  clientes.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    nombre,
    telefono: (cliTelefonoInput?.value || "").trim(),
    direccion: (cliDireccionInput?.value || "").trim(),
    notas: (cliNotasInput?.value || "").trim(),
  });

  escribirArrayStorage(STORAGE_CLIENTES, clientes);
  formCliente.reset();
  renderizarClientes();
});

buscarClienteInput?.addEventListener("input", renderizarClientes);

// --- PROVEEDORES ---
function renderizarProveedores() {
  const proveedores = leerArrayStorage(STORAGE_PROVEEDORES);
  const filtro = (buscarProveedorInput?.value || "").trim().toLowerCase();
  if (contadorProveedoresEl) contadorProveedoresEl.textContent = String(proveedores.length);
  if (!listaProveedoresEl) return;

  const filtrados = proveedores.filter((p) => {
    const texto = `${p.nombre} ${p.rubro || ""} ${p.telefono || ""} ${p.notas || ""}`.toLowerCase();
    return texto.includes(filtro);
  });

  if (filtrados.length === 0) {
    listaProveedoresEl.innerHTML = `<p class="texto-vacio">${
      proveedores.length === 0 ? "Todavía no hay proveedores registrados." : "No hay coincidencias con la búsqueda."
    }</p>`;
    return;
  }

  listaProveedoresEl.innerHTML = "";
  filtrados.forEach((prov) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "guardado-item";

    const info = document.createElement("div");
    info.className = "guardado-info";
    const detalles = [prov.rubro, prov.telefono, prov.notas].filter(Boolean).join(" · ");
    info.innerHTML = `
      <strong>${prov.nombre}</strong>
      <p>${detalles || "Sin datos adicionales"}</p>
    `;

    const acciones = document.createElement("div");
    acciones.className = "guardado-acciones";

    const btnBorrar = document.createElement("button");
    btnBorrar.type = "button";
    btnBorrar.className = "btn-eliminar";
    btnBorrar.textContent = "Borrar";
    btnBorrar.addEventListener("click", () => {
      const actualizados = leerArrayStorage(STORAGE_PROVEEDORES).filter((item) => item.id !== prov.id);
      escribirArrayStorage(STORAGE_PROVEEDORES, actualizados);
      renderizarProveedores();
    });

    acciones.append(btnBorrar);
    tarjeta.append(info, acciones);
    listaProveedoresEl.appendChild(tarjeta);
  });
}

formProveedor?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = (provNombreInput?.value || "").trim();
  if (!nombre) return;

  const proveedores = leerArrayStorage(STORAGE_PROVEEDORES);
  proveedores.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    nombre,
    rubro: (provRubroInput?.value || "").trim(),
    telefono: (provTelefonoInput?.value || "").trim(),
    notas: (provNotasInput?.value || "").trim(),
  });

  escribirArrayStorage(STORAGE_PROVEEDORES, proveedores);
  formProveedor.reset();
  renderizarProveedores();
});

buscarProveedorInput?.addEventListener("input", renderizarProveedores);

// --- EVENTOS PRESUPUESTO ---
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

btnIrARecibo?.addEventListener("click", () => {
  actualizarResumenFinanciero();
  cambiarVista("vistaRecibos");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Inicialización
establecerFechaHoy();
crearFilaItem();
renderizarGuardados();
renderizarClientes();
renderizarProveedores();