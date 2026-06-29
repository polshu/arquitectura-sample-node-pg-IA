# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Educational REST API (DAI course, ORT) with a layered architecture. CRUD for `alumnos` and `cursos` against PostgreSQL. Written in Spanish.

This is a teaching project — the author is a professor and students are learning Node.js and database access. Code is intentionally verbose and self-explanatory, with comments added to aid comprehension. Do not remove comments or simplify pedagogical patterns.

## Commands

```bash
npm install              # install dependencies
npm run server           # run the layered API (the only version)
```

The `server` script uses `node --watch` for auto-reload on save. No test runner or linter is configured.

## Setup

1. PostgreSQL must be running locally.
2. Run `documents/database/script-postgress.sql` to create tables (`cursos`, `alumnos`) and seed data.
3. Copy `.env-template` to `.env` and fill in your DB credentials and log path.
4. `src/configs/db-config.js` reads credentials from `process.env` (the `.env` file). Switch between local PostgreSQL and Supabase by editing a single line — `DB_TARGET` (`"local"` or `"supabase"`); both credential sets (`DB_LOCAL_*` / `DB_SUPABASE_*`) live in `.env`, and SSL is enabled automatically for Supabase.

## Architecture

ESM modules throughout (`"type": "module"` in package.json). Express 5.

```
server.js → mounts controllers as routers
  controller (Express Router) → HTTP concerns only, delegates to service
    service → business logic (e.g. calcularEdad, validarCursoExiste), delegates to repository
      repository → SQL via the DbPg helper (db-pg.js)
        db-pg.js → wraps the pg Pool
```

- **Controllers** export an Express `Router`, mounted at `/api/alumnos` and `/api/cursos`.
- **Services** are instantiated once per controller. `AlumnosService` depends on `CursosService` for FK validation.
- **Repositories** (`*-repository.js`) hold a `DbPg` instance and run SQL through it rather than touching a `Pool` directly. (Their internal `console.log` strings still say `-new`, a leftover from when the helper-based version was introduced alongside the original.)
- **Entities** (`Alumno`, `Curso`) are plain classes used to construct objects from code (see `/api/alumnos/test-insert`).
- **LogHelper** is a singleton that logs errors to file and/or console based on `.env` settings.

## Database helper (`db-pg.js`)

`DbPg` exposes a 4-method interface (`queryAll`, `queryOne`, `queryReturnId`, `queryRowCount`) over the pg `Pool`, lazy-initialized from `db-config.js`. The repositories use this helper instead of raw Pool access.

## Key conventions

- Status codes use `http-status-codes` constants (`StatusCodes.OK`, `StatusCodes.CREATED`, etc.), not raw numbers.
- SQL uses positional parameters (`$1, $2, ...`).
- Repositories return `null` on not-found / error (no exceptions). Services throw on business rule violations.
- Code is intentionally verbose and self-explanatory, with teaching comments. Do not remove comments or simplify pedagogical patterns.
