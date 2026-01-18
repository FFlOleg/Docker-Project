# Task Manager

## Temat projektu
Webowa aplikacja typu Task Manager umożliwiająca zarządzanie użytkownikami oraz zadaniami.
Projekt składa się z backendu (Node.js + Express), bazy danych PostgreSQL oraz frontendu HTML/CSS/JavaScript.
Całość uruchamiana jest przy użyciu Docker Compose.

## Autorzy
- Oleh Fliak - numer indeksu: 52985

## Uruchomienie projektu:

### Wymagania
- Docker
- Docker Compose

### Instrukcja
1. Sklonować repozytorium
2. W katalogu projektu wykonać:
docker compose up --build

Po uruchomieniu:
- Aplikacja dostępna jest pod adresem: http://localhost:3000
- Adminer (zarządzanie bazą danych): http://localhost:8080

Nie są wymagane żadne dodatkowe kroki konfiguracyjne - docker compose up uruchamia całość automatycznie.
