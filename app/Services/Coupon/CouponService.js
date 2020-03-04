'use strict'

class CouponService {
    constructor(model, trx = null) {
        this.model = model
        this.trx = trx
    }

    async syncItems(items) {
        if(!Array.isArray(coupons)) {
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

    async syncCoupons(coupons) {
        if(!Array.isArray(coupons)) {
            return false
        }
        await this.model.coupons().sync(coupons, null, this.trx)
    }

    // async syncProducts(products) {
    //     if(!Array.isArray(products)) {
    //         return false
    //     }
    //     await this.model.products().sync(products, null, this.trx)
    // }
}

module.exports = CouponService