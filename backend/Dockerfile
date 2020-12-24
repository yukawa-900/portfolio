FROM python:3.8-slim

ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    tzdata \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ${PWD}
RUN pip install -r requirements.txt

COPY . /usr/src/app

ENV TZ=Asia/Tokyo
ENV USER user1

RUN useradd -m ${USER} --uid 1000
RUN gpasswd -a ${USER} sudo
RUN echo "${USER}:pass" | chpasswd

USER ${USER}

