'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category')
const Transformer = use('App/Transformers/Admin/CategoryTransformer')

/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TranformWith} ctx.transform
   * @param {object} ctx.pagination
   */
  async index ({ request, response, transform, pagination }) {

    const { page, limit } = pagination

    const title = request.input('title')
    const query = Category.query()

    if(title) {
      query.where('title', 'LIKE', `%${title}%`)
    }
    
    let categories = await query.paginate(page, limit)
    categories = await transform.paginate(categories, Transformer)

    return response.send(categories)
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TranformWith} ctx.transform
   */
  async store ({ request, response, transform }) {

    try {
      const { title, description, image_id } = request.all()
      let category = await Category.create({ title, description, image_id })
      category = await transform.item(category, Transformer)

      return response.status(201).send(category)
    } catch (error) {

      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TranformWith} ctx.transform
   */
  async show ({ params: { id }, transform, response }) {
    let category = await Category.findOrFail(id)
    category = await transform.item(category, Transformer)
    return response.send(category)
  }


  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TranformWith} ctx.transform
   */
  async update ({ params: { id }, request, response, transform }) {

    let category = await Category.findOrFail(id)

    try {
      const { title, description, image_id } = request.all()
      category.merge({ title, description, image_id })
      await category.save()
      category = await transform.item(category, Transformer)
      
      return response.send(category)
      
    } catch (error) {
      
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })    
    }

  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, response }) {
    
    const category = await Category.findOrFail(id)

    try {
      await category.delete()
      return response.status(204).send()
      
    } catch (error) {
      
      return response.status(500).send({
        message: "Erro ao processar solicitação."
      })  
    }
  }
}

module.exports = CategoryController
