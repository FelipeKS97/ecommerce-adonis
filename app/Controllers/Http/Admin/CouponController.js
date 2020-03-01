'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Service = use('App/Services/Coupon/CouponService')

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
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const { page, limit } = pagination

    const code = request.input('code')
    const query = Coupon.query()

    if(code) {
      query.where('code', 'LIKE', `%${code}%`)
    }

    const coupons = await query.paginate(page, limit)

    return response.send(coupons)
  }


  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

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
      const coupon = Coupon.create(couponData, trx)

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
   * @param {View} ctx.view
   */
  async show ({ params: { id }, request, response, view}) {
    const coupon = await Coupon.findOrFail(id)

    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {

    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id) 
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
  async destroy ({ params: { id }, request, response }) {
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
