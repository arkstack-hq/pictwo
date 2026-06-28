import DocsController from 'src/app/http/controllers/DocsController'
import ImageController from 'src/app/http/controllers/ImageController'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'
import { Router } from '@arkstack/driver-express'
import ToneflixController from 'src/app/http/controllers/ToneflixController'
import { view } from '@arkstack/view'

Router.get('/', async () => {
  const service = await ImageServiceProvider.get()

  return await view('welcome', {
    title: 'Welcome to Arkstack',
    app_name: config('app.name'),
    categories: service.getCategoryNames(),
  })
})

Router.get('/docs', [DocsController, 'show'])
Router.get('/images/{segments}', [ToneflixController, 'show'])
Router.get('/{args}', [ImageController, 'show']).where('args', '.*')