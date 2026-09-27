# Compilación y ejecución separadas; no requiere Java/Maven en el anfitrión.
FROM maven:3.9.16-eclipse-temurin-25-noble AS build
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre-noble
ARG RELEASE_VERSION=development
ARG GIT_SHA=unknown
ENV RELEASE_VERSION=$RELEASE_VERSION GIT_SHA=$GIT_SHA
LABEL org.opencontainers.image.title="Polyglot Persistence Checker" \
      org.opencontainers.image.version="$RELEASE_VERSION" \
      org.opencontainers.image.revision="$GIT_SHA" \
      org.opencontainers.image.source="https://github.com/diegoECV/database-p"
WORKDIR /app
COPY --from=build --chown=10001:10001 /src/target/check.jar /app/check.jar
USER 10001:10001
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "/app/check.jar"]
