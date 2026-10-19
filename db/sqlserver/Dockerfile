# Cliente de preparación SQL Server
ARG SQL_IMAGE=mcr.microsoft.com/mssql-tools
FROM ${SQL_IMAGE}

ARG RELEASE_VERSION=development
ARG GIT_SHA=unknown

ENV RELEASE_VERSION=$RELEASE_VERSION GIT_SHA=$GIT_SHA

LABEL org.opencontainers.image.title="Visons Persistence SQL Runner" \
      org.opencontainers.image.version="$RELEASE_VERSION" \
      org.opencontainers.image.revision="$GIT_SHA"

WORKDIR /lab
COPY . /lab/

ENTRYPOINT ["/bin/sh", "/lab/run.sh"]
CMD ["reconcile"]
