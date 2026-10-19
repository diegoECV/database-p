# Cliente de preparación; no inicia mongod.
ARG MONGO_IMAGE=mongo:7.0
FROM ${MONGO_IMAGE}

ARG RELEASE_VERSION=development
ARG GIT_SHA=unknown

ENV RELEASE_VERSION=$RELEASE_VERSION GIT_SHA=$GIT_SHA

LABEL org.opencontainers.image.title="Visons Persistence MongoDB Runner" \
      org.opencontainers.image.version="$RELEASE_VERSION" \
      org.opencontainers.image.revision="$GIT_SHA"

WORKDIR /lab
COPY --chown=mongodb:mongodb . /lab/

USER mongodb
ENTRYPOINT ["/bin/sh", "/lab/run.sh"]
CMD ["reconcile"]
