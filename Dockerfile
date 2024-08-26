FROM ubuntu:20.04

ENV PATH=/app/bin:$PATH \
    DEBIAN_FRONTEND=noninteractive \
    NODEJS_REL=v17.9.0 \
    BUNDLETOOL_REL=1.8.2

WORKDIR /app

RUN useradd --system \
      --create-home \
      --shell /usr/sbin/nologin \
      stf-build && \
    apt-get update && \
    apt-get upgrade -yq && \
    apt-get -y install wget python3 build-essential ca-certificates libzmq3-dev libprotobuf-dev git graphicsmagick openjdk-8-jdk yasm curl nano iputils-ping && \
    apt-get clean && \
    rm -rf /var/cache/apt/* /var/lib/apt/lists/*

RUN cd /tmp && \
    wget --progress=dot:mega \
      https://nodejs.org/dist/v17.9.0/node-v17.9.0-linux-x64.tar.xz && \
    tar -xJf node-v*.tar.xz --strip-components 1 -C /usr/local && \
    rm node-v*.tar.xz && \
    su stf-build -s /bin/bash -c '/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js install' && \
    mkdir /tmp/bundletool && \
    cd /tmp/bundletool && \
    wget --progress=dot:mega \
      https://github.com/google/bundletool/releases/download/${BUNDLETOOL_REL}/bundletool-all-${BUNDLETOOL_REL}.jar && \
    mv bundletool-all-${BUNDLETOOL_REL}.jar bundletool.jar

# Sneak the stf executable into $PATH.
ENV PATH=/app/bin:$PATH \
    DEBIAN_FRONTEND=noninteractive
ENV ALLOW_OUTDATED_DEPENDENCIES=1
# Work in app dir by default.
WORKDIR /app

# Export default app port, not enough for all processes but it should do
# for now.
EXPOSE 3000

# Install app requirements. Trying to optimize push speed for dependant apps
# by reducing layers as much as possible. Note that one of the final steps
# installs development files for node-gyp so that npm install won't have to
# wait for them on the first native module installation.
RUN   useradd --system \
      --create-home \
      --shell /usr/sbin/nologin \
      stf

ENV NODEJS_REL=v17.9.0
ENV BUNDLETOOL_REL=1.8.2

# Copy app source.
COPY . /tmp/build/

# Give permissions to our build user.
RUN mkdir -p /app && \
    chown -R stf-build:stf-build /tmp/build /tmp/bundletool /app

# Switch over to the build user.
USER stf-build

# Run the build.
RUN set -x && \
    cd /tmp/build && \
    export PATH=$PWD/node_modules/.bin:$PATH && \
    npm ci --python="/usr/bin/python3"  --loglevel http && \
    npm pack && \
    tar xzf vk-devicehub-*.tgz --strip-components 1 -C /app && \
    npm prune --production && \
    mv node_modules /app && \
    rm -rf ~/.node-gyp && \
    mkdir /app/bundletool && \
    mv /tmp/bundletool/* /app/bundletool && \
    cd /app && \
    find /tmp -mindepth 1 ! -regex '^/tmp/hsperfdata_root\(/.*\)?' -delete

# Switch to the app user.
USER stf

# Show help by default.
CMD stf --help
