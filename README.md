# Einmaleins-Abenteuer / Times Table Adventure

Einmaleins-Abenteuer is a playful multiplication game for kids learning the
2 to 12 times tables. It is designed for parents and teachers who want a simple,
friendly way to help children practice multiplication, build confidence, and
stay motivated with short game rounds.

The app is currently in German and includes a quick quiz, memory matching,
a rocket race with timer and best time, coin rewards, stars, and small sound
effects for correct answers.

## Deutsch

Einmaleins-Abenteuer hilft Kindern beim Einmaleins lernen. Die Anwendung eignet
sich fuer Eltern, Lehrkraefte und Kinder ab etwa Klasse 2, die das kleine
Einmaleins spielerisch ueben moechten.

Kinder koennen:

- Aufgaben aus der 2er- bis 12er-Reihe ueben
- gemischte Einmaleins-Aufgaben loesen
- im Memory passende Aufgaben und Ergebnisse finden
- im Raketenrennen schneller werden
- Muenzen und Sterne fuer richtige Antworten sammeln
- ihre beste Raketenzeit verbessern

## English

Times Table Adventure helps children practice multiplication tables through
short, game-like activities. It is useful for parents looking for a kids math
game, multiplication practice app, times table game, or grade 2 math learning
tool.

Children can practice:

- 2 to 12 multiplication tables
- mixed times table questions
- memory matching between questions and answers
- rocket race speed practice
- coin and star rewards for correct answers
- best-time improvement in the rocket race

## Features

- German user interface
- Quick multiplication quiz
- Memory matching game
- Rocket race with timer and best record
- Coin rewards with sound effect
- Stars score
- Reset and restart button
- Kid-friendly game visuals
- Runs locally as a Spring Boot web app

## Search Phrases

This project is relevant for parents and teachers searching for:

- Einmaleins lernen
- Einmaleins Spiel fuer Kinder
- Einmaleins ueben Klasse 2
- Mathe Spiel fuer Kinder
- multiplication table practice for kids
- times table game
- learn multiplication tables
- multiplication game for kids
- grade 2 math game

## Run Locally

Requirements:

- Java 17

Start the app:

```bash
./mvnw spring-boot:run
```

Open:

```text
http://localhost:8080
```

If port 8080 is already in use:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

Then open:

```text
http://localhost:8081
```

## Test

```bash
./mvnw test
```

## Privacy

The project does not require user accounts. It stores the rocket best time in
the browser with `localStorage`.

## Suggested GitHub Topics

Add these topics in the GitHub repository settings so parents, teachers, and
developers can find the project more easily:

```text
multiplication
times-tables
einmaleins
kids-learning
math-game
education
learning-game
spring-boot
german
children
```

## License

MIT License. See [LICENSE](LICENSE).
