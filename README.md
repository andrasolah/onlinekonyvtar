\# Online Könyvtár



Webalkalmazás könyvek böngészésére és kölcsönzésére.



\## Technológiai stack



\- \*\*Backend:\*\* Node.js, Express

\- \*\*Adatbázis:\*\* PostgreSQL, Drizzle ORM

\- \*\*Autentikáció:\*\* JWT

\- \*\*Konténerizáció:\*\* Docker, docker-compose



\## Telepítés és futtatás



\### Előfeltételek

\- Docker Desktop



\### Indítás



```bash

cp .env.example .env

Az azonnali build lehetőségért a .env most része a repositorynak.

tiszta indítás:
docker compose down -v && docker compose up --build

```



Az alkalmazás elérhető: http://localhost:3000



\## Környezeti változók



| Változó | Leírás |

|---|---|

| `DATABASE\_URL` | PostgreSQL kapcsolati string |

| `JWT\_SECRET` | JWT titkos kulcs |

| `PORT` | Szerver portja (alapértelmezett: 3000) |



\## API végpontok



\### Autentikáció



| Metódus | Útvonal | Leírás | Auth |

|---|---|---|---|

| POST | `/api/auth/register` | Regisztráció | Nem |

| POST | `/api/auth/login` | Bejelentkezés | Nem |



\### Könyvek



| Metódus | Útvonal | Leírás | Auth |

|---|---|---|---|

| GET | `/api/books` | Összes könyv listázása | Nem |

| GET | `/api/books/:id` | Könyv részletei | Nem |



\### Kölcsönzések



| Metódus | Útvonal | Leírás | Auth |

|---|---|---|---|

| POST | `/api/loans` | Kölcsönzés indítása | Igen |

| GET | `/api/loans` | Saját kölcsönzések | Igen |

| PATCH | `/api/loans/:id/return` | Saját kölcsönzés visszadása | Igen |



\## Projekt struktúra



```

src/

├── routes/        # Express route-ok

├── controllers/   # Üzleti logika

├── middleware/    # JWT autentikáció

└── db/            # Drizzle ORM konfiguráció és séma

public/            # Statikus frontend fájlok

tests/             # Jest tesztek

init.sql           # Adatbázis séma és seed adatok

```

\## Teszt felhasználók
```
-- Teszt felhasználók
-- user1@example.com / password123
-- user2@example.com / password456
```


\## Validációs és integrációs tesztek
```
docker compose exec app npm test
auth.test.js – validációs teszt. Nem indít valódi HTTP kérést a szerver felé, csak az express-validator validációs logikáját teszteli. Adatbázis-kapcsolat nélkül is lefut.
books.test.js – integrációs teszt. A Supertest HTTP kérést küld az Express app felé, ami csatlakozik az adatbázishoz és visszaadja az adatokat. Futó adatbázis szükséges hozzá.
```

