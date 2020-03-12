'use strict'

class AuthRegister {
  get rules () {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
    }
  }

  get messages() {
    return {
      'name.required': 'O campo nome é obrigatório.',
      'surname.required': 'O campo sobrenome é obrigatório.',
      'email.required': 'O campo e-mail é obrigatório.',
      'email.email': 'O campo e-mail está inválido.',
      'email.unique': 'O campo e-mail já está em uso no sistema.',
      'password.required': 'O campo senha é obrigatório.',
      'password.confirmed': 'As senhas não são iguais.',
    }
  }
}

module.exports = AuthRegister
