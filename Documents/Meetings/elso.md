# 2025-10-03 Sprint 1 Indítás

**Résztvevők:**  
Juhász Bence, Tóth Áron, Ignát Péter

**Téma:** Sprint indítása, backend és frontend alapok megbeszélése

---

## Felvetett ötletek / kérdések:
- Hogyan legyen a felhasználói autentikáció nagy skálán? Jelszó hash, session vagy JWT?
- Szükség van-e az első sprintben részletes jogosultságkezelésre vagy elég egy egyszerű login flow?
- Kell-e admin user, vagy mindenki azonos joggal indul?
- A backend Node/Express vagy inkább Python Flask legyen a projekt végére?
- Legyen “dark mode” a Home-hoz már az első sprintben?
- Feature branch nevezés: használjunk-e `frontend/F{szám}` és `backend/F{szám}` formátumot?

---

## Feladatok
- Juhász Bence: Dokumentáció vázlatok, funkcionális specifikáció összeállítása.
- Tóth Áron: Home, Login oldal alapok és CSS indulása.
- Ignát Péter: Backend első setup, API dokumentáció sablon, adatbázis-vázlat.

---

## Fejlesztési workflow / Branching
- A fejlesztés külön feature branch-eken történik.
- Branch elnevezés: `frontend/F{funkció száma}`, illetve `backend/F{funkció száma}`
- Merge protokoll: PR kéréssel, ellenőrzés után megy fel a main/master ágra.

---

## Kapcsolódó commitok
- 7c0694: Home és Login HTML/CSS alapok
- f35716: Login.js DOM konfiguráció
- cec19d: Login.js kész, CSS finomhangolás
- fa7727: Home page CSS javítás

---

## Következő lépések:
- Sprint vége: 2025-10-10.
- Első működő login flow-t integrálni.
- Feltölteni az első backend API sablont.
