# Español

Nota: Este archivo fue traducido por máquina y necesita revisión humana.

# Sunshine Care Log

> Herramienta gratuita y de código abierto para el seguimiento diario del cuidado de pacientes ancianos, diseñada para cuidadores familiares.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## ¿Qué es esto?

Una aplicación web bilingüe (chino tradicional / indonesio) que ayuda a los cuidadores familiares a registrar datos de salud diarios de pacientes ancianos en casa, especialmente quienes requieren control de líquidos.

No requiere instalación. Funciona en cualquier navegador de smartphone. Los datos se sincronizan con Google Sheets mediante Google Apps Script.

---

## Funcionalidades

- Registro de ingesta de líquidos (agua, bebidas medicinales, suplementos, comidas) con objetivo diario y barra de progreso
- Registro de salida de líquidos (volumen y color de orina, evacuaciones)
- Algoritmo inteligente de objetivo de orina ajustado para diuréticos
- Alerta por sobrecarga de líquidos (cuando la ingesta total supera 1.200 c.c.)
- Registro de ejercicios, mediciones de presión arterial y ritmo cardíaco
- Sistema de alerta por estreñimiento con instrucciones de seguridad bilingües
- Seguimiento del estado de medicación, recordatorios temporizados, sincronización en la nube con Google Sheets

---

## ¿Para quién es?

Cuidadores familiares, hogares con múltiples cuidadores y pacientes que necesitan control estricto de líquidos (insuficiencia cardíaca, diálisis, postoperatorio).

---

## Tecnología

Frontend: HTML + JavaScript + Tailwind CSS
Backend: Google Apps Script
Base de datos: Google Sheets
Hosting: GitHub Pages

---

## Instalación / Auto-hospedaje

1. Haz fork del repositorio
2. Despliega tu propio backend en Google Apps Script (configura GAS_URL en index.html)
3. Crea una Google Sheet para los datos
4. Actualiza GAS_URL y SPREADSHEET_URL en index.html
5. Activa GitHub Pages en tu fork

---

## Motivación

Creado porque las apps existentes eran complicadas, sólo en inglés o de pago; este proyecto pretende ser simple, bilingüe y gratuito.

---

## Contribuir

Se aceptan pull requests. Ver CONTRIBUTING.md.

---

## Licencia

MIT © 2026 anwer3712
