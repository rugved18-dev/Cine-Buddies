# Multi-stage Dockerfile for CineBuddies Spring Boot Backend
# Supports Render deployment from repository root or subfolder

FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom and source from Backend directory
COPY Backend/pom.xml ./pom.xml
COPY Backend/src ./src
RUN mvn clean package -DskipTests

# Run stage with Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

# Dynamically bind to Render's allocated $PORT
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
