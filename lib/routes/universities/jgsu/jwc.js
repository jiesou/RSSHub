import got from '~/utils/got.js';
import cheerio from 'cheerio';
const baseUrl = 'http://jwc.jgsu.edu.cn/jwtz';
export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(data);
    const ul = $('.xn_c_sv_20_li');
    ctx.state.data = {
        link: baseUrl,
        title: '井冈山大学教务处',
        item: ul
            .map((_, item) => ({
                link: baseUrl + $(item).find('a').attr('href').slice(1),
                title: $(item).find('a').text(),
                discription: $(item).find('.xn_c_sv_20_text').text(),
                pubDate: new Date($(item).find('.time').text().replace('[', '').replace(']', '')).toUTCString(),
            }))
            .get(),
    };
};