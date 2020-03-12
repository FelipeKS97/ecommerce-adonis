'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')


Route.group(() => {

  // Categories resource methods:

  Route.resource('categories', 'CategoryController')
  .apiOnly()
  .validator(new Map([
    [['categories.store'], ['Admin/StoreCategory']],
    [['categories.update'], ['Admin/UpdateCategory']],
  ]))

  // Products resource methods:

  Route.resource('products', 'ProductController').apiOnly()

  // Images resource methods:

  Route.resource('images', 'ImageController').apiOnly()

  // Users resource methods:

  Route.resource('users', 'UserController')
  .apiOnly()
  .validator(new Map([
    [['users.store'], ['Admin/StoreUser']],
    [['users.update'], ['Admin/StoreUser']],
  ]))

  // Coupon resource methods:

  Route.resource('coupons', 'CouponController').apiOnly()

  // Orders resource methods:
  
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
  .apiOnly()
  .validator(new Map([[['orders.store'], ['Admin/StoreOrder']]]))

  // Dashboard route
  
  Route.get('dashboard', 'DashboardController.index').as('dashboard')

}).prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:( admin || manager )'])