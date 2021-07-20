import json
import scrapy
import smtplib
from json import JSONEncoder
from datetime import datetime
from amazon.items import AmazonItem
from email.message import EmailMessage
from scraper_api import ScraperAPIClient

EMAIL_APP_PASSWORD = "eaaojtjzwwphwxsj"
SCRAPER_API_KEY = "abf593e40733978bcef7bc40fdf3bc26"

client = ScraperAPIClient(SCRAPER_API_KEY)

class AmazonProductsSpider(scrapy.Spider):
    name = "amazon"

    start_urls = [
        client.scrapyGet(
            url = "https://www.amazon.com/gp/product/B07WL6QHWH/"
        ),
    ]

    def appendLog(self, status):
        now = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        with open("amazon/spiders/amazon_spider.log", "a") as outfile:
            outfile.writelines("%s | %s" % (now, status) + "\n")
            outfile.close()

    def sendEmail(self, url, name, image, old_price, price, discount):
        msg = EmailMessage()

        msg["Subject"] = "Amazon | " + str(discount) + "% Discount"
        msg["From"] = "achaval.lucas@gmail.com"
        msg["To"] = ["achaval.lucas@gmail.com", "marcos.achavalr@gmail.com"]

        msg.set_content('''
    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
            body {{font-family:'Roboto',sans-serif}}
            sub1 {{font-weight:500}}
            .wrapper {{background-color:#e5e5e5;width:100%;border-collapse:fixed;border-spacing:0}}
            .table  {{background-color:#131921;border-collapse: separate;
        border-spacing: 30px 30px;width:640px}}
            .header {{color:#FFFFFF}}
            .table td{{border-color:black;font-size:14px}}
            .content {{height:250px; color:#FFFFFF;text-align:start}}
            .content a {{color:#131921}}
            .picture {{height:250px;width:250px;background:white;border-radius:15px;vertical-align:middle;text-align:center}}
            .text-data {{margin:0 0 5px 0;color:#9E9E9E}}
            .text-data .price {{color:white}}
            .text-data .strike {{text-decoration:line-through}}
            .button {{bottom:15px;text-decoration:none;color:#131921;background:#FF9900;padding:10px 20px;font-family: 'Roboto', sans-serif;font-size: 15px;font-weight: 600;border-radius: 10px;text-align:center;margin-bottom:15px}}
            </style>
        </head>
        <body>
            <table class="wrapper">
            <tr align="center">
                <td>
                <table class="table">
                    <thead>
                    <tr>
                        <th class="header" colspan="2">
                            <h1>Hello Marcos 👋</h1>
                            <sub1>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</sub1>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="picture">
                            <img src={image} alt="product-image" style="height:200px">
                        </td>
                        <td class="content" valign="top">
                        <h4>{name}</h4>
                        <p class="text-data">Old Price: <span class="price strike">${old_price}</span></p>
                        <p class="text-data">Price: <span class="price">${price}</span></p>
                        <div>&nbsp;</div>
                        <a class="button" href={url}>View product</a>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </td>
            </tr>
            </table>
        </body>
    </html>
    '''.format(image=image, name=name, old_price=old_price, price=price, url=url), subtype='html')

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login("achaval.lucas@gmail.com", EMAIL_APP_PASSWORD)
        server.send_message(msg)
        server.quit()


    def writeProduct(self, product_id, items):
        with open("amazon/products/%s.json" % product_id, "w") as outfile:
            json.dump(dict(items), outfile)
            outfile.close()

    def parse(self, response):
        items = AmazonItem()
        product_id = response.xpath('//*[@id="ASIN"]/@value').extract_first()
        product_url = "https://www.amazon.com/gp/product/%s/" % product_id
        product_name = response.xpath('//*[(@id ="productTitle")]/text()').extract_first()
        product_image = response.xpath('//*[@id="landingImage"]/@src').extract_first()
        product_price = response.xpath('//*[@id="priceblock_ourprice"]/text()').extract_first()
        product_availability = response.xpath('//div[@id="availability"]//text()').extract()

        def parse_name():
            if not product_name:
                return None
            else:
                return ''.join(product_name).strip()

        def parse_price():
            if not product_price:
                return None
            else:
                return float(product_price.replace("$",""))

        def parse_availability():
            if not product_availability:
                return None
            else:
                return ''.join(product_availability).strip().replace("\n", " ")

        items["pid"] = product_id
        items["url"] = product_url
        items["name"] = parse_name()
        items["image"] = product_image or ""
        items["price"] =  parse_price()
        items["availability"] = parse_availability()

        try:
            with open("amazon/products/%s.json" % product_id, "r") as outfile:
                product = json.load(outfile)

                if not parse_price():
                    self.appendLog("Unable to get price.")
                elif not product["price"]:
                    self.writeProduct(product_id, items)
                    self.appendLog("Success but no changes. Old price was null.")
                elif parse_price() < product["price"]:
                    discount = 100 - (parse_price() / product["price"]) * 100
                    discount = round(discount)
                    self.sendEmail(
                        product_url,
                        parse_name(),
                        product_image,
                        product["price"],
                        parse_price(),
                        discount
                    )
                    self.writeProduct(product_id, items)
                    self.appendLog("Email sent and product updated.")
                else:
                    self.appendLog("Success but no changes.")

                outfile.close()

        except FileNotFoundError or json.decoder.JSONDecodeError:
            self.writeProduct(product_id, items)
            self.appendLog("Error. Creating product file.")


    

        
