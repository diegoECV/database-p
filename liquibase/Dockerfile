# Imagen de Liquibase (Community) con soporte para SQL Server (ya incluido en la imagen)
# y para MongoDB (extension liquibase-mongodb + drivers de MongoDB).
FROM docker.io/liquibase/liquibase:4.33.0

ARG LB_MONGO_EXT_VERSION=4.33.0
ARG MONGO_DRIVER_VERSION=4.11.1

ADD --chmod=644 https://repo1.maven.org/maven2/org/liquibase/ext/liquibase-mongodb/${LB_MONGO_EXT_VERSION}/liquibase-mongodb-${LB_MONGO_EXT_VERSION}.jar /liquibase/lib/
ADD --chmod=644 https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/${MONGO_DRIVER_VERSION}/mongodb-driver-sync-${MONGO_DRIVER_VERSION}.jar /liquibase/lib/
ADD --chmod=644 https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/${MONGO_DRIVER_VERSION}/mongodb-driver-core-${MONGO_DRIVER_VERSION}.jar /liquibase/lib/
ADD --chmod=644 https://repo1.maven.org/maven2/org/mongodb/bson/${MONGO_DRIVER_VERSION}/bson-${MONGO_DRIVER_VERSION}.jar /liquibase/lib/
