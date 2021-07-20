FROM python:3.8.10-alpine3.13

WORKDIR /home/pi/docker/scraping/amazon

COPY requirements.txt ./

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "scrapy", "crwal", "amazon"]