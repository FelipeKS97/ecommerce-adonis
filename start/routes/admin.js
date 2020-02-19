'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')


Route.group(() => {

    // Categories resource methods:

    Route.resource('categories', 'CategoryController').apiOnly()

    // Products resource methods:

    Route.resource('products', 'ProductController').apiOnly()

    // Images resource methods:

    Route.resource('images', 'ImageController').apiOnly()

    // Users resource methods:

    Route.resource('users', 'UsersController').apiOnly()

    // Coupon resource methods:

    Route.resource('coupon', 'CouponController').apiOnly()

    // Orders resource methods:

    Route.resource('orders', 'OrderController').apiOnly()

}).prefix('v1/admin')
  .namespace('Admin')