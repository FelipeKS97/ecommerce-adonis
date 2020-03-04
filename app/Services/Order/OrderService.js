'use strict'

const Database = use('Database')
const { isArrayEmpty, isArrayNotEmpty } = use('App/Helpers')

class CouponService {
    constructor(model, trx = null) {
        this.model = model
        this.trx = trx
    }

    async syncItems(items) {
        if(!Array.isArray(items)) {
            return false
        }

        await this.model.items().delete(this.trx)
        await this.model.items().createMany(items)
    }

    async uptadeItems(items) {
        let currentItems = await this.model
            .items()
            .whereIn('id', items.map(item => item.id))
            .fetch()

        await this.model
            .items()
            .whereNotIn('id', items.map(item => item.id))
            .delete(this.trx)

        await Promise.all(
            currentItems.rows.map(async item => {
                item.fill(items.find(n => n.id === item.id))
                await item.save(this.trx)
            })
        )
    }

    async canApplyDiscount(coupon) {
        const CouponProducts = await Database
        .from('coupon_product')
        .where('coupon_id', coupon.id)
        .pluck('product_id')

        const CouponClients = await Database
        .from('coupon_user')
        .where('coupon_id', coupon.id)
        .pluck('user_id')

        
        if(isArrayEmpty(CouponProducts) && isArrayEmpty(CouponClients)) return true

        
        let isAssociatedToProducts = false, 
        isAssociatedToClients = false

        if(isArrayNotEmpty(CouponProducts)) {
            isAssociatedToProducts = true
        }

        if(isArrayNotEmpty(CouponClients)) {
            isAssociatedToClients = true
        }

        const productsMatch = Database
        .from('order_items')
        .where('order_id', this.model.id)
        .whereIn('product_id', CouponProducts)
        .pluck('product_id')

        // Use Case 1: Coupon associated with clients and products

        if(isAssociatedToClients && isAssociatedToProducts) {
            const clientMatch = CouponClients.find(client => 
                client === this.model.user_id
            )

            if(clientMatch && isArrayNotEmpty(productsMatch)) {
                return true
            }
        }

        // Use Case 2: Coupon only associated with products

        if(isAssociatedToProducts && isArrayNotEmpty(productsMatch)) return true


         // Use Case 3: Coupon is associated with one or more clients

         if(isAssociatedToClients && isArrayNotEmpty(CouponClients)) {

            const match = CouponClients.find(client => 
                client === this.model.user_id
            )

            if(match) return true
        }

        // Use Case 4: If none of all verifications is resulting true, 
        // there's no products or clients in this order allowed to use the coupon
        
        return false    
    }
}

module.exports = CouponService