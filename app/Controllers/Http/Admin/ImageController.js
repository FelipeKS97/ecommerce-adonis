'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image')
const Transformer = use('App/Transformers/Admin/ImageTransformer')
const { 
  manage_single_upload, 
  manage_multiple_uploads
} = use('App/Helpers')
const Helpers = use('Helpers')

const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index ({ response, pagination }) {

    const { page, limit } = pagination
    const images = await Image
      .query()
      .orderBy('id', 'DESC')
      .paginate(page, limit)
    
    return response.send(images)
    
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {

    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      let imagesArr = []

      if(!fileJar.files) {
        const file = await manage_single_upload(fileJar)

        if(file.moved()) {
          let image = Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          image = await transform.item(image, Transformer)
          imagesArr.push(image)

          return response
            .status(201)
            .send({
              successes: imagesArr, 
              errors:{} 
            })

        }

        return response.status(400).send({
          message:"Não foi possível processar a imagem no momento."
        })
      } 

      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          let image = Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          image = await transform.item(image, Transformer)
          imagesArr.push(image)
        })
      )
      return response.status(201).send({ 
        successes: imagesArr, 
        errors: files.errors 
      })

    } catch (error) {

      return response.status(400).send({
        message: "Erro ao processar solicitação."
      }) 
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async show ({ params:{ id }, transform, response }) {
    let image = await Image.findOrFail(id)
    image = await transform.item(image, Transformer)
    return response.send(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async update ({ params: { id }, request, response, transform }) {

    let image = await Image.findOrFail(id)

    try {
      image.merge(request.only(['original_name']))
      await image.save()
      image = await transform.item(image, Transformer)

      return response.send(image)
      
    } catch (error) {
      
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })    
    }

  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, response }) {
    
    const image = await Image.findOrFail(id)

    try {

      let filepath = Helpers.publicPath(`uploads/${image.path}`)
      
      fs.unlinkSync(filepath)
      await image.delete()

      return response.status(204).send()
      
    } catch (error) {
      
      return response.status(500).send({
        message: "Erro ao processar solicitação."
      })  
    }
  }
}

module.exports = ImageController
