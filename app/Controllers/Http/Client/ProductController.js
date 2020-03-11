'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Product = use('App/Models/Product')
const Transformer = use('App/Transformers/Admin/ProductTransformer')

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {TransformWith} ctx.transform
   */
  async index ({ request, response, pagination, transform }) {

    const { page, limit } = pagination
    const title = request.input('title')
    const query = Product.query()

    if(title) {
      query.where('name', 'LIKE', `${title}`)
    }
    
    const results = await query.paginate(page, limit)
    const products = await transform.paginate(results, Transformer)

    return response.send(products)
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async show ({ params: { id }, request, response, transform }) {
    const result = await Product.findOrFail(id)
    const product = await transform.item(result, Transformer)

    return response.send(product)
  } 

}

module.exports = ProductController
