'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {

    // Relationship between Category and Featured Image
    image() {
        return this.belongsTo('App/Models/Image')
    }

     // Relationship between Categories and Products
    products() {
        return this.belongsToMany('App/Models/Product') //.pivotTable('category_product') //.pivotPrimaryKey(null)
    }

}

module.exports = Category
