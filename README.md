 **Mitarbeiter-Verwaltung**
  
Eine moderne Web-Anwendung zur Verwaltung von Mitarbeitern und Arbeitszeiten mit LocalStorage.

**Schnellstart:**


**Funktionen:**
- Mitarbeiter verwalten - Hinzufügen, Bearbeiten, Löschen

- Arbeitszeiten erfassen - Schichten mit automatischer Dauerberechnung

- Suchefuktion für Mitarbeiter


**Technologien:**
HTML5, CSS3, JavaScript

**Projektstruktur:**

mitarbeiterVerwaltung/
├── index.html          # Hauptanwendung
├── style.css           # Styling 
├── script.js           # Datenmanagement
└── README.md           # Dokumentation

**Verwendung:**

*Mitarbeiter hinzufügen:*

- Klicke auf "Neue/r Mitarbeiter/in"
- Fülle Name und Rolle aus
- Wähle Status (Aktiv/Inaktiv)
- Klicke "Speichern"

*Schichten erfassen:*
- Wähle Mitarbeiter aus der Liste
- Wechsle zu "Arbeitszeiten" Tab
- Klicke "Neue Schicht"
- Gib Datum, Start- und Endzeit ein
- Klicke "Speichern"

*Mitarbeiter suchen:*
- Verwende das Suchfeld oben in der Mitarbeiterliste

**Entwicklung:**
// Mitarbeiter
{
  id: "timestamp",
  name: "string",
  role: "string", 
  status: "active|inactive",
  shifts: []
}

// Schicht
{
  id: "timestamp",
  start: "ISOString",
  end: "ISOString"
}

**Lizenz:**
MIT License - Siehe LICENSE Datei für Details.
