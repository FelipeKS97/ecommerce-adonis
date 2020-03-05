'use strict'

class AuthLogin {
  get rules () {
    return {
      // validation rules
      email: 'required|email',
      password: 'required'
    }
  }
}

module.exports = AuthLogin
