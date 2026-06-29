import ImageController from 'src/app/http/controllers/ImageController'
import PageController from 'src/app/http/controllers/PageController'
import { Router } from '@arkstack/driver-express'
import ToneflixController from 'src/app/http/controllers/ToneflixController'

Router.get('/', [PageController, 'index'])
Router.get('/docs', [PageController, 'show'])
Router.get('/images/{segments}', [ToneflixController, 'show'])
Router.get('/{args}', [ImageController, 'show']).where('args', '.*')