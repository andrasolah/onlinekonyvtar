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
1, Docker indítása
	docker compose down -v && docker compose up --build

2,Böngészőben
	http://localhost:3000

3, belépés
	user1@example.com / password123
	user2@example.com / password456


Az azonnali build lehetőségért a .env most része a repositorynak.

```



\## Környezeti változók



| Változó | Leírás |

|---|---|

| `DATABASE\_URL` | PostgreSQL kapcsolati string |

| `JWT\_SECRET` | JWT titkos kulcs |

| `PORT` | Szerver portja (alapértelmezett: 3000) |



## API dokumentációk

```

http://localhost:3000/api-docs

```



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


\## Validációs és integrációs tesztek
```
docker compose exec app npm test
auth.test.js – validációs teszt. Nem indít valódi HTTP kérést a szerver felé, csak az express-validator validációs logikáját teszteli. Adatbázis-kapcsolat nélkül is lefut.
books.test.js – integrációs teszt. A Supertest HTTP kérést küld az Express app felé, ami csatlakozik az adatbázishoz és visszaadja az adatokat. Futó adatbázis szükséges hozzá.
```

