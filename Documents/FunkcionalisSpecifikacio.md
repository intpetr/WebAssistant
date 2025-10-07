# Everything In One Website  
## Funkcionális specifikáció

---

### 1. A rendszer céljai és nem céljai

**Célok:**  
- Egyetlen webes alkalmazásban egyesíteni a modern mindennapi digitális funkciókat: naptár, eseményszervezés, napló, jegyzetek, időjárás, tőzsde, hírek, repülőjegy keresés, egészségkövetés, achievementek, emlékek, napi meme és ima, testreszabható főoldal.
- Felhasználóbarát, reszponzív, reklámmentes, biztonságos felület biztosítása bárki számára.

**Nem célok:**  
- Adminisztrációs felület, többszintű jogosultság.
- Saját képek feltöltése, megosztás, privát üzenetküldés.
- Komplex tudományos kalkulációk, pénzügyi műveletek lebonyolítása.
- Mobil applikáció fejlesztése (csak böngészőalapú webapp).

---

### 2. Jelenlegi helyzet leírása

A felhasználók jelenleg több különböző alkalmazást, weboldalt használnak: naptárhoz, jegyzetekhez, időjáráshoz, tőzsdei hírekhez, egészségkövetéshez stb. Ezek nem integráltak, gyakran reklámokkal terheltek, nehézkes az adatok átvezetése, a felhasználói élmény széttagolt.

---

### 3. Vágyott rendszer leírása

Az Everything In One Website célja, hogy mindezeket a funkciókat egyetlen, egységes, letisztult webes felületen kínálja, ahol a felhasználó egy fiókkal, reklámmentesen, személyre szabható módon használhatja a mindennapi digitális eszközeit.

---

### 4. Külső megszorítások, szabványok

- GDPR: felhasználói adatok védelme, adatkezelési tájékoztató.
- Böngésző kompatibilitás: Chrome, Firefox, Edge, Safari.
- Külső API-k elérhetősége (időjárás, tőzsde, Skyscanner, Moon Phase, Meme, News).
- Internetkapcsolat szükséges.

---

### 5. Jelenlegi és igényelt üzleti folyamatok

**Jelenlegi:**  
- Több különálló app, weboldal, széttagolt adatok, reklámok, bonyolult kezelőfelületek.

**Igényelt:**  
- Egyetlen böngészőalapú, fiókhoz kötött, reklámmentes, testreszabható, integrált rendszer.

---

### 6. Követelménylista  
(Hivatkozás: [Everything In One Funkcionális Követelmények](everything-in-one-funkcionalis-kovetelmenyek.md))

---

### 7. Használati esetek

#### 7.1. Szereplők (aktorok)

| Szereplő           | Leírás                                                                |
|--------------------|-----------------------------------------------------------------------|
| Felhasználó        | Az alkalmazás minden funkcióját használó személy.                     |
| Külső API-k        | Időjárás, tőzsde, repülőjegy, holdfázis, meme, hírek szolgáltatók.    |

#### 7.2. Használati esetek felsorolása

| Használati eset azonosító | Név                          | Aktor      | Rövid leírás                                                         |
|--------------------------|-------------------------------|------------|----------------------------------------------------------------------|
| UC1                      | Bejelentkezés/Regisztráció    | Felhasználó| Fiók létrehozása vagy belépés.                                       |
| UC2                      | Profil szerkesztése            | Felhasználó| Felhasználói adatok módosítása.                                      |
| UC3                      | Főoldal testreszabása          | Felhasználó| Beállíthatja, mely modulok jelenjenek meg a dashboardon.             |
| UC4                      | Naptár használata              | Felhasználó| Események létrehozása, szerkesztése, törlése, email értesítés.        |
| UC5                      | Jegyzetek kezelése             | Felhasználó| Jegyzetek írása, szerkesztése, törlése, keresése.                    |
| UC6                      | Napló írása/kérdőív kitöltése  | Felhasználó| Személyes napló írása, napi kérdések kitöltése.                      |
| UC7                      | Egészség adatok rögzítése      | Felhasználó| Alvás, kalória, víz, mozgás, hangulat naplózása.                     |
| UC8                      | Achievementek elérése          | Felhasználó| Automatikusan elérhető célok, badge-ek megtekintése.                 |
| UC9                      | Időjárás megtekintése          | Felhasználó| Aktuális/előrejelzett időjárás lekérdezése.                          |
| UC10                     | Valuta/tőzsde/hírek olvasása   | Felhasználó| Piaci információk, hírek megtekintése.                               |
| UC11                     | Repülőjegy keresés, kedvenc hely| Felhasználó| Repülőjegy keresése, kedvenc hely beállítása.                        |
| UC12                     | Holdfázis háttér megjelenítése | Felhasználó| Háttérkép módosítása holdfázis szerint.                              |
| UC13                     | Emlékek megtekintése           | Felhasználó| Napi emlékek megtekintése belépéskor.                                |
| UC14                     | Napi meme megtekintése         | Felhasználó| Belépéskor egy véletlen meme jelenik meg.                            |
| UC15                     | Napi ima megtekintése          | Felhasználó| Belépéskor napi ima jelenik meg.                                     |
| UC16                     | Adatok vágólapra másolása      | Felhasználó| Adatok egy kattintással vágólapra másolhatók.                        |

#### 7.3. Használati esetek leírása (példák)

**UC4 – Naptár használata**  
*Leírás:*  
Kiss Géza, a naptárfüggő egyetemista, belép az Everything In One Website-ra. A főoldalon rábök a "Naptár" menüpontra, ahol új eseményt hoz létre: "Szakdolgozat beadás". Beállítja az esemény dátumát, leírását, majd menti. A rendszer automatikusan email értesítést küld neki az esemény előtt egy nappal. Géza boldog, mert nem marad le semmiről.

*Előfeltétel:* Géza belépett a fiókjába.  
*Utófeltétel:* A naptárban új esemény jelenik meg, e-mail értesítés beállítva.

**UC7 – Egészség adatok rögzítése**  
*Leírás:*  
Futós Kata, a sportos felhasználó, minden este rögzíti az aznapi alvás idejét, minőségét, elfogyasztott kalóriát, ivott vizet, megtett lépésszámot és a hangulatát. A rendszer automatikusan badge-eket ad neki, ha például 7 napig minden nap rögzít, vagy eléri a napi célokat.

*Előfeltétel:* Kata belépett a fiókjába.  
*Utófeltétel:* Új egészségadat jelenik meg, achievement frissül.

**UC11 – Repülőjegy keresés, kedvenc hely beállítása**  
*Leírás:*  
Utazó Pista, a világjáró, belép és a repülőjegy keresőben a kedvenc helyét állítja be: "Tokió". A rendszer a Skyscanner API-n keresztül megmutatja a legolcsóbb jegyeket Tokióba.

*Előfeltétel:* Pista belépett a fiókjába.  
*Utófeltétel:* Kedvenc hely beállítva, jegyajánlatok megjelennek.

---

### 8. Megfeleltetés: Funkció – követelmény

| Funkció                   | Követelmény azonosító |
|---------------------------|----------------------|
| Bejelentkezés/Regisztráció| F1                   |
| Profil szerkesztés        | F2                   |
| Főoldal testreszabás      | F3, F16              |
| Naptár használata         | F4                   |
| Jegyzetek kezelése        | F5                   |
| Napló írása/kérdőív kitölt.| F6                   |
| Egészség követés          | F7                   |
| Achievementek             | F8                   |
| Időjárás                  | F9                   |
| Valuta/tőzsde/hírek       | F10                  |
| Repülőjegy keresés        | F11                  |
| Holdfázis háttér          | F12                  |
| Emlékek                   | F13                  |
| Napi meme                 | F14                  |
| Napi ima                  | F15                  |
| Vágólapra másolás         | F17                  |
| Böngésző alapú működés    | F18                  |
| Hibakezelés               | F19                  |
| Bővíthetőség              | F20                  |
| Publikus elérés           | F21                  |

---

### 9. Képernyő tervek  
*(Vázlatosan, a fő képernyők felsorolása)*

- **Belépési/Regisztrációs képernyő:** email, jelszó, regisztráció, jelszóemlékeztető
- **Profil képernyő:** név, email szerkesztése, kilépés
- **Főoldal/dashboard:** testreszabható modulok (naptár, időjárás, jegyzetek, health, meme, ima, tőzsde stb.)
- **Naptár:** havi/heti/napos nézet, esemény hozzáadása/szerkesztése/törlése
- **Jegyzetek, napló, health:** egyszerű lista, szerkesztés, új hozzáadása
- **Repülőjegy kereső:** Skyscanner integráció, kedvenc helyek beállítása
- **Memories:** automatikusan megjelenő napi emlékek
- **Meme/ima:** belépéskor felugró ablak vagy dashboard widget

---

### 10. Forgatókönyvek

**Forgatókönyv 1 – Napi digitális rutin:**  
Reggel belépek az Everything In One Website-ra. A főoldalon rögtön látom az aktuális időjárást, a naptárban a mai eseményeimet, és egy vicces meme-t, hogy jól induljon a nap. Rögzítem, mennyit aludtam, hány pohár vizet ittam, majd megnézem, mennyit mozgott tegnap. Ha utazni akarok, megnézem a repjegy keresőt, beállítom kedvenc célpontomat. Nap végén kitöltöm a naplót, elolvasom a napi imát, majd jegyzetet írok holnapra.

**Forgatókönyv 2 – Esemény szervezés:**  
Az egyetemi vizsgaidőszakban eseményt hozok létre a naptárban. A rendszer automatikusan emailt küld az esemény előtt. Készítek egy jegyzetet a vizsgára, és rögzítem az egészség adataimat (hány órát aludtam, mit ettem, mennyit mozogtam).

**Forgatókönyv 3 – Motivációs nap:**  
Belépéskor egy inspiráló meme és ima jelenik meg. Rögzítem a hangulatomat és megnézem, van-e új achievement, majd visszanézem, mit csináltam egy éve ezen a napon.

---

### 11. Fogalomszótár

| Fogalom        | Leírás                                              |
|----------------|-----------------------------------------------------|
| Dashboard      | Főoldal, modulokat tartalmazó áttekintő képernyő    |
| Achievement    | Célok, mérföldkövek, automatikusan elérhető badge-ek|
| Widget         | Különálló, testreszabható modul a dashboardon       |
| API            | Külső szolgáltatás (időjárás, tőzsde, meme stb.)    |
| Health         | Egészséggel kapcsolatos adatok (alvás, kalória stb.)|
| Memories       | Automatikus napi emlékek, múltbeli adatok visszanézése|
| Naptár         | Események időalapú kezelése                         |

---

