import express from 'express';
import { publisherConfig} from './config';

export const publisherApp = express();

publisherApp.get('/', (req, res) => {
    const view = 'publisher/index';
    res.render(view, {
        cdnDomain: publisherConfig.cdnHost
    });
});
