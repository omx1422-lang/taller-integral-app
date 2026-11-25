-- 1. Clientes del taller
CREATE TABLE clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(40),
    direccion TEXT,
    notas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Proveedores de materiales e insumos
CREATE TABLE proveedores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rubro VARCHAR(100),
    telefono VARCHAR(40),
    contacto VARCHAR(120),
    notas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Presupuestos / órdenes de trabajo (incluye anticipo y saldos en Gs.)
CREATE TABLE presupuestos_trabajos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_correlativo VARCHAR(30) UNIQUE NOT NULL,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    equipo_rodado VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_texto VARCHAR(80), -- Ej: "Inmediata" o fecha formateada
    fecha_entrega_estimada DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'presupuestado'
        CHECK (estado IN ('presupuestado', 'en_proceso', 'listo', 'entregado', 'cancelado')),
    total_gs BIGINT NOT NULL DEFAULT 0 CHECK (total_gs >= 0),
    anticipo_inicial_gs BIGINT NOT NULL DEFAULT 0 CHECK (anticipo_inicial_gs >= 0),
    total_cobrado_gs BIGINT NOT NULL DEFAULT 0 CHECK (total_cobrado_gs >= 0),
    saldo_pendiente_gs BIGINT NOT NULL DEFAULT 0,
    observaciones TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Detalle de trabajos / repuestos dentro de cada presupuesto
CREATE TABLE items_trabajo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    presupuesto_trabajo_id BIGINT NOT NULL REFERENCES presupuestos_trabajos(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario_gs BIGINT NOT NULL DEFAULT 0 CHECK (precio_unitario_gs >= 0),
    subtotal_gs BIGINT NOT NULL DEFAULT 0 CHECK (subtotal_gs >= 0),
    orden INT NOT NULL DEFAULT 1
);

-- 5. Recibos emitidos (anticipos, abonos o cancelación de saldo)
CREATE TABLE recibos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_recibo VARCHAR(30) UNIQUE NOT NULL,
    presupuesto_trabajo_id BIGINT NOT NULL REFERENCES presupuestos_trabajos(id) ON DELETE RESTRICT,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    monto_gs BIGINT NOT NULL CHECK (monto_gs > 0),
    tipo_pago VARCHAR(20) NOT NULL DEFAULT 'anticipo'
        CHECK (tipo_pago IN ('anticipo', 'abono', 'saldo_final')),
    medio_pago VARCHAR(30) NOT NULL DEFAULT 'efectivo'
        CHECK (medio_pago IN ('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro')),
    observacion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Compras de materiales vinculadas a proveedores (y opcionalmente a un trabajo)
CREATE TABLE compras_materiales (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proveedor_id BIGINT NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
    presupuesto_trabajo_id BIGINT REFERENCES presupuestos_trabajos(id) ON DELETE SET NULL,
    fecha_compra DATE NOT NULL DEFAULT CURRENT_DATE,
    detalle_material TEXT NOT NULL,
    monto_gs BIGINT NOT NULL CHECK (monto_gs >= 0),
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'pagado'
        CHECK (estado_pago IN ('pagado', 'pendiente')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas y relaciones frecuentes
CREATE INDEX idx_presupuestos_cliente ON presupuestos_trabajos(cliente_id);
CREATE INDEX idx_presupuestos_estado ON presupuestos_trabajos(estado);
CREATE INDEX idx_items_presupuesto ON items_trabajo(presupuesto_trabajo_id);
CREATE INDEX idx_recibos_presupuesto ON recibos(presupuesto_trabajo_id);
CREATE INDEX idx_recibos_cliente ON recibos(cliente_id);
CREATE INDEX idx_compras_proveedor ON compras_materiales(proveedor_id);
CREATE INDEX idx_compras_presupuesto ON compras_materiales(presupuesto_trabajo_id);