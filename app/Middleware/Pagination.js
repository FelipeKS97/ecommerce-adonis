'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {
    // call next to advance the request
    const { request } = ctx

    if(request.method() === 'GET') {
      const page = request.input('page') ?  parseInt(request.input('page')) : 1
      const limit = request.input('limit') || request.input('perpage') ? parseInt(request.input('perpage')) ||  parseInt(request.input('limit')) : 20

      ctx.pagination = { 
        page, 
        limit
      }

    }
    await next()
  }
}

module.exports = Pagination
