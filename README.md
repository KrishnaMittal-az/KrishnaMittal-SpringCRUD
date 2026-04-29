# ⚡ StudentHub — Student Registry API

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JDBC](https://img.shields.io/badge/JDBC-Raw_SQL-FF6B35?style=for-the-badge&logo=databricks&logoColor=white)
![REST](https://img.shields.io/badge/REST-API-02569B?style=for-the-badge&logo=swagger&logoColor=white)

**A full-stack Spring Boot application for managing student records.**
Raw JDBC. No ORM. No magic. Just clean, layered architecture doing exactly what it should.

[Live UI](#-frontend) · [API Docs](#-rest-api-reference) · [Setup](#-getting-started) · [Architecture](#-architecture)

</div>

---

## 🗂 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [REST API Reference](#-rest-api-reference)
- [Frontend](#-frontend)
- [Configuration](#-configuration)

---

## 🎯 Overview

StudentHub is a **Spring Boot 3** application that exposes a RESTful API for full CRUD management of student records, backed by **PostgreSQL 16** using **raw JdbcTemplate** — no Hibernate, no Spring Data JPA, no annotation magic. Every SQL statement is hand-written and intentional.

The project is built around a strict **three-layer architecture**:

```
HTTP  →  Controller  →  Service  →  Repository  →  PostgreSQL
```

A modern **light-mode frontend** (HTML/CSS/JS, served as Spring Boot static assets) sits on top of the API, providing a live student directory with search, inline editing, and real-time metrics.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Full CRUD** | Create, read, update, delete student records |
| **JdbcTemplate** | Raw SQL queries — no ORM, no magic |
| **Layered Architecture** | Controller → Service → Repository, each with an interface |
| **Auto Schema Init** | `schema.sql` runs on startup via `spring.sql.init.mode=always` |
| **Auto-increment PK** | PostgreSQL `SERIAL` with `KeyHolder` + `RETURN_GENERATED_KEYS` |
| **404 Handling** | `@RestControllerAdvice` maps not-found exceptions to proper HTTP 404 |
| **Modern Frontend** | Served from `src/main/resources/static/` — no separate build step |
| **Live Metrics** | Student count, visible count, unique course count update in real time |
| **Search** | Instant client-side filter across name, email, and course |
| **Responsive UI** | Works on desktop and mobile |

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.3.4 | Application framework |
| Spring Web | — | REST controllers, embedded Tomcat |
| Spring JDBC | — | `JdbcTemplate`, `KeyHolder`, `RowMapper` |
| PostgreSQL JDBC Driver | 42.7.4 | Database connectivity |
| HikariCP | (bundled) | Connection pooling |
| Maven | 3.9.6 | Build tool |

### Database
| Technology | Version | Role |
|---|---|---|
| PostgreSQL | 16 | Primary datastore |

### Frontend
| Technology | Role |
|---|---|
| Vanilla HTML5 | Structure |
| CSS3 (custom, no framework) | Styling — light glassmorphic theme, grid layout, animations |
| Vanilla JavaScript (ES2022) | API calls, DOM rendering, state, search, form validation |
| Plus Jakarta Sans + Fraunces | Typography (Google Fonts) |

---

## 📁 Project Structure

```
web-mid/
├── pom.xml                                         # Maven build config
└── src/
    ├── main/
    │   ├── java/com/example/studentapi/
    │   │   ├── StudentApiApplication.java           # @SpringBootApplication entry point
    │   │   │
    │   │   ├── model/
    │   │   │   └── Student.java                    # Plain POJO — id, name, email, course
    │   │   │
    │   │   ├── repository/
    │   │   │   ├── StudentRepository.java           # Interface
    │   │   │   └── StudentRepositoryImpl.java       # JdbcTemplate implementation
    │   │   │
    │   │   ├── service/
    │   │   │   ├── StudentService.java              # Interface
    │   │   │   └── StudentServiceImpl.java          # Business logic + not-found guards
    │   │   │
    │   │   ├── controller/
    │   │   │   └── StudentController.java           # REST endpoints
    │   │   │
    │   │   └── exception/
    │   │       └── GlobalExceptionHandler.java      # @RestControllerAdvice → 404 JSON
    │   │
    │   └── resources/
    │       ├── application.properties               # DB config, port, schema init
    │       ├── schema.sql                           # CREATE TABLE IF NOT EXISTS students
    │       └── static/
    │           ├── index.html                       # SPA shell
    │           ├── style.css                        # Full custom stylesheet
    │           └── app.js                           # All frontend logic
    │
    └── test/
        └── java/com/example/studentapi/
            └── StudentApiApplicationTests.java      # Context load test
```

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        HTTP Client                         │
│              (Browser UI  /  curl  /  Postman)             │
└──────────────────────────┬─────────────────────────────────┘
                           │  HTTP Requests
┌──────────────────────────▼─────────────────────────────────┐
│               StudentController  (@RestController)          │
│  POST /students  GET /students  GET /students/{id}          │
│  PUT  /students/{id}            DELETE /students/{id}       │
└──────────────────────────┬─────────────────────────────────┘
                           │  Method calls
┌──────────────────────────▼─────────────────────────────────┐
│               StudentServiceImpl  (@Service)                │
│  Business logic: existence checks, throws RuntimeException  │
│  when a student is not found (→ caught by GlobalHandler)    │
└──────────────────────────┬─────────────────────────────────┘
                           │  Method calls
┌──────────────────────────▼─────────────────────────────────┐
│            StudentRepositoryImpl  (@Repository)             │
│  Hand-written SQL via JdbcTemplate:                         │
│  · INSERT … RETURN_GENERATED_KEYS  (KeyHolder)              │
│  · SELECT *  (RowMapper<Student>)                           │
│  · UPDATE / DELETE  (jdbc.update varargs)                   │
│  · COUNT(*)  (jdbc.queryForObject)                          │
└──────────────────────────┬─────────────────────────────────┘
                           │  JDBC / HikariCP
┌──────────────────────────▼─────────────────────────────────┐
│                     PostgreSQL 16                           │
│                  Database: studentdb                        │
│                   Table: students                           │
└────────────────────────────────────────────────────────────┘
```

**Error flow:**
```
Repository throws  →  Service catches / re-throws RuntimeException
         ↓
GlobalExceptionHandler (@RestControllerAdvice)
         ↓
404 Not Found  +  { "error": "Student not found with id: X" }
```

---

## 🗄 Database Schema

```sql
CREATE TABLE IF NOT EXISTS students (
    id     SERIAL       PRIMARY KEY,   -- auto-increment, DB-generated
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL
);
```

- `SERIAL` — PostgreSQL auto-increment; the application never inserts an `id` value
- `UNIQUE` on `email` — prevents duplicate registrations
- `IF NOT EXISTS` — schema script is idempotent; safe to run on every startup

The table is created automatically on startup by placing `schema.sql` in `src/main/resources/` and setting `spring.sql.init.mode=always` in `application.properties`.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Java (JDK) | 17+ |
| Maven | 3.6+ |
| PostgreSQL | 13+ |

### 1 — Create the database

```bash
# Connect as the postgres superuser
psql -U postgres

# Inside psql:
CREATE DATABASE studentdb;
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

> The `students` table is created automatically on first startup — you don't need to run any DDL manually.

### 2 — Configure connection (if needed)

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/studentdb
spring.datasource.username=postgres
spring.datasource.password=postgres
server.port=8080
```

### 3 — Build

```bash
mvn clean package -DskipTests
```

### 4 — Run

```bash
# Option A: fat jar
java -jar target/student-api-0.0.1-SNAPSHOT.jar

# Option B: Maven plugin
mvn spring-boot:run
```

### 5 — Open

| Resource | URL |
|---|---|
| Frontend UI | http://localhost:8080 |
| REST API base | http://localhost:8080/students |

---

## 📡 REST API Reference

Base URL: `http://localhost:8080`

All request/response bodies are `application/json`.

---

### Create a student

```http
POST /students
```

**Request body**
```json
{
  "name":   "Alice Johnson",
  "email":  "alice@example.com",
  "course": "Computer Science"
}
```

**Response — `201 Created`**
```json
{
  "id":     1,
  "name":   "Alice Johnson",
  "email":  "alice@example.com",
  "course": "Computer Science"
}
```

---

### Get all students

```http
GET /students
```

**Response — `200 OK`**
```json
[
  { "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "course": "Computer Science" },
  { "id": 2, "name": "Bob Smith",     "email": "bob@example.com",   "course": "Physics" }
]
```

---

### Get student by ID

```http
GET /students/{id}
```

**Response — `200 OK`**
```json
{ "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "course": "Computer Science" }
```

**Response — `404 Not Found`**
```json
{ "error": "Student not found with id: 99" }
```

---

### Update a student

```http
PUT /students/{id}
```

**Request body**
```json
{
  "name":   "Alice Smith",
  "email":  "alice.smith@example.com",
  "course": "Data Science"
}
```

**Response — `200 OK`**
```json
{ "id": 1, "name": "Alice Smith", "email": "alice.smith@example.com", "course": "Data Science" }
```

---

### Delete a student

```http
DELETE /students/{id}
```

**Response — `204 No Content`** *(empty body)*

**Response — `404 Not Found`** *(if id doesn't exist)*
```json
{ "error": "Student not found with id: 99" }
```

---

### Quick curl cheatsheet

```bash
BASE=http://localhost:8080

# Create
curl -X POST $BASE/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","course":"Mathematics"}'

# Read all
curl $BASE/students

# Read one
curl $BASE/students/1

# Update
curl -X PUT $BASE/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice.s@example.com","course":"Physics"}'

# Delete
curl -X DELETE $BASE/students/1
```

---

## 🖥 Frontend

The UI is served as static files from `src/main/resources/static/` — no Node.js, no build pipeline. Spring Boot serves them automatically at `/`.

### What's inside

```
static/
├── index.html   # App shell — header, hero, metrics, table, modals
├── style.css    # ~550 lines — light glassmorphic theme, responsive grid
└── app.js       # ~260 lines — fetch, render, search, form validation, toasts
```

### UI features at a glance

- **Hero section** with live stat cards: total students, currently visible, unique courses
- **Instant search** — filters across name, email, and course as you type; metric cards update in sync
- **Add/Edit modal** — spring animation, per-field inline validation, loading state on submit
- **Delete confirmation** — named confirmation dialog before any destructive action
- **Shimmer skeleton** — placeholder rows while data loads
- **Toast notifications** — success / error / info, auto-dismiss after 3.2 s
- **Row entrance animation** — each row slides in on render
- **Fully responsive** — email column collapses on narrow screens

---

## ⚙️ Configuration

All configuration lives in `src/main/resources/application.properties`.

| Property | Default | Description |
|---|---|---|
| `server.port` | `8081` | Embedded Tomcat port |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5433/studentdb` | JDBC connection string |
| `spring.datasource.username` | `postgres` | DB username |
| `spring.datasource.password` | `postgres` | DB password |
| `spring.datasource.hikari.maximum-pool-size` | `10` | HikariCP max connections |
| `spring.datasource.hikari.connection-timeout` | `30000` | Connection timeout (ms) |
| `spring.sql.init.mode` | `always` | Run `schema.sql` on every startup |
| `logging.level.org.springframework.jdbc.core` | `DEBUG` | Log every SQL statement |

---

## 🔑 Key Implementation Notes

**Why `new String[]{"id"}` instead of `Statement.RETURN_GENERATED_KEYS`?**
PostgreSQL's generic `RETURN_GENERATED_KEYS` returns *all* columns, causing `KeyHolder.getKey()` to throw. Passing `new String[]{"id"}` tells the driver to return only the `id` column, so `getKey()` works correctly.

**Why `jdbc.query()` instead of `queryForObject()` for `findById`?**
`queryForObject` throws `EmptyResultDataAccessException` when zero rows match — an exception for a completely normal case. Using `jdbc.query()` and checking `isEmpty()` returns a clean `Optional.empty()` instead.

**Why interfaces for both Service and Repository?**
Constructor-injecting the interface (not the implementation) decouples layers cleanly and makes unit testing trivial — mock the interface, test the layer above it in isolation.

---

<div align="center">
  Built with Spring Boot · PostgreSQL · JDBC · Vanilla JS
</div>
# KrishnaMittal-SpringCRUD
