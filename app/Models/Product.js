'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

    // Relationship between Product and Featured Image
    image() {
        return this.belongsTo('App/Models/Image')
    }

    // Relationship between Products and the Image Gallery
    images() {
        return this.belongsToMany('App/Models/Image')
    }

    // Relationship between Products and Categories
    categories() {
        return this.belongsToMany('App/Models/Category') //.pivotTable('category_product') //.pivotPrimaryKey(null)
    }

    // Relationship between Products and Coupons
    coupons () {
        return this.belongsToMany('App/Models/Coupon')
    }
}

module.exports = Product
