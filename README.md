# Taller Integral S.A. — Sistema de Gestión Web

Aplicación web modular y responsiva desarrollada para agilizar la emisión de presupuestos, recibos de anticipo y administración básica de clientes y proveedores de **Taller Integral S.A.** (Metalúrgica, Tornería, Mecánica, Soldaduras y Lavadero).

## Funcionalidades principales

- **Control de acceso:** Pantalla de inicio de sesión con credenciales configurables y modo de acceso rápido (*Modo Demo*) para demostraciones y porfolio.
- **Presupuestos dinámicos:** Carga de múltiples ítems con cálculo automático de subtotales y monto total en Guaraníes (`Gs.`), fechas de inicio/entrega y gestión de estados (*Aceptado*, *Rechazado*, *Finalizado*).
- **Recibos e historial:** Cálculo automático de anticipo y saldo pendiente, generación de comprobantes correlativos (`REC-0001`, `REC-0002`...), vista lista para impresión/PDF y copiado rápido para compartir por WhatsApp.
- **Gestión de clientes y proveedores:** Registro completo incluyendo RUC/Cédula, búsqueda en tiempo real y autocompletado directo al redactar un presupuesto.
- **Persistencia y respaldo:** Almacenamiento local en el navegador (`localStorage`) con exportación e importación de copias de seguridad en formato `.json`.

## Tecnologías utilizadas

- **HTML5** semántico
- **CSS3** (Grid, Flexbox, variables CSS y diseño responsivo)
- **JavaScript (ES6+)** modular sin dependencias externas
- **Git & GitHub** para control de versiones

## Estructura del proyecto

```text
taller-integral-app/
├── db/
│   └── schema.sql         # Estructura relacional base proyectada para SQL
├── src/
│   ├── css/
│   │   └── styles.css     # Estilos globales, tarjetas, pestañas y vista de impresión
│   ├── js/
│   │   └── app.js         # Lógica de negocio, sesión, cálculos y persistencia
│   └── pages/
│       └── index.html     # Interfaz principal estructurada por vistas
└── README.md