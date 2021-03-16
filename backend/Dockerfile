FROM python:3.6-alpine3.6

ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

# slim を使っていた時に利用していた
# RUN apt-get update && apt-get install -y \
#     tzdata \
#     libmagic1 \
#     && rm -rf /var/lib/apt/ lists/*


COPY ./requirements.txt .

RUN set -e; \
  apk update \
  && apk add --virtual .build-deps gcc python3-dev musl-dev libffi-dev \
  # TODO workaround start
  && apk del libressl-dev \
  && apk add openssl-dev \
  && pip install cryptography==2.2.2 \
  && apk del openssl-dev \
  && apk add libressl-dev \
  # TODO workaround end
  && apk add postgresql-dev \
  && apk add jpeg-dev zlib-dev libjpeg libmagic \
  && pip install --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt \
  && apk del .build-deps


# copy entrypoint.sh
COPY ./entrypoint.sh .

COPY . .

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]