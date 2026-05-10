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

docker compose up --build

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

