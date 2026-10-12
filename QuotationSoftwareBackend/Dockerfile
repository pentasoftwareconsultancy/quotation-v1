# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies separately from source so code changes don't re-download the world
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Wildcard copy: do not assume the exact jar filename/version
COPY --from=build /app/target/*.jar app.jar

# Documents the default local port; Render overrides this via the PORT env var,
# which application.properties reads as server.port=${PORT:8080}.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
