'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Transformer = use('App/Transformers/Admin/OrderTransformer')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   * @param {TransformWith} ctx.transform
   */
  async index ({ request, response, pagination, transform }) {
    const { page, limit } = pagination
    const { status, id } = request.all()
    const query = Order.query()
    
    if(status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if(status) {
      query.where('status', status)
    } else if(id) {
      query.where('id', 'LIKE', `%${id}%`)
    }

    let orders = await query.paginate(page, limit)
    orders = await transform.paginate(orders, Transformer)

    return response.send(orders)

  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store ({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      
      // Starts Service Layer
      const service = new Service(order, trx)

      if(items && items.length > 0) await service.syncItems(items)
      await trx.commit()
      order = await Order.find(order.id)
      order = await transform
        .include('user,items')
        .item(order, Transformer)

      response.status(201).send(order)

    } catch (error) {

      await trx.rollback()
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async show ({ params : { id }, response, transform }) {

    let order = await Order.findOrFail(id)
    order = await transform
      .include('user,items,discounts')
      .item(order, Transformer)

    return response.send(order)
  }


  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async update ({ params: { id }, request, response, transform }) {

    let order = await Order.findOrFail(id)
    const trx =  Database.beginTransaction()

    try {
      
      const { status, items, user_id } = request.all()
      order.merge({ status, items, user_id })

      //Start Service Layer
      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      order = await transform
        .include('user,items,discounts,coupons')
        .item(order, Transformer)
      
      return response.send(order)
    } catch (error) {
      
      await trx.rollback()
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })    
    }

  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()

      return response.status(204).send()
      
    } catch (error) {
      await trx.rollback()
      
      return response.status(400).send({
        message: "Erro ao processar solicitação."
      })  
    }
  }

  /**
   * Apply a discount to an order with id.
   * POST Method
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async applyDiscount ({ params: { id }, request, response, transform }) {

    const { code } = request.all()
    const coupon = Coupon.findByOrFail('code', code.toUpperCase())
    let order = Order.findOrFail(id)

    let discount = {}, 
    info = {}

    // Start Service Layer
    try {
      const service = new Service(order)
      const orderDiscounts = await order.coupons().getCount()
      const canAddDiscount = await service.canApplyDiscount()
      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)

      if(canAddDiscount && canApplyToOrder) {
        discount = Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        info.message = 'Cupom aplicado com sucesso!'
        info.success = true
      } else {
        info.message = 'Falha ao aplicar o cupom!'
        info.success = false
      }

      order = await transform
        .include('user,items,discounts,coupons')
        .item(order, Transformer)

      return response.send({ order, info })

    } catch (error) {
      return response.status(400).send({
        message: "Erro ao aplicar o cupom."
      })
    }
    
  }

   /**
   * Remove a discount to an order with discount_id.
   * DELETE Method
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async removeDiscount ({ request, response }) {

    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()

    return response.status(204).send()

  }


}

module.exports = OrderController
