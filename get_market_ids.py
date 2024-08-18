state_names = ["alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico","new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania","rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont","virginia","washington","west-virginia","wisconsin","wyoming"]

will-a-democrat-win-north-dakota-in-the-2024-us-presidential-election

from py_clob_client.client import ClobClient
import time

client = ClobClient(
    host="https://clob.polymarket.com"
)


def get_all_markets(client):
    data = []
    next_cursor = ""
    f = open("markets.txt","w",encoding="utf-8")
    while True:
        time.sleep(1)
        resp = client.get_sampling_markets(next_cursor=next_cursor)  
        for x in resp['data']:
            if x.market_slug
            data.append(x)
            f.write(str(x))
        next_cursor = resp['next_cursor']
        if next_cursor == 'LTE=':
            break
    f.close()
    return data

data = get_all_markets(client)