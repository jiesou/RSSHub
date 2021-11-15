import got from '~/utils/got.js';
import utils from './utils.js';

export default async (ctx) => {
    const {
        site
    } = ctx.params;
    const only_media = ctx.params.only_media ? 'true' : 'false';

    const url = `http://${site}/api/v1/timelines/public?local=true&only_media=${only_media}`;

    const response = await got.get(url);
    const list = response.data;

    ctx.state.data = {
        title: `Local Public${ctx.params.only_media ? ' Media' : ''} Timeline on ${site}`,
        link: `http://${site}`,
        item: utils.parseStatuses(list),
    };
};