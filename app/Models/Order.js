'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {

     // Relationship between Order and User
     user() {
        this.belongsTo('App/Models/User', 'user_id', 'id')
    }

    // Relationship between Orders and Coupons
    coupons() {
        this.belongsToMany('App/Models/Coupon')
    }

    // Relationship between Order and Items
    items() {
        this.hasMany('App/Models/Order')
    }

    // Relationship between Order and Discounts
    discounts() {
        this.hasMany('App/Models/Discount')
    }
}

module.exports = Order
