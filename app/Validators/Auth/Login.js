'use strict'

class AuthLogin {
  get rules () {
    return {
      // validation rules
      email: 'required|email',
      password: 'required'
    }
  }

  get messages() {
    return {
      'email.required': 'O campo e-mail é obrigatório.',
      'email.email': 'O campo e-mail está inválido.',
      'password.required': 'O campo senha é obrigatório.',
    }
  }
}

module.exports = AuthLogin
