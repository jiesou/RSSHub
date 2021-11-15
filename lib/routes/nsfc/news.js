import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const baseUrl = 'http://www.nsfc.gov.cn';

const typeMap = {
    jjyw: {
        name: '基金要闻',
        url: '/publish/portal0/tab440/',
    },
    tzgg: {
        name: '通知公告',
        url: '/publish/portal0/tab442/',
    },
    zzcg: {
        name: '资助成果',
        url: '/publish/portal0/tab448/',
    },
    kpkx: {
        name: '科普快讯',
        url: '/publish/portal0/tab446/',
    },
};

export default async (ctx) => {
    const {
        type = 'jjyw'
    } = ctx.params;
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.contentnews .clearfix')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.contentnews .clearfix')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('title'))
        .get();

    const dateList = $('.contentnews .clearfix')
        .slice(0, 10)
        .map((i, e) => $('.fr', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.includes('.htm')) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return JSON.parse(cache);
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.content_xilan')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim(),
                    pubDate: dateList[index],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return single;
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为文件，请点击下载',
                    pubDate: dateList[index],
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: '国家自然科学基金委员会-' + typeMap[type].name,
        link,
        item: out,
    };
};