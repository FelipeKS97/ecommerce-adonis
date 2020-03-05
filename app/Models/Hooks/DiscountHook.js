'use strict'

const DiscountHook = exports = module.exports = {}
const Database = use('Database')
const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')

DiscountHook.calculateValues = async (model) => {
    let couponProducts = [], discountItems = []

    model.discount = 0
    const coupon = await Coupon.find(model.coupon_id)
    const order = await Order.find(model.order_id)

    if(coupon.can_use_for === 'product_client' || 'product' ) {

        couponProducts = await Database
        .from('coupon_product')
        .where('coupon_id', model.coupon_id)
        .pluck('product_id')
        
        discountItems = await Database
        .from('order_items')
        .where('order_id', model.order_id)
        .whereIn('product_id', couponProducts)

        switch (coupon.type) {
            case 'percent':
                for (const orderItem of discountItems) {
                    model.discount += (orderItem.subtotal / 100) * coupon.discount   
                }
                break;
            
            case 'currency':
                for (const orderItem of discountItems) {
                    model.discount += orderItem.quantity * coupon.discount   
                }
                break;
        
            default:
                for (const orderItem of discountItems) {
                    model.discount += orderItem.quantity * coupon.discount   
                }
                break;
        }

    } else {
        // client || all
        switch (coupon.type) {
            case 'percent':
                model.discount = (order.subtotal / 100) * coupon.discount
                break;
            case 'currency':
                model.discount = coupon.discount
                break;
            default:
                model.discount = order.subtotal
                break;
        }
    }

    return model    
}

DiscountHook.decrementCoupons = async (model) => {
    const query =  Database
    .from('coupons')

    if(model.$transaction) {
        query.transacting(model.$transaction)
    }

    await query
    .where('id', model.coupon_id)
    .decrement('quantity', 1)

}

DiscountHook.incrementCoupons = async (model) => {

    const query =  Database
    .from('coupons')

    if(model.$transaction) {
        query.transacting(model.$transaction)
    }

    await query
    .where('id', model.coupon_id)
    .increment('quantity', 1)
}

