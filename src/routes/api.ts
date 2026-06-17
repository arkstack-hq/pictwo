import ImageInfoController from 'src/app/http/controllers/ImageInfoController'
import ImageListController from 'src/app/http/controllers/ImageListController'
import { Router } from '@arkstack/driver-express'

Router.get('/test', () => {
  return { status: 'OK' }
})

Router.get('/v1/list', [ImageListController, 'index'])
Router.get('/v1/id/:id/info', [ImageInfoController, 'showById'])
Router.get('/v1/seed/:seed/info', [ImageInfoController, 'showBySeed'])