FROM python:3.8-slim

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /backend
WORKDIR /backend
COPY . /backend


COPY requirements.txt ${PWD}
RUN pip install -r requirements.txt

ENV TZ=Asia/Tokyo
ENV USER user1

RUN useradd -m ${USER} --uid 1000
RUN gpasswd -a ${USER} sudo
RUN echo "${USER}:pass" | chpasswd

USER ${USER}



