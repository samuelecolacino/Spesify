# Spesify
Spesify is a mobile app designed to store receipts for employees who need to submit expense reports to their employer.

---

## Projekt-Setup Anleitung

Diese Anleitung zeigt dir, wie du ein Projekt von Grund auf mit exakt denselben Libraries aufsetzt, die für **Spesify** verwendet werden. So ist das Grundgerüst komplett bereit und du kannst dich danach zu 100 % auf das Programmieren konzentrieren.

### 1. Neues Expo-Projekt initialisieren
Erstelle im ersten Schritt ein neues Expo-Projekt mit TypeScript-Unterstützung und navigiere in den neuen Ordner:

```bash
npx create-expo-app@latest spesifyapp --template blank-typescript
cd spesifyapp
```

### 2. Expo Router (Navigation) einrichten
Das Projekt nutzt dateibasierte Navigation. Dafür müssen der Router und die Basis-Pakete von Expo installiert werden:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

**Wichtig:** Öffne danach die `package.json` und ändere den Einstiegspunkt ("main"), damit der Expo-Router die App kontrolliert:
```json
"main": "expo-router/entry"
```

### 3. Kern-Funktionen via Expo installieren
Installiere nun die wesentlichen Kernkomponenten für die lokale Datenbank (SQLite), die Kamera, das Dateisystem und erweiterte UI-Gesten:

```bash
npx expo install expo-sqlite expo-camera expo-file-system @react-native-picker/picker react-native-gesture-handler react-native-reanimated @expo/vector-icons
```

### 4. State-Management & Hilfs-Libraries (NPM)
Wir nutzen `zustand` zur simplen und schnellen Zustandsverwaltung sowie `uuid` für einzigartige Expense-IDs. Installiere diese wie folgt:

```bash
npm install zustand uuid react-native-uuid
npm install -D @types/uuid
```
*(Sinnvoller Zusatz, falls komplexe Reanimated-Worklets im Projekt genutzt werden)*:
`npm install react-native-worklets-core react-native-worklets`

### 5. Babel-Konfiguration anpassen
Damit Features wie flüssige Swipe-Gesten (`react-native-reanimated`) reibungslos funktionieren, musst du ein Plugin in die `babel.config.js` Datei eintragen:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // <- Das hier ist wichtig!
    ],
  };
};
```

### 6. Grundstruktur anlegen
Nun ist alles konfiguriert. Du kannst den standardmäßigen Code in `App.tsx` löschen und dir folgende Ordnerstruktur für sauberen Code anlegen:

- **`/app`** (Alle deine Bildschirme/Screens für das Routing, z.B. `index.tsx`, `camera.tsx`)
- **`/src/store`** (Dein State-Management, z.B. der `expenseStore.ts`)
- **`/src/services`** (Datenbanklogik etc., z.B. `db.ts`)

### 7. App starten
Starte schlussendlich den Server (idealerweise mit geleertem Cache bei der ersten Konfiguration):

```bash
npx expo start --clear
```

🎉 **Fertig!** Ab jetzt brauchst du dich nicht mehr um Konfigurationen zu kümmern und kannst einfach nur noch Code in deine Dateien schreiben.
