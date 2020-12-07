FROM python:3.8-slim

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /backend
WORKDIR /backend
COPY . /backend

RUN mkdir -p /media/pdf
RUN mkdir -p /static/

COPY requirements.txt ${PWD}
RUN pip install -r requirements.txt

ENV TZ=Asia/Tokyo
ENV USER user1

RUN useradd -m ${USER} --uid 1000
RUN gpasswd -a ${USER} sudo
RUN echo "${USER}:pass" | chpasswd

RUN chown -R user:user /media/
RUN chmod -R 755 /media/pdf

USER ${USER}



