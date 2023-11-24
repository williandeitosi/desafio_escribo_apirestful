const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));



  app.use('/auth', authRoutes);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});