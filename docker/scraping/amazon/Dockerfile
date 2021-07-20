FROM python:3.9.5-slim-buster

WORKDIR /amazon

COPY requirements.txt ./

RUN apt-get install python3-lxml

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "scrapy", "crawl", "amazon"]