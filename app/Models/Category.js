'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {

    // Relationship between Category and Featured Image
    image() {
        this.belongsTo('/App/Models/Image')
    }

     // Relationship between Categories and Products
    products() {
        this.belongsToMany('/App/Models/Product')
    }

}

module.exports = Category
