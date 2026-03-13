# LSI Cloud — Portal Partnerski

Prototyp portalu partnerskiego dla programu poleceń LSI Cloud.

## Jak uruchomić lokalnie

```bash
npm install
npm start
```

Otwórz http://localhost:3000

## Deploy na Vercel (darmowy hosting)

### Metoda 1 — przez GitHub (zalecana)

1. Załóż konto na [github.com](https://github.com)
2. Utwórz nowe repozytorium (np. `lsi-portal`)
3. Wgraj wszystkie pliki tego folderu do repozytorium
4. Wejdź na [vercel.com](https://vercel.com) → zaloguj się przez GitHub
5. Kliknij **"Add New Project"** → wybierz repozytorium `lsi-portal`
6. Vercel automatycznie wykryje React — kliknij **"Deploy"**
7. Po ~1 minucie otrzymasz link np. `lsi-portal.vercel.app`

### Metoda 2 — przez Netlify (drag & drop)

1. Uruchom lokalnie: `npm run build`
2. Wejdź na [netlify.com](https://netlify.com) → zaloguj się
3. Przeciągnij folder `build/` na stronę Netlify
4. Gotowe — otrzymasz link np. `lsi-portal.netlify.app`

## Struktura projektu

```
lsi-portal/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.jsx        ← główny plik aplikacji
├── package.json
├── vercel.json
└── .gitignore
```

## Uwagi

- Aplikacja używa danych mockowych (demo)
- Aby podłączyć prawdziwy backend, należy zastąpić dane w `App.jsx` wywołaniami API
