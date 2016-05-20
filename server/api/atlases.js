import Router from 'koa-router';
import httpErrors from 'http-errors';

import auth from './authentication';
import pagination from './middlewares/pagination';
import { presentAtlas } from '../presenters';
import { Team, Atlas } from '../models';

const router = new Router();

router.post('atlases.info', auth(), async (ctx) => {
  let { id } = ctx.request.body;
  ctx.assertPresent(id, 'id is required');

  const team = await ctx.state.user.getTeam();
  const atlas = await Atlas.findOne({
    where: {
      id: id,
      teamId: team.id,
    },
  });

  if (!atlas) throw httpErrors.NotFound();

  ctx.body = {
    data: await presentAtlas(atlas, true),
  };
});


router.post('atlases.list', auth(), pagination(), async (ctx) => {
  let { teamId } = ctx.request.body;
  ctx.assertPresent(teamId, 'teamId is required');

  const team = await ctx.state.user.getTeam();
  const atlases = await Atlas.findAll({
    where: {
      teamId: teamId,
    },
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
  });

  // Atlases
  let data = [];
  await Promise.all(atlases.map(async (atlas) => {
    data.push(await presentAtlas(atlas));
  }))

  ctx.body = {
    pagination: ctx.state.pagination,
    data: data,
  };
});

export default router;