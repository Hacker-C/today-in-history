import { serve } from 'https://deno.land/std@0.157.0/http/server.ts';

// 配置文件
const port = 8081;
const ENV: 'production' | 'development' = 'production';
const ALLOW_ORIGIN: Record<string, string> = {
	production: 'https://60s-view.netlify.app',
	development: 'http://localhost:3333',
};
// Response headers
const headers = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': ALLOW_ORIGIN[ENV],
	'Access-Control-Allow-Methods': 'GET',
};
const api = (month: string) => `https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`;

// 设置缓存
const cache: Map<string, EventType[]> = new Map();

type EventType = {
	year: string;
	title: string;
	desc: string;
	link: string;
};

serve(handler, {
	onListen() {
		console.log(`serving at http://localhost:${port}`);
	},
	port,
});

// 响应体
const theResponse = (
	dayData: EventType[] | null,
	status = 200,
	message = 'OK: ' + new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', timeStyle: 'long' }).format(),
) => {
	return new Response(JSON.stringify({ status, message, data: dayData }), {
		headers,
    status
	});
};

// Handler
async function handler(req: Request): Promise<Response> {
	const params = new URL(req.url).searchParams;
	const [month, day] = [params.get('month'), params.get('day')];

  if (month === null && day !== null || month !== null && day === null) {
    // ! 一个传了一个没传
    return theResponse(null, 400, '请传入正确的参数！');
  }

	let monthArg: string, dayArg: string, queryArg: string;
	// 都没有传则默认返回当天数据
	if (month === null && day === null) {
    // ! 两个都没传
		// 获取东八区时间（GMT+8）
		const date = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' }).format();
		// date -> mm/dd/yy
		const [_, m, d] = date.split('/');
		monthArg = (m.length < 2 ? '0' + m : m) as string;
		dayArg = (d.length < 2 ? '0' + d : d) as string;
		queryArg = monthArg + '' + dayArg;
	} else if (!/^(?:1[0-2]|[1-9])$/.test(month!) || !/^([1-9]|[1-2]\d|3[0-1])$/.test(day!)) {
    // ! 传了但是格式不对
		return theResponse(null, 400, '请传入正确的参数！');
  } else {
    // ! 传了且格式正确
		monthArg = month!.length < 2 ? '0' + month : month as string;
		dayArg = day!.length < 2 ? '0' + day : day as string;
		queryArg = monthArg! + dayArg!;
	}
	// 若有缓存
	if (cache.has(queryArg)) {
		return theResponse(cache.get(queryArg)!);
	}
	let originData: Record<string, Record<string, EventType[] | null>> | null = null;

	// 判断是否请求成功
	try {
		const resp = await fetch(api(monthArg!));
		const res = await resp.json();
		originData = res;
	} catch {
		return theResponse(null, 500, '请求失败！');
	}

	const monthData: Record<string, EventType[] | null> = originData![monthArg!];
	const dayData: EventType[] | null = monthData[queryArg];
	if (!dayData || dayData.length === 0) {
    // ! 月和日不匹配
		return theResponse(null, 404, 'month 和 day 不匹配！');
	}

	// 处理数据
	const eventsData: EventType[] = [];
	dayData!.forEach((item) => {
		const { year, title, desc, link } = item;
		// 取出文本
		const titleText = title.replace(/<([\s\S])*?>/g, '');
		const descText = desc.replace(/<([\s\S])*?>/g, '');
		eventsData.push({ year, title: titleText, desc: descText, link });
	});

	// 数据放入缓存
	cache.set(queryArg!, eventsData);

	return theResponse(eventsData);
}
