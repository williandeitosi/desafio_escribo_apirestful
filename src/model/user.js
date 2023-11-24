const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  telefone: [{ numero: String, ddd: String }],
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date },
  ultimo_login: { type: Date },
})

module.exports = mongoose.model("User", userSchema)