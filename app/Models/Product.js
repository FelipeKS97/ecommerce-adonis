'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

    // Relationship between Product and Featured Image
    image() {
        this.belongsTo('App/Model/Image')
    }

    // Relationship between Products and the Image Gallery
    images() {
        this.belongsToMany('App/Model/Image')
    }

    // Relationship between Products and Categories
    categories() {
        this.belongsToMany('App/Model/Category')
    }

    // Relationship between Products and Coupons
    coupons () {
        this.belongsToMany('App/Models/Coupon')
    }
}

module.exports = Product
