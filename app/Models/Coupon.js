'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coupon extends Model {
    static get dates() {
        return ['created_at', 'updated_at', 'valid_from', 'valid_until']
    }


    // Relationship between Coupons and Users
    users() {
        this.belongsToMany('App/Models/User')
    }

    // Relationship between Coupons and Products
    products() {
        this.belongsToMany('App/Models/Product')
    }

    // Relationship between Coupons and Orders
    orders() {
        this.belongsToMany('App/Models/Order')
    }
}

module.exports = Coupon
