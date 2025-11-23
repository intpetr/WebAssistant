# 2025-10-31 Sprint 4 Zárás & 5 Indítás

**Résztvevők:**  
Juhász Bence, Tóth Áron, Ignát Péter

**Téma:** Naptár, notes, settings teljes körű integráció

---

## Mi ment jól az előző meeting óta?
- Calendar events szerkesztése/törlése működik.
- Settings oldal API-hívások integrálva.
- Minden CRUD és validáció együtt fut és tesztelhető.

---

## Felvetett ötletek / kérdések:
- Dashboard-ba beépíthető-e egy ajánló (recommendation) modul?
- Hogyan kezeljük az ütközéseket feature branch-ek összevonásánál?
- Események státusz bővítése: esemény típusok, all-day event, reminders.
- Backend logolás – szükség van külön error loggerre?

---

## Feladatok
- Ajánló modul frontend kiépítése (cards, AI, stat-ok).
- Backend stub ajánló API-hoz.
- Integrált tesztek indítása.

---

## Kapcsolódó commitok
- a99128: Calendar API, UI bugfixek
- bb3d1f: Notes API, UI fix
- 5bd19c: SLM recommend endpoint, neural net predikt API
- 202b44: Scheduled recommendation generation

---

## Következő lépések:
- Ajánló modul MVP 2025-11-07-ig.
- Esemény státusz bővítése: all-day, reminders.
