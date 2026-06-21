# Finest Desktop

Applicazione desktop per la gestione finanziaria personale, costruita con **Electron + React + Vite + Tailwind CSS**, nello stesso stile grafico del progetto web originale (sidebar, colori, font Montserrat/Poppins).

Tutte le funzionalità sono operative e i dati vengono salvati **in locale, sul tuo computer** (nessun account, nessun cloud):

- **Panoramica** — patrimonio netto, entrate/uscite/risparmi totali, grafico degli ultimi 6 mesi, riepilogo obiettivi e ultime transazioni (tutto calcolato in tempo reale dai tuoi dati).
- **Transazioni** — aggiungi, modifica, elimina, filtra per tipo/categoria e cerca per descrizione.
- **Categorie** — crea categorie di Entrate, Uscite e Risparmi con icona personalizzata; modifica ed elimina.
- **Obiettivi** — crea obiettivi di ricavi, limiti di spesa o obiettivi di risparmio, mensili o totali. Se collegati a una categoria il progresso si calcola automaticamente dalle transazioni; altrimenti puoi aggiornarli manualmente.
- Tema chiaro/scuro persistente, sidebar comprimibile, layout responsive, notifiche di conferma per ogni azione.

## Requisiti

- [Node.js](https://nodejs.org) versione 18 o superiore (consigliata 20+)

## Installazione

```bash
npm install
```

## Avvio in modalità sviluppo (finestra Electron)

```bash
npm run electron:dev
```

Questo comando avvia Vite in background e apre la finestra Electron collegata ad esso, con hot-reload.

## Solo anteprima nel browser (senza Electron)

```bash
npm run dev
```

Utile per iterare rapidamente sull'interfaccia. In questa modalità i dati vengono salvati nel `localStorage` del browser invece che su file (funzionalità identica, solo storage diverso).

## Creare l'eseguibile installabile (.exe / .dmg / .AppImage)

```bash
npm run dist
```

L'installer verrà generato nella cartella `release/`. Su Windows produce un installer NSIS (`.exe`), su macOS un `.dmg`, su Linux un `.AppImage`. Esegui questo comando sul sistema operativo per cui vuoi generare l'eseguibile (es. esegui su Windows per ottenere l'`.exe`).

## Dove vengono salvati i dati

I dati (categorie, transazioni, obiettivi) sono salvati in un file JSON nella cartella dati utente del sistema, ad esempio:

- Windows: `%APPDATA%/finest-desktop/finest-data.json`
- macOS: `~/Library/Application Support/finest-desktop/finest-data.json`
- Linux: `~/.config/finest-desktop/finest-data.json`

Puoi fare il backup dell'app semplicemente copiando questo file.

## Struttura del progetto

```
finest-desktop/
├── electron/
│   ├── main.cjs        # Processo principale Electron, crea la finestra e gli handler IPC
│   ├── preload.cjs      # Bridge sicuro tra Electron e React (contextBridge)
│   └── store.cjs        # Persistenza dati su file JSON locale
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Navbar, Sidebar mobile
│   │   ├── pages/        # Panoramica, Transazioni, Categorie, Obiettivi
│   │   └── ui/           # Modal, Button, Input, ConfirmModal, Section
│   ├── context/          # ThemeContext, DataContext, ToastContext
│   └── util/             # formattazione valuta/date, icone categorie
└── package.json
```

## Note

- Le categorie eliminate non rimuovono le transazioni/obiettivi collegati: questi mostreranno "categoria eliminata" mantenendo lo storico.
- Il "patrimonio netto" è calcolato come: entrate totali − uscite totali + risparmi totali.
