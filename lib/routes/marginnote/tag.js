import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        id = '经验分享'
    } = ctx.params;

    const rootUrl = 'https://bbs.marginnote.cn';
    const currentUrl = `${rootUrl}/tag/${id}/l/latest.json`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.topic_list.topics.slice(0, 10).map((item) => ({
        title: item.title,
        link: `${rootUrl}/t/topic/${item.id}`,
        pubDate: new Date(item.last_posted_at).toUTCString(),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data.replace('<noscript', '<div').replace('</noscript>', '</div>'));

                item.author = content('.creator').eq(0).text();
                item.description = content('.post').eq(0).html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.topic_list.tags[0].name} - MarginNote 中文论坛`,
        link: currentUrl,
        item: items,
    };
};