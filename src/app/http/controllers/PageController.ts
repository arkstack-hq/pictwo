import { BaseController } from '@controllers/BaseController'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'
import { Route } from 'clear-router'
import { fonts } from 'src/Utils/font'
import { inertia } from '@arkstack/inertia'

export default class PageController extends BaseController {
  async index() {
    const service = await ImageServiceProvider.get()

    return inertia('Index', {
      fonts,
      config: { app: config('app') },
      title: 'Image Placeholder Service',
      baseUrl: config('app.url'),
      canonical: config('app.url') + Route.current()?.toPath(),
      categories: service.getCategoryNames(),
      description: 'Drop-in placeholder images for every project. Random, seeded, categorised, or specific'
    })
  }
  /**
   * Get a specific resource
   *
   * @param res
   */
  async show() {
    console.log(Route.current()?.toPath())

    return inertia('SdkPage', {
      config: { app: config('app') },
      title: 'SDK Reference',
      baseUrl: config('app.url'),
      canonical: config('app.url') + Route.current()?.toPath(),
      description: 'Pictwo SDK reference: @pictwo/core, @pictwo/faker and @pictwo/images.'
      // description: 'Typed helpers for generating Pictwo image URLs.'
    })
  }
}