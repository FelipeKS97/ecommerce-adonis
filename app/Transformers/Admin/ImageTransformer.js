'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * ImageTransformer class
 *
 * @class ImageTransformer
 * @constructor
 */
class ImageTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    // To JSON
    model = model.toJSON()

    return {
     // add your transformation object here
      id: model.id,
      url: model.url
    }
  }
}

module.exports = ImageTransformer
