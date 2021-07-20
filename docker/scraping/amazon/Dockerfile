FROM python:3.9.5-slim-buster

WORKDIR /amazon

COPY requirements.txt ./

RUN apt-get install libxml2-dev libxslt1-dev python-dev

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "scrapy", "crawl", "amazon"]