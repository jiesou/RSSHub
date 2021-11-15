import got from '~/utils/got.js';

export default async (ctx) => {
    // 传入参数
    const username = String(ctx.params.username);

    const {
        data
    } = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}/shouts.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    ctx.state.data = {
        // 源标题
        title: `${username}'s Shouts`,
        // 源链接
        link: `https://www.furaffinity.net/user/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Shouts`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.text,
            // 正文
            description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text} `,
            // 链接
            link: `https://www.furaffinity.net/user/${username}/`,
            // 作者
            author: item.name,
            // 日期
            pubDate: new Date(item.posted_at).toUTCString(),
        })),
    };
};