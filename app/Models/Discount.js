'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Discount extends Model {

    static get table() {
        return 'coupon_order'
    }

    // Relationship between Discount and Order
    order() {
        return this.belongsTo('App/Models/Order', 'order_id', 'id')
    }

    // Relationship between Discount and Coupon
    coupon() {
        return this.belongsTo('App/Models/Coupon', 'coupon_id', 'id')
    }
}

module.exports = Discount
