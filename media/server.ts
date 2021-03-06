import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import mediaRoutes from './routes';

const app = new Koa();

app.use(cors({ origin: '*' })); // TODO for development only
app.use(bodyParser());
app.use(mediaRoutes);

const port = parseInt(process.env.PORT || '') || 3003;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
