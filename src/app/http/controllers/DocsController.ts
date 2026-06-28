import { BaseController } from '@controllers/BaseController'
import { view } from '@arkstack/view'

export default class DocsController extends BaseController {
  /**
   * Get a specific resource
   *
   * @param res
   */
  async show() {
    return await view('docs', {
      title: 'SDK Reference',
      app_name: config('app.name')
    })
  }
}