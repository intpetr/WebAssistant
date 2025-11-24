# Everything In One Website

## Projekt bemutatása

Az Everything In One Website egy modern, böngészőalapú webalkalmazás, amely integrálja a mindennapi digitális élet legfontosabb funkcióit egyetlen platformon.  
A cél egy reklámmentes, felhasználóbarát, reszponzív és biztonságos rendszer, ahol a felhasználó egyetlen fiókkal hozzáférhet a naptárhoz, eseményszervezőhöz, jegyzetekhez, naplóhoz, egészségkövetéshez, időjáráshoz, tőzsdei és valuta-információkhoz, hírekhez, repülőjegy keresőhöz, emlékekhez, napi meme és ima funkcióhoz, valamint személyre szabott AI ajánlásokhoz és dinamikus műveletgombokhoz.

---

## Fő funkciók

- **Felhasználói fiók, regisztráció, profil szerkesztés**
- **Testreszabható dashboard főoldal**
- **Naptár eseményszervező (email értesítés, naptárnézetek)**
- **Jegyzetek és napló (privát/public, keresés, kategóriák)**
- **Egészségkövetés (alvás, víz, kalória, mozgás, hangulat, badge-ek)**
- **Achievementek (automatikus célok, mérföldkövek)**
- **Időjárás, valuta, tőzsde, hírek (API integráció)**
- **Repülőjegy kereső (Skyscanner, favorit helyek)**
- **Dinamikus háttér (holdfázis alapján)**
- **Napi meme és ima, memories emlékek**
- **Publikus elérés, vendégmód**
- **Vágólap funkció**
- **Hibakezelés, bővíthetőség**
- **Személyre szabott AI ajánlások**
- **Dinamikus, AI által generált műveletgombok**
- **Külső API integráció (okos otthon, egyéni eszközök, prompt engineering támogatás)**

---

## Dokumentáció/követelmények

- Részletes funkcionális specifikáció: [funkcionalis-specifikacio.md]
- Részletes követelményspecifikáció: [kovetelmeny-specifikacio.md]
- Felhasználói és fejlesztői útmutató, rendszerworkflow, ábrák, példák, user storyk.
- Swagger, API leírások, tesztek a `docs/` vagy `backend/docs/` alatt.

---

## AI funkciók

- “Recommendations” modul: A dashboardon minden felhasználónak személyre szabott, rendszeresen frissülő programajánlás (AI a felhasználó naptárából, jegyzeteiből, egészség-, aktivitás-, időjárás-adatokból tanul).
- **Dinamikus AI-gombok:** A dashboardon minden kártyához releváns, hasznos gombokat generál az AI (pl. okos eszköz vezérlés, megosztás, infó), figyelembe véve a felhasználó aktivitását, beállított saját API-kat, és a tartalom kontextusát.
- Külső eszközök illeszthetők az "Apis" menüponton keresztül, prompt engineering támogatással.

---

## Elérhetőségek, feedback

- Publikus elérés: coming soon...
- Dokumentáció: https://github.com/intpetr/WebAssistant/tree/main/Documents
- Kapcsolat, bugreport, fejlesztői kérdések: buvesz@mailbox.unideb.hu

---

## Közreműködők

- Tóth Áron – frontend, UI/UX
- Ignát Péter – backend, API, AI
- Juhász Bence – tesztelés, user research

---


## Telepítés és Beállítás

### 1. Előfeltételek

Győződj meg róla, hogy a Python 3.10+ és a PostgreSQL telepítve van.

Szükséges továbbá az Ollama telepítése és helyi futtatása az MI funkciókhoz (Phi3 modell).

### 2. A Repository Klónozása

Töltsd le a forráskódot a helyi gépedre.

```
git clone <your-repo-url>
cd WebAssistant

```

### 3. Függőségek Telepítése

Navigálj a backend mappába, és telepítsd a szükséges Python csomagokat.

```
cd Backend
pip install flask flask-sqlalchemy flask-login flask-cors psycopg2-binary requests google-genai ollama torch numpy pandas joblib scikit-learn schedule

```

### 4. Adatbázis Konfigurálása

Hozz létre egy `credentials.txt` nevű fájlt a `Backend/` mappában. Illeszd be a PostgreSQL kapcsolati stringedet (csak egy sor legyen):

```
postgresql://felhasznalonev:jelszo@localhost:5432/adatbazisneve

```

### 5. MI Modellek Beállítása

Töltsd le a szükséges modellt a helyi MI asszisztenshez.

```
ollama pull phi3:mini

```

_(Megjegyzés: Az alkalmazás a Google Geminit is használja; győződj meg róla, hogy beállítottál egy érvényes API kulcsot a `main.py` fájlban vagy a környezeti változókban, ha szükséges.)_

### 6. Az Alkalmazás Futtatása

Indítsd el a Flask backend szervert.

```
python main.py

```

A konzolon a `Database initialized successfully` üzenetet kell látnod.

### 7. A Dashboard Elérése

Nyisd meg a webböngésződet, és navigálj ide:

http://localhost:5000





## Licence

MIT / Apache 2.0 / CC BY-NC-SA 4.0
