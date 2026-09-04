# Sunshine Pflegeprotokoll / Sunshine Care Log

> Ein kostenloses Open-Source-Tool zur täglichen Pflegeverfolgung für ältere Patienten — für Familiencaregiver konzipiert.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Was ist das?

Eine zweisprachige Web-App (Traditionelles Chinesisch 🇹🇼 / Indonesisch 🇮🇩), die **Familiencaregiver** dabei unterstützt, tägliche Gesundheitsdaten älterer Patienten zu Hause zu verfolgen — besonders für Patienten mit chronischen Erkrankungen, die eine strikte Flüssigkeitsbilanzierung erfordern (Herzinsuffizienz, Dialyse, postoperative Genesung).

Keine Installation erforderlich. Funktioniert in jedem Smartphone-Browser. Daten werden über Google Apps Script mit Google Sheets synchronisiert.

---

## Funktionen

- **Flüssigkeitsaufnahmeerfassung** — Wasser, Medikamentengetränke, Nahrungsergänzungsmittel, Mahlzeiten (mit täglichem Ziel und Fortschrittsbalken)
- **Flüssigkeitsausscheidungsverfolgung** — Urinmenge + Farbe, Stuhlgang mit Status
- **Intelligenter Urin-Zielalgorithmus** — berechnet automatisch die erwartete Urinausscheidung basierend auf dem Wasserzufuhrziel, angepasst für Diuretika (Bereich ×1,1–1,5) vs. kein Medikament (Bereich ×0,4–0,6)
- **Flüssigkeitsüberlastungswarnung** — rote Warnung, wenn die Gesamtzufuhr 1.200 c.c. überschreitet
- **Trainingsprotokollierung** — Flaschenhebeübungen, Fußtritte, Kniebeugen, Aufsteckhilfe (mit Sicherheitsprotokoll-Checkliste)
- **Blutdruck und Herzfrequenz** — Messungen morgens und abends mit Messleitfaden
- **Verstopfungswarnungssystem** — wird automatisch alle 2 Stunden 60–72 Stunden nach dem letzten Stuhlgang ausgelöst, mit zweisprachigen Sicherheitsanweisungen, die unbeaufsichtigte Klysteranwendung verbieten
- **Medikamentenstatus-Verfolgung** — Diuretika und Abführmittel, in der Cloud persistiert
- **Zeitbasiertes Erinnerungssystem** — intelligente Erinnerungen für BP-Messung, Trainingszeitfenster und Urinkontrolle vor dem Schlafengehen
- **Cloud-Synchronisierung** — alle Daten gespeichert in Google Sheets über Google Apps Script; unterstützt Haushalte mit mehreren Pflegepersonen
- **Optimistische Benutzeroberfläche** — Datensätze erscheinen sofort ohne Warten auf Serverantwort
- **Wöchentliche Putzreminder** — integrierter Zeitplan für Haushaltsreinigungsaufgaben

---

## Für wen ist das?

- Familienmitglieder, die ältere Eltern oder Großeltern zu Hause pflegen
- Haushalte mit mehreren rotierenden Pflegepersonen (besonders über Sprachbarrieren hinweg)
- Patienten mit Bedingungen, die strikte Flüssigkeitsüberwachung erfordern (Herzinsuffizienz, Dialyse, postoperative Genesung)

---

## Technologie-Stack

| Schicht | Technologie |
|-------|-----------|
| Frontend | Vanilla HTML + JavaScript + Tailwind CSS |
| Backend | Google Apps Script (serverlos) |
| Datenbank | Google Sheets |
| Hosting | GitHub Pages (kostenlos) |

Keine Frameworks. Keine Build-Tools. Keine Abhängigkeiten zum Installieren. Öffnet sich direkt in jedem Browser.

---

## Einrichtung / Selbsthosting

1. Dieses Repository forken
2. Eigenes Google Apps Script Backend bereitstellen (siehe `GAS_URL` in `index.html`)
3. Google Sheet zur Datenspeicherung erstellen
4. `GAS_URL` und `SPREADSHEET_URL` Konstanten in `index.html` aktualisieren
5. GitHub Pages in Ihrem Fork aktivieren → fertig

---

## Screenshots

| Tägliches Tracking | Zweisprachig geführte Eingabe | Trendanalyse |
|---|---|---|
| Tägliches Pflegeprotokoll: Fortschrittsstreifen, Flüssigkeitszielaufnahme mit Fortschrittsbalken, Auswahl der Kategorien Wasser/Medikamente/Ernährung/Mahlzeiten | Geführter Eingabebildschirm zeigt Anweisungen auf Traditionelles Chinesisch und Indonesisch nebeneinander, mit nummerierten Schritten | Gesundheits-Trendanalysseite mit 7/14/30-Tage-Bereichswähler und fünfzehn wählbaren Kreuzvariablen-Diagrammen |
| Fortschrittsstreifen, Flüssigkeitsziel und Kategorieprotokolle | Jede Zeichenfolge auf Traditionelles Chinesisch und Indonesisch, Schritt für Schritt | 15 Kreuzvariablen-Diagramme (7/14/30 Tage) |

*（Live-Demo: https://anwer3712.github.io/diet-log/ — Screenshots auf 414×896-Smartphone-Viewport）*

---

## Motivation

Aus Notwendigkeit entstanden. Als ein Familienmitglied 24/7-häusliche Pflege mit strikter Flüssigkeitsbilanzierung benötigte, waren vorhandene Apps entweder zu komplex, nur auf Englisch oder erforderten monatliche Abonnements. Dieses Tool zielt darauf ab, eine einfache, kostenlose und mehrsprachige Lösung bereitzustellen, damit Pflegepersonen sich auf den Patienten konzentrieren können, nicht auf die App.

---

## Roadmap

Geplante Verbesserungen — jede ist ein offenes Problem, Community-Feedback ist willkommen:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **KI-gestützte Gesundheitsanalyse** — Claude integrieren, um abnormale Trends in Flüssigkeitsaufnahme-, Urinausscheidungs- und Blutdruckdaten zu erkennen und Rohzahlen in klare Pflegeanleitungen zu übersetzen
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **KI Caregiver Q&A** — Pflegepersonen ermöglichen, Fragen in ihrer eigenen Sprache zu stellen (z.B. „Ihr Urin war heute dunkel, sollte ich mir Sorgen machen?") basierend auf den tatsächlich protokollierten Patientendaten
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Zusätzliche Sprachpaare** — Englisch, Vietnamesisch, Tagalog, Thai für multikulturelle Pflegehaushalte
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Offline-Modus** — Service-Worker-Caching für instabile Verbindungen
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Druckbare Wochenberichte** — einseitige Zusammenfassungen für Arztbesuche
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Multi-Patient-Unterstützung** — für Haushalte oder kleine Pflegeeinrichtungen zur Verfolgung von mehr als einer Person

---

## Beitragen

Pull Requests willkommen — siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Hilfe (Übersetzungsbeiträge werden besonders geschätzt). Dieses Projekt folgt einem [Verhaltenskodex](CODE_OF_CONDUCT.md).

Wenn Sie ein älteres Familienmitglied pflegen und eine Funktion benötigen — [öffnen Sie ein Problem](https://github.com/anwer3712/diet-log/issues).

---

## Sicherheit

Sicherheitslücke gefunden? Bitte melden Sie sie privat — siehe [SECURITY.md](SECURITY.md).
Öffnen Sie kein öffentliches Problem und nehmen Sie niemals echte Patientendaten in einen Bericht auf.

---

## Lizenz

MIT © 2026 anwer3712
