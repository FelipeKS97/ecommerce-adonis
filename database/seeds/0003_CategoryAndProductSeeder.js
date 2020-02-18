'use strict'

/*
|--------------------------------------------------------------------------
| CategoryAndProductSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class CategoryAndProductSeeder {
  async run () {

    const categories = Factory.model('App/Models/Category').createMany(10)

    await Promise.all(
      categories.map( async category => {
        const products = Factory.model('App/Models/Product').createMany(5)

        await Promise.all( 
          products.map(product => {
            product.categories().attach([category.id])

          }) 
        )
      }) 
    )

    
  }
}

module.exports = CategoryAndProductSeeder
