import ImageController from 'src/app/http/controllers/ImageController'
import { Router } from '@arkstack/driver-express'
import ToneflixController from 'src/app/http/controllers/ToneflixController'
import { view } from '@arkstack/view'

Router.get('/', async () => {
  return await view('welcome', {
    title: 'Welcome to Arkstack',
    app_name: config('app.name'),
    message: 'Server running — ready for requests',
  })
})

Router.get('/*args', [ImageController, 'show'])
Router.get('/images/:segments', [ToneflixController, 'show'])