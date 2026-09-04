# Registro de Cuidados del Sunshine / Sunshine Care Log

> Una herramienta gratuita y de código abierto para rastrear el cuidado diario de pacientes ancianos — diseñada para cuidadores familiares.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## ¿Qué es esto?

Una aplicación web bilingüe (Chino Tradicional 🇹🇼 / Indonesio 🇮🇩) diseñada para ayudar a los **cuidadores familiares** a rastrear datos de salud diarios de pacientes ancianos en casa — especialmente aquellos con enfermedades crónicas que requieren manejo estricto de líquidos (insuficiencia cardíaca, diálisis, recuperación posquirúrgica).

Sin necesidad de instalación. Funciona en cualquier navegador de teléfono inteligente. Los datos se sincronizan con Google Sheets a través de Google Apps Script.

---

## Características principales

- **Seguimiento de ingesta de líquidos** — agua, bebidas medicinales, suplementos nutricionales, comidas (con objetivo diario y barra de progreso)
- **Seguimiento de producción de líquidos** — volumen de orina + color, movimientos intestinales con estado
- **Algoritmo inteligente de objetivo de orina** — calcula automáticamente la producción de orina esperada según el objetivo de ingesta de agua, ajustado según medicamentos diuréticos (rango ×1.1–1.5) vs. sin medicamento (rango ×0.4–0.6)
- **Advertencia de sobrecarga de líquidos** — alerta roja cuando la ingesta total supera 1.200 c.c.
- **Registro de ejercicio** — levantamientos de botellas, presiones de pies, flexiones de rodillas, asistencia para ponerse de pie (con lista de verificación de protocolo de seguridad)
- **Presión arterial y frecuencia cardíaca** — mediciones matutinas y nocturnas con directrices de medición
- **Sistema de alerta de estreñimiento** — se activa automáticamente cada 2 horas entre 60–72 horas después del último movimiento intestinal, con instrucciones de seguridad bilingües que prohíben el uso de enema sin supervisión
- **Seguimiento del estado de medicamentos** — diuréticos y laxantes, persistidos en la nube
- **Sistema de recordatorios basado en tiempo** — recordatorios inteligentes para medición de presión arterial, intervalos de ejercicio y verificación de orina antes de dormir
- **Sincronización en la nube** — todos los datos guardados en Google Sheets a través de Google Apps Script; compatible con hogares de múltiples cuidadores
- **Interfaz optimista** — los registros aparecen instantáneamente sin esperar respuesta del servidor
- **Recordatorios de limpieza semanal** — cronograma incorporado para tareas de higiene del hogar

---

## ¿Para quién es esto?

- Miembros de la familia que cuidan a padres o abuelos ancianos en casa
- Hogares con múltiples cuidadores rotativos (especialmente a través de barreras lingüísticas)
- Pacientes con condiciones que requieren monitoreo estricto de líquidos (insuficiencia cardíaca, diálisis, recuperación posquirúrgica)

---

## Stack tecnológico

| Capa | Tecnología |
|-------|----------|
| Frontend | HTML + JavaScript + Tailwind CSS vanilla |
| Backend | Google Apps Script (sin servidor) |
| Base de datos | Google Sheets |
| Alojamiento | GitHub Pages (gratuito) |

Sin frameworks. Sin herramientas de construcción. Sin dependencias para instalar. Se abre directamente en cualquier navegador.

---

## Configuración / Alojamiento propio

1. Fork este repositorio
2. Implemente su propio backend de Google Apps Script (consulte `GAS_URL` en `index.html`)
3. Cree una Google Sheet para el almacenamiento de datos
4. Actualice las constantes `GAS_URL` y `SPREADSHEET_URL` en `index.html`
5. Habilite GitHub Pages en su fork → listo

---

## Capturas de pantalla

| Seguimiento diario | Entrada guiada bilingüe | Análisis de tendencias |
|---|---|---|
| Registro de cuidados diarios: barra de progreso, objetivo de ingesta de líquidos y barra de progreso, selección de categorías agua/medicamentos/nutrición/comidas | Pantalla de entrada guiada que muestra instrucciones en chino tradicional e indonesio lado a lado, con pasos numerados | Página de análisis de tendencias de salud con selector de rango 7/14/30 días y quince gráficos de variables cruzadas seleccionables |
| Barra de progreso, objetivo de líquidos y registro de categorías | Cada cadena en chino tradicional e indonesio, paso a paso | 15 gráficos de variables cruzadas (7/14/30 días) |

*（Demostración en vivo: https://anwer3712.github.io/diet-log/ — capturas de pantalla tomadas en ventana gráfica de 414×896 píxeles）*

---

## Motivación

Construido por necesidad. Cuando un miembro de la familia requería cuidados en el hogar las 24 horas con manejo estricto de líquidos, las aplicaciones existentes eran demasiado complejas, solo en inglés o requerían suscripciones mensuales. El objetivo de esta herramienta es: proporcionar una solución simple, gratuita y multilingüe para que los cuidadores puedan enfocarse en el paciente, no en la aplicación.

---

## Hoja de ruta

Mejoras planificadas — cada una es un problema abierto, se aceptan comentarios de la comunidad:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Análisis de salud asistido por IA** — integre Claude para detectar tendencias anormales en datos de ingesta de líquidos, producción de orina y presión arterial, y traduzca números brutos en orientación de cuidados en lenguaje plano
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Preguntas y respuestas del cuidador con IA** — permita que los cuidadores hagan preguntas en su propio idioma ("su orina estaba oscura hoy, ¿debería preocuparme?") basadas en los datos reales registrados del paciente
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Pares de idiomas adicionales** — inglés, vietnamita, tagalo, tailandés para hogares de cuidados multiculturales
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Modo sin conexión** — almacenamiento en caché de trabajador de servicio para conexiones inestables
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Informes semanales imprimibles** — resúmenes de una página para visitas al médico
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Soporte multiusuario** — para hogares o pequeños centros de cuidados que rastrean a más de una persona

---

## Contribuyendo

Se aceptan solicitudes de extracción — consulte [CONTRIBUTING.md](CONTRIBUTING.md) para saber cómo ayudar (se aprecian especialmente las contribuciones de traducción). Este proyecto sigue un [Código de conducta](CODE_OF_CONDUCT.md).

Si cuida a un miembro de la familia anciano y necesita una función — [abra un problema](https://github.com/anwer3712/diet-log/issues).

---

## Seguridad

¿Encontró una vulnerabilidad? Informe privadamente — consulte [SECURITY.md](SECURITY.md).
No abra un problema público y nunca incluya datos reales de pacientes en un informe.

---

## Licencia

MIT © 2026 anwer3712