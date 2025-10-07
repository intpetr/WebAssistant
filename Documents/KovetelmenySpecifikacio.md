# Szoftver Követelményspecifikáció  
**Projekt neve:** Everything In One Website  
**Készítette:** [CSK-7]  
**Dátum:** 2025-09-30

---

## 1. Rövid leírás

A tervezett rendszer egy webalapú alkalmazás, amely egyesíti számos modern digitális életfunkciót egyetlen felületen: naptár, esemény szervező, időjárás megtekintés, személyes napló (írásos és kérdőíves), jegyzetek, dinamikus háttér (holdfázis függvényében), valuta- és tőzsdei információk, hírek, repülőjegy keresés (Skyscanner API), favorit helyek, achievementek, egészség tracker, emlékek funkció, napi meme és napi ima. Az alkalmazás reszponzív, felhasználóbarát, biztonságos és bővíthető.

---

## 2. Jelenlegi helyzet leírása

A felhasználók jelenleg különböző weboldalakat, mobil alkalmazásokat használnak ezekre a funkciókra. Ezek a megoldások széttagoltak, nem mindig reklámmentesek, nem integráltak, és gyakran nehézkes az adatok átvezetése közöttük.

---

## 3. Vágyott rendszer leírása

Olyan böngészőalapú, reklámmentes, egy fiókból elérhető webes alkalmazás, amely egyesíti az összes fenti funkciót, reszponzív és intuitív felületet kínál, lehetőséget ad az adatok mentésére, visszanézésére, és támogatja a külső API integrációkat (pl. Skyscanner, időjárás, tőzsde).

---

## 4. Jelenlegi üzleti folyamat modellje

- Felhasználók több alkalmazást használnak különböző célokra (naptár, jegyzet, időjárás, repülőjegy keresés, stb.)
- Az adatok széttagoltak, nincs egységes felület
- Sok szolgáltatás reklámokkal, bonyolult kezelőfelülettel terhelt

---

## 5. Igényelt üzleti folyamat modellje

- Egyetlen böngészőalapú alkalmazásban minden funkció elérhető
- Az adatok felhasználói fiókhoz kötve menthetők, visszanézhetők
- Külső API-kból automatikusan frissülnek az adatok (időjárás, tőzsde, repülőjegy)
- Az alkalmazás reklámmentes, felhasználóbarát, reszponzív

---

## 6. Funkcionális követelmények (modulonként, táblázatos formában)

| Modul/Funkció            | ID   | Név                       | V.  | Kifejtés                                                                                              |
|--------------------------|------|---------------------------|-----|-------------------------------------------------------------------------------------------------------|
| Rendszer                 | F0 | Böngésző alapú működés    | 0.1 | Modern böngészőben telepítés nélkül, reklámmentesen működik.      
| Felhasználói fiók        | F1   | Bejelentkezés/Regisztráció| 0.1 | Felhasználói fiók létrehozása, bejelentkezés, jelszókezelés.                                          |
| Felhasználói profil      | F2   | Profil szerkesztés        | 0.2 | Felhasználó szerkesztheti profil adatait (név, email, jelszó). Profilkép nem szükséges.               |
| Főoldal                  | F3   | Dashboard                 | 0.2 | Belépés után főoldal, ahol az összes fő funkció elérhető. A felhasználó kiválaszthatja, mit lát rajta.|
| Naptár                   | F4   | Naptár és eseményszervező | 0.3 | Események létrehozása, szerkesztése, törlése, email értesítés az eseményekről, naptárnézet.           |
| Jegyzetek                | F5   | Jegyzetek                 | 0.3 | Saját jegyzetek írása, szerkesztése, törlése, keresése. Megosztás nem szükséges.                      |
| Napló                    | F6   | Napló (írásos, kérdőíves) | 0.3 | Személyes napló írása, nap végi kérdések kitöltése, csak saját részre, visszanézhető.                 |
| Health                   | F7   | Egészség követés          | 0.4 | Alvás mennyiség/minőség, bevitt kalória, ivott víz, mozgás, hangulat rögzítése, visszanézése.         |
| Achievementek            | F8   | Automatikus achievementek | 0.4 | Automatikusan elérhető célok, mérföldkövek, badge-ek a használat/kitöltés alapján.                    |
| Időjárás                 | F9   | Időjárás megtekintés      | 0.4 | Aktuális/előrejelzett időjárás lokáció alapján (API-ból, pl. OpenWeatherMap), főoldalon is megjelenhet|
| Valuta/tőzsde            | F10  | Valuta, tőzsde, hírek     | 0.5 | Valutaárfolyamok, részvények, kripto, általános hírek API-ból. Felhasználó kiválaszthatja kedvenceit. |
| Repülőjegy               | F11  | Repülőjegy keresés        | 0.5 | Skyscanner API-val keresés, felhasználó beállíthat kedvenc helyet, amit a funkcióban használhat.      |
| Háttér                   | F12  | Holdfázis háttér          | 0.6 | Háttérkép automatikus változása holdfázis szerint (Moon Phase API).                                   |
| Memories                 | F13  | Emlékek                   | 0.7 | Napi emlékek (pl. 1 éve ezen a napon rögzített napló/jegyzet/health adat), belépéskor megjelenítve.  |
| Napi meme                | F14  | Napi meme                 | 0.7 | Minden belépéskor megjelenik egy véletlen meme egy API-ból (pl. Meme API vagy Reddit API).            |
| Napi ima                 | F15  | Napi ima                  | 0.7 | Minden belépéskor megjelenik egy napi ima (API vagy előre feltöltött adat).                           |
| Testreszabás             | F16  | Főoldal testreszabása     | 0.8 | Felhasználó beállíthatja, mely modulokat szeretné látni a dashboardon, sorrendet is módosíthatja.     |
| Felhasználói élmény      | F17  | Vágólapra másolás         | 0.8 | Minden fő adat (esemény, jegyzet, napló, valuta, stb.) eredménye egy kattintással vágólapra másolható.|                                    |
| Rendszer                 | F18  | Hibakezelés               | 1.0 | Érvénytelen bemenet esetén figyelmeztető üzenet jelenik meg.                                          |
| Rendszer                 | F19  | Bővíthetőség              | 1.0 | Új modulok/funkciók könnyen hozzáadhatók a rendszerhez.                                               |
| Publikum                 | F20  | Publikus elérés           | 1.0 | Az alkalmazás bárki számára elérhető, nincs hozzáférési korlátozás.                                   |

---

## 7. Nem funkcionális követelmények

- **Biztonság:** Felhasználói adatok védelme, biztonságos adatkezelés.
- **Skálázhatóság:** Több felhasználó párhuzamos használata esetén is gyors működés.
- **Karbantarthatóság:** Kód dokumentálása, moduláris felépítés.
- **Reszponzivitás:** Minden főbb böngészőn és eszközön (mobil, tablet, desktop) működjön.
- **Adatfrissítés:** API-alapú adatok rendszeres frissítése.

---

## 8. Dokumentáció

- Felhasználói kézikönyv (online súgó)
- Fejlesztői dokumentáció (architektúra, API leírások)
- API Swagger dokumentáció

---

## 9. Függőségek, korlátozások

- Külső API-k elérhetősége
- Internetkapcsolat szükséges

---
