package pe.edu.vallegrande.lab;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;
import java.time.Instant;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.bson.Document;

public final class Main {
  record VersionInfo(int contract, String change, String checksum, String release, String gitSha, String appliedAt) {}
  record Probe(boolean up, long latencyMs, String target, String validation, String error) {}

  private static String env(String name) {
    var value = System.getenv(name);
    if (value == null || value.isBlank()) throw new IllegalStateException("Falta " + name);
    return value;
  }
  private static String optionalEnv(String name, String fallback) {
    var value = System.getenv(name); return value == null || value.isBlank() ? fallback : value;
  }
  private static MongoClient mongoClient() {
    var password = URLEncoder.encode(env("MONGO_PASSWORD"), StandardCharsets.UTF_8);
    var uri = "mongodb://%s:%s@%s:27017/%s?authSource=%s".formatted(env("MONGO_USER"), password, env("MONGO_HOST"), env("MONGO_DATABASE"), env("MONGO_AUTH_SOURCE"));
    return MongoClients.create(MongoClientSettings.builder().applyConnectionString(new ConnectionString(uri))
        .applyToSocketSettings(b -> b.connectTimeout(3, TimeUnit.SECONDS).readTimeout(3, TimeUnit.SECONDS))
        .applyToClusterSettings(b -> b.serverSelectionTimeout(3, TimeUnit.SECONDS)).build());
  }
  private static long elapsed(long started) { return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started); }
  private static String safeError(Exception error) {
    var message = error.getMessage();
    return error.getClass().getSimpleName() + (message == null ? "" : ": " + message.replaceAll("[\\r\\n]+", " "));
  }
  private static Probe sqlserverProbe() {
    long started = System.nanoTime();
    try (var connection = DriverManager.getConnection(env("SQL_URL"), env("SQL_USER"), env("SQL_PASSWORD"));
         var statement = connection.prepareStatement("SELECT order_id FROM dbo.ORDERS WHERE order_id = 1")) {
      statement.setQueryTimeout(3);
      try (var result = statement.executeQuery()) { if (!result.next()) throw new IllegalStateException("la semilla no es visible"); }
      return new Probe(true, elapsed(started), env("SQL_URL"), "conexión y lectura de semilla", null);
    } catch (Exception error) { return new Probe(false, elapsed(started), optionalEnv("SQL_URL", "SQLServer"), "conexión y lectura de semilla", safeError(error)); }
  }
  private static Probe mongoProbe() {
    long started = System.nanoTime();
    try (var client = mongoClient()) {
      var found = client.getDatabase(env("MONGO_DATABASE")).getCollection("categories")
          .find(new Document("_id", "CAT-01")).limit(1).first();
      if (found == null) throw new IllegalStateException("la semilla no es visible");
      return new Probe(true, elapsed(started), env("MONGO_HOST") + "/" + env("MONGO_DATABASE"), "conexión y lectura de semilla", null);
    } catch (Exception error) { return new Probe(false, elapsed(started), optionalEnv("MONGO_HOST", "MongoDB"), "conexión y lectura de semilla", safeError(error)); }
  }
  private static VersionInfo sqlserverVersion() throws Exception {
    try (var connection = DriverManager.getConnection(env("SQL_URL"), env("SQL_USER"), env("SQL_PASSWORD"));
         var statement = connection.prepareStatement("SELECT TOP 1 sequence,change_id,checksum,release_version,git_sha,CAST(applied_at AS NVARCHAR(50)) FROM control.schema_change ORDER BY sequence DESC")) {
      statement.setQueryTimeout(3);
      try (var result = statement.executeQuery()) {
        if (!result.next()) throw new IllegalStateException("SQL Server sin historial");
        return new VersionInfo(result.getInt(1), result.getString(2), result.getString(3), result.getString(4), result.getString(5), result.getString(6));
      }
    }
  }
  private static VersionInfo mongoVersion() throws Exception {
    try (var client = mongoClient()) {
      var doc = client.getDatabase(env("MONGO_DATABASE")).getCollection("schema_changes").find().sort(new Document("sequence", -1)).limit(1).first();
      if (doc == null) throw new IllegalStateException("MongoDB sin historial");
      return new VersionInfo(doc.getInteger("sequence"), doc.getString("changeId"), doc.getString("checksum"), doc.getString("releaseVersion"), doc.getString("gitSha"), doc.getDate("appliedAt").toInstant().toString());
    }
  }
  private static boolean aligned(VersionInfo postgres, VersionInfo mongo) {
    var expected = env("EXPECTED_SCHEMA_VERSION");
    boolean requested = expected.equals("latest") || (postgres.contract() == Integer.parseInt(expected) && mongo.contract() == Integer.parseInt(expected));
    return requested && postgres.contract() == mongo.contract() && postgres.release().equals(mongo.release()) && postgres.gitSha().equals(mongo.gitSha());
  }
  private static String versionInfoJson(VersionInfo v) {
    return "{" + field("contract", v.contract()) + "," + field("lastChange", v.change()) + "," + field("checksum", v.checksum()) + "," + field("release", v.release()) + "," + field("gitSha", v.gitSha()) + "," + field("appliedAt", v.appliedAt()) + "}";
  }
  private static String versionJson() throws Exception {
    var sqlserver = sqlserverVersion(); var mongo = mongoVersion();
    return "{\"runningImage\":{" + field("requestedTag", env("IMAGE_REFERENCE")) + "," + field("immutableTag", env("RELEASE_VERSION")) + "," + field("fullGitSha", env("GIT_SHA")) + "," + field("shortGitSha", shortSha(env("GIT_SHA"))) + "}," + field("expectedContract", env("EXPECTED_SCHEMA_VERSION")) + "," + field("aligned", aligned(sqlserver, mongo)) + ",\"engines\":{\"sqlserver\":" + versionInfoJson(sqlserver) + ",\"mongodb\":" + versionInfoJson(mongo) + "}}";
  }
  private static String sqlserverContractJson() throws Exception {
    var columns = new ArrayList<String>(); long rows;
    try (var connection = DriverManager.getConnection(env("SQL_URL"), env("SQL_USER"), env("SQL_PASSWORD"))) {
      try (var statement = connection.prepareStatement("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ORDERS' ORDER BY ordinal_position")) {
        try (var result = statement.executeQuery()) { while (result.next()) columns.add("{" + field("name", result.getString(1)) + "," + field("type", result.getString(2)) + "," + field("nullable", result.getString(3).equals("YES")) + "}"); }
      }
      try (var statement = connection.prepareStatement("SELECT count(*) FROM dbo.ORDERS"); var result = statement.executeQuery()) { result.next(); rows = result.getLong(1); }
    }
    return "{" + field("database", databaseFromJdbc()) + "," + field("schema", "dbo") + "," + field("table", "ORDERS") + ",\"columns\":[" + String.join(",", columns) + "]," + field("records", rows) + "," + field("applicationUser", env("SQL_USER")) + "," + field("access", "read-only") + "}";
  }
  private static String mongoContractJson() throws Exception {
    try (var client = mongoClient()) {
      var database = client.getDatabase(env("MONGO_DATABASE")); var collectionName = "categories";
      var info = database.listCollections().filter(new Document("name", collectionName)).first();
      if (info == null) throw new IllegalStateException("Colección no encontrada");
      return "{" + field("database", env("MONGO_DATABASE")) + "," + field("collection", collectionName) + ",\"documents\":" + database.getCollection(collectionName).countDocuments() + "," + field("applicationUser", env("MONGO_USER")) + "," + field("access", "read-only") + "}";
    }
  }
  private static String samplesJson() throws Exception {
    String sqlserver;
    try (var connection = DriverManager.getConnection(env("SQL_URL"), env("SQL_USER"), env("SQL_PASSWORD")); var statement = connection.prepareStatement("SELECT * FROM dbo.ORDERS WHERE order_id = 1 FOR JSON PATH, WITHOUT_ARRAY_WRAPPER")) {
      try (var result = statement.executeQuery()) { sqlserver = result.next() ? result.getString(1) : "null"; }
    }
    String mongo;
    try (var client = mongoClient()) { var doc = client.getDatabase(env("MONGO_DATABASE")).getCollection("categories").find(new Document("_id", "CAT-01")).first(); mongo = doc == null ? "null" : doc.toJson(); }
    return "{\"sqlserver\":" + sqlserver + ",\"mongodb\":" + mongo + "}";
  }
  private static String databaseFromJdbc() { var url = env("SQL_URL"); return url.substring(url.lastIndexOf('/') + 1); }
  private static String shortSha(String value) { return value.length() <= 8 ? value : value.substring(0, 8); }
  private static String field(String name, String value) { return q(name) + ":" + q(value); }
  private static String field(String name, boolean value) { return q(name) + ":" + value; }
  private static String field(String name, long value) { return q(name) + ":" + value; }
  private static String q(String value) { return value == null ? "null" : "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\""; }
  private static String probeJson(Probe v) { return "{" + field("status", v.up() ? "UP" : "DOWN") + "," + field("latencyMs", v.latencyMs()) + "," + field("target", v.target()) + "," + field("validation", v.validation()) + "," + field("error", v.error()) + "}"; }
  private static void respond(HttpExchange exchange, int status, String type, String body) throws IOException {
    var bytes = body.getBytes(StandardCharsets.UTF_8); exchange.getResponseHeaders().set("Content-Type", type); exchange.getResponseHeaders().set("Cache-Control", "no-store"); exchange.sendResponseHeaders(status, bytes.length); try (var out = exchange.getResponseBody()) { out.write(bytes); }
  }
  private static void route(HttpExchange exchange) throws IOException {
    if (!exchange.getRequestMethod().equals("GET")) { respond(exchange, 405, "application/json", "{\"error\":\"method not allowed\"}"); return; }
    try {
      switch (exchange.getRequestURI().getPath()) {
        case "/", "/health" -> respond(exchange, 200, "application/json", "{" + field("status", "UP") + "," + field("service", "polyglot-persistence-checker") + "," + field("requestedTag", env("IMAGE_REFERENCE")) + "," + field("immutableTag", env("RELEASE_VERSION")) + "," + field("gitSha", shortSha(env("GIT_SHA"))) + "," + field("checkedAt", Instant.now().toString()) + "}");
        case "/connections" -> { var p = sqlserverProbe(); var m = mongoProbe(); boolean up = p.up() && m.up(); respond(exchange, up ? 200 : 503, "application/json", "{" + field("status", up ? "UP" : "DEGRADED") + "," + field("checkedAt", Instant.now().toString()) + ",\"engines\":{\"sqlserver\":" + probeJson(p) + ",\"mongodb\":" + probeJson(m) + "}}"); }
        case "/version" -> respond(exchange, 200, "application/json", versionJson());
        case "/contract" -> { var p = sqlserverVersion(); var m = mongoVersion(); boolean ok = aligned(p, m); respond(exchange, ok ? 200 : 503, "application/json", "{" + field("aligned", ok) + ",\"sqlserver\":" + sqlserverContractJson() + ",\"mongodb\":" + mongoContractJson() + "}"); }
        case "/samples" -> respond(exchange, 200, "application/json", samplesJson());
        case "/diagnostics" -> { var p = sqlserverProbe(); var m = mongoProbe(); var pv = sqlserverVersion(); var mv = mongoVersion(); boolean ok = p.up() && m.up() && aligned(pv, mv); respond(exchange, ok ? 200 : 503, "application/json", "{" + field("status", ok ? "UP" : "DEGRADED") + ",\"connections\":{\"sqlserver\":" + probeJson(p) + ",\"mongodb\":" + probeJson(m) + "},\"version\":" + versionJson() + ",\"contract\":{\"sqlserver\":" + sqlserverContractJson() + ",\"mongodb\":" + mongoContractJson() + "}}"); }
        case "/openapi.json" -> respond(exchange, 200, "application/json", OPENAPI);
        case "/swagger-ui", "/swagger-ui/" -> respond(exchange, 200, "text/html; charset=utf-8", SWAGGER);
        default -> respond(exchange, 404, "application/json", "{\"error\":\"route not found\",\"documentation\":\"/swagger-ui\"}");
      }
    } catch (Exception error) { respond(exchange, 503, "application/json", "{" + field("status", "DOWN") + "," + field("error", safeError(error)) + "," + field("checkedAt", Instant.now().toString()) + "}"); }
  }
  private static final String OPENAPI = """
      {"openapi":"3.0.3","info":{"title":"Polyglot Persistence Checker","version":"1.0","description":"Comprueba conectividad, contrato, trazabilidad y datos equivalentes en PostgreSQL y MongoDB."},"paths":{"/health":{"get":{"summary":"Estado del proceso","responses":{"200":{"description":"Checker activo"}}}},"/connections":{"get":{"summary":"Conectividad real y latencia por motor","responses":{"200":{"description":"Ambos motores responden"},"503":{"description":"Algún motor falló"}}}},"/version":{"get":{"summary":"Versión, Git SHA e historial aplicado","responses":{"200":{"description":"Metadatos de versión"}}}},"/contract":{"get":{"summary":"Estructura efectiva, volumen y permisos","responses":{"200":{"description":"Contratos alineados"},"503":{"description":"Contratos diferentes"}}}},"/samples":{"get":{"summary":"Semilla leída desde ambos motores","responses":{"200":{"description":"Datos de ejemplo"}}}},"/diagnostics":{"get":{"summary":"Diagnóstico consolidado del laboratorio","responses":{"200":{"description":"Laboratorio consistente"},"503":{"description":"Diagnóstico degradado"}}}}}}
      """;
  private static final String SWAGGER = """
      <!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Polyglot Persistence Lab</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true,displayRequestDuration:true,tryItOutEnabled:true});</script></body></html>
      """;
  public static void main(String[] args) throws Exception {
    var server = HttpServer.create(new InetSocketAddress(Integer.parseInt(optionalEnv("PORT", "8080"))), 0); server.createContext("/", Main::route); server.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); server.start(); System.out.println("Checker: /health /connections /version /contract /samples /diagnostics /swagger-ui");
  }
}
