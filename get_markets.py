from py_clob_client.client import ClobClient
import time

client = ClobClient(
    host="https://clob.polymarket.com"
)


def get_all_markets(client):
    data = []
    next_cursor = ""
    f = open("markets2.txt","w",encoding="utf-8")
    while True:
        time.sleep(1)
        resp = client.get_sampling_markets(next_cursor=next_cursor)  
        for x in resp['data']:
            data.append(x)
            try:
                f.write(str(x))
            except:
                print(x)
        next_cursor = resp['next_cursor']
        if next_cursor == 'LTE=':
            break
    f.close()
    return data

data = get_all_markets(client)