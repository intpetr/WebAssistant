# 2025-11-07 Sprint 5 Zárás & 6 Indítás

**Résztvevők:**  
Juhász Bence, Tóth Áron, Ignát Péter

**Téma:** Ajánló modul tesztjei, Home oldalon API integrációk, tesztelés

---

## Mi ment jól az előző meeting óta?
- Ajánló modul első funkciói működnek, user flow tesztelve.
- API-k válaszideje lecsökkent (scheduled generálás).
- Esemény státuszok frontenden, backend validációval.

---

## Felvetett ötletek / kérdések:
- Home-on dinamikus API card-ok rendering: komponensek vagy templating?
- Ajánló modulban külön user statisztika szükséges-e?
- API várakozási sorok: cache-elés, scheduled endpoint.
- Tesztelés: frontend unittests vagy csak backend tesztek?

---

## Feladatok
- Home API card komponensek készítése.
- Ajánló modul user stat integráció.
- API cache logic tesztelése.

---

## Kapcsolódó commitok
- cb3492: Home API card rendering
- b4ccf2: Dinamikus Home oldal
- 0a298b: Frontend home_data call support
- bd4cff: AI prompt refine

---

## Következő lépések:
- Home minden API integráció 2025-11-14-ig.
- Ajánló modul kiegészítése user statokkal.
