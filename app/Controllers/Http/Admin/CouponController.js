'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')
const Transformer = use('App/Transformers/Admin/CouponTransformer')

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {TransformWith} ctx.transform
   */
  async index ({ request, response, pagination, transform }) {
    const { page, limit } = pagination

    const code = request.input('code')
    const query = Coupon.query()

    if(code) {
      query.where('code', 'LIKE', `%${code}%`)
    }

    let coupons = await query.paginate(page, limit)
    coupons = await transform.paginate(coupons, Transformer)

    return response.send(coupons)
  }


  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store ({ request, response, transform }) {

    const trx = await Database.beginTransaction()
    let canUseClient = false , canUseProduct = false
    
    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])
      
      const { users, products } = request.all()
      let coupon = Coupon.create(couponData, trx)

      // Service Layer starts
      const service = new Service(coupon, trx)

      if(users && users.length > 0) {
        await service.syncUsers(users)
        canUseClient = true
      }

      if(products && products.length > 0) {
        await service.syncProducts(products)
        canUseProduct = true
      }

      if(canUseProduct && canUseClient) {
        coupon.can_use_for = 'product_client'
      } else if(!canUseProduct && canUseClient) {
        coupon.can_use_for = 'client'
      } else if(canUseProduct && !canUseClient) {
        coupon.can_use_for = 'product'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()
      coupon = await transform
        .include('users,products')
        .item(coupon, Transformer)
      
      return response.status(201).send(coupon)

    } catch (error) {

      await trx.rollback()
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })    
    }

  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async show ({ params: { id }, response, transform}) {
    let coupon = await Coupon.findOrFail(id)
    coupon = await transform
      .include('users,products,orders')
      .item(coupon, Transformer)

    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async update ({ params: { id }, request, response, transform }) {

    const trx = await Database.beginTransaction()
    let coupon = await Coupon.findOrFail(id) 
    let canUseClient = false , canUseProduct = false

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])
      const { users, products } = request.all()

      coupon.merge(couponData)
      
      // Service Layer Starts

      const service = new Service(coupon, trx)

      if(users && users.length > 0) {
        await service.syncUsers(users)
        canUseClient = true
      }

      if(products && products.length > 0) {
        await service.syncProducts(products)
        canUseProduct = true
      }

      if(canUseProduct && canUseClient) {
        coupon.can_use_for = 'product_client'
      } else if(!canUseProduct && canUseClient) {
        coupon.can_use_for = 'client'
      } else if(canUseProduct && !canUseClient) {
        coupon.can_use_for = 'product'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()
      coupon = await transform.item(coupon, Transformer)

      return response.send(coupon)

    } catch (error) {

      await trx.rollback()
      
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })    
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, response }) {
    const trx = Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id)

    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete()
      await trx.commit()      

      return response.status(204).send()
      
    } catch (error) {

      await trx.rollback()
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })  
    }
  }
}

module.exports = CouponController
