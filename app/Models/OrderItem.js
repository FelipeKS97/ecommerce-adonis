'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderItem extends Model {

    static get traits () {
        return ['App/Models/Traits/NoTimestamp']
      }

    // Relationship between OrderItem and Product
    product() {
        this.belongsTo('App/Models/Product')
    }

    // Relationship between OrderItem and Order
    order() {
        this.belongsTo('App/Models/Order')
    }
}

module.exports = OrderItem
