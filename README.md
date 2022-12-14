# Today in History

历史上的今天 API，数据来源：[百科·历史上的今天](https://baike.baidu.com/calendar/)

## API

Demo：https://today-in-history.deno.dev

|api|method|params|desc|
|-|-|-|-|
|`/`|GET|无参|默认返回当天的数据|
|`/`|GET|`?month=5&day=1`|返回 5 月 1 日的数据|

请求成功，返回数据格式：
```json
{
  "status": 200,
  "message": "OK: 3:48:35 PM GMT+8",
  "data": [
    {
    "year": "1469",
    "title": "葡萄牙国王曼努埃尔一世逝世",
    "desc": "曼努埃尔一世·科穆宁（希腊语：Μανουήλ Α' ο Κομνηνός ，1118年11月28日－1180年9月24日）拜占庭帝国科穆",
    "link": "https://baike.baidu.com/item/%E6%9B%BC%E5%8A%AA%E5%9F%83%E5%B0%94%E4%B8%80%E4%B8%96"
    },
    ...
  ]
}
```

缺少参数或者传入日期格式有误，返回错误信息：
- `/?month=2&day=31`
  ```json
  {
    "status": 404,
    "message": "month 和 day 不匹配！",
    "data": null
  }
  ```

- `/?month=12`
  ```json
  {
    "status": 400,
    "message": "请传入正确的参数！",
    "data": null
  }
  ```

注：
1. 时区已经调整为北京时间 UTC +08:00
2. 已设置缓存，同一天只会向数据源请求一次数据，重复请求直接返回缓存数据。

## Develop

```bash
# Start
deno run --watch --allow-net http.ts
# Lint
deno lint
# auto format
deno fmt
# check format
deno check
```

Recommend:
```shell
# Start
make run
# Lint
make lint
# auto format
make fmt
# check format
make check
```

## Deploy

- [deno.dev](https://deno.dev)
