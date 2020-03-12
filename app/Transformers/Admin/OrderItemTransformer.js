'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')

/**
 * OrderItemTransformer class
 *
 * @class OrderItemTransformer
 * @constructor
 */
class OrderItemTransformer extends BumblebeeTransformer {
  
  defaultInclude() {
    return ['product']
  }
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
     // add your transformation object here
     id: model.id,
     subtotal: model.subtotal,
     quantity: model.quantity
    }
  }

  includeProduct(model) {
    return this.item(model.getRelated('product', ProductTransformer))
  }
}

module.exports = OrderItemTransformer
