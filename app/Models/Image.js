'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Env = use('Env')

class Image extends Model {

    static get computed() {
        return ['url']
    }

    getURL({ path }) {
        return `${Env.get('APP_URL')}/uploads/${path}`
    }

}

module.exports = Image
