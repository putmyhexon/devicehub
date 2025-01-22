FROM python:3.10-alpine

RUN adduser --system devicehub-api-tests

ENV POETRY_VIRTUALENVS_CREATE off
ENV PYTHONUNBUFFERED 1
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV TZ=Europe/Moscow

WORKDIR /opt/tests

COPY . .
COPY poetry.lock pyproject.toml ./
RUN apk add --no-cache tzdata build-base curl && \
    cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
    python -m pip install poetry==1.8.3 --no-cache-dir && \
    poetry config virtualenvs.create false && \
    POETRY_MAX_WORKERS=10 poetry install --no-interaction --no-ansi --only main && \
    poetry cache clear --all . && \
    apk del build-base


USER devicehub-api-tests
