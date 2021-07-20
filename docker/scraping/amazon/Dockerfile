FROM python:3.9.5

WORKDIR /amazon 

COPY requirements.txt .

RUN pip install --upgrade pip

RUN apt-get update && apt-get upgrade -y

RUN apt-get install python3-lxml build-essential libssl-dev libffi-dev \
    python3-dev cargo -y

RUN pip install -r requirements.txt

COPY . .

CMD [ "scrapy", "crawl", "amazon"]
