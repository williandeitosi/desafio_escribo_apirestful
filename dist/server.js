var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/model/user.js
var require_user = __commonJS({
  "src/model/user.js"(exports, module2) {
    var mongoose2 = require("mongoose");
    var userSchema = new mongoose2.Schema({
      nome: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      senha: { type: String, required: true },
      telefone: [{ numero: String, ddd: String }],
      data_criacao: { type: Date, default: Date.now },
      data_atualizacao: { type: Date },
      ultimo_login: { type: Date }
    });
    module2.exports = mongoose2.model("User", userSchema);
  }
});

// src/routes/authRoutes.js
var require_authRoutes = __commonJS({
  "src/routes/authRoutes.js"(exports, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var bcrypt = require("bcryptjs");
    var jwt = require("jsonwebtoken");
    var User = require_user();
    router.post("/signup", async (req, res) => {
      try {
        const {
          nome,
          email,
          senha,
          telefone
        } = req.body;
        const verificarUsuario = await User.findOne({ email });
        if (verificarUsuario) {
          return res.status(400).json({ mensagem: "E-mail j\xE1 existente" });
        }
        const hashedSenha = await bcrypt.hash(senha, 10);
        const novoUsuario = new User({
          nome,
          email,
          senha: hashedSenha,
          telefone
        });
        await novoUsuario.save();
        const token = jwt.sign(
          { idUsuario: novoUsuario._id },
          process.env.JWT_SECRET,
          {
            expiresIn: parseInt(process.env.TOKEN_EXPIRATION)
          }
        );
        const respostaDados = {
          id: novoUsuario._id,
          data_criacao: novoUsuario.data_criacao,
          data_atualizacao: novoUsuario.data_atualizacao,
          ultimo_login: novoUsuario.ultimo_login,
          token
        };
        res.status(201).json(respostaDados);
      } catch (error) {
        res.status(500).json({ mensagem: "Erro ao cadastrar usu\xE1rio" });
      }
    });
    router.post("/signin", async (req, res) => {
      try {
        const { email, senha } = req.body;
        const usuario = await User.findOne({ email });
        if (!usuario) {
          return res.status(401).json({ mensagem: "Usu\xE1rio e/ou senha inv\xE1lidos" });
        }
        const validarSenha = await bcrypt.compare(senha, usuario.senha);
        if (!validarSenha) {
          return res.status(401).json({ mensagem: "Usu\xE1rio e/ou senha inv\xE1lidos" });
        }
        usuario.ultimo_login = Date.now();
        await usuario.save();
        const token = jwt.sign({ idUsuario: usuario._id }, process.env.JWT_SECRET, {
          expiresIn: parseInt(process.env.TOKEN_EXPIRATION)
        });
        const respostaDados = {
          id: usuario._id,
          data_criacao: usuario.data_criacao,
          data_atualizacao: usuario.data_atualizacao,
          ultimo_login: usuario.ultimo_login,
          token
        };
        res.json(respostaDados);
      } catch (error) {
        res.status(500).json({ mensagem: "Erro ao autenticar usu\xE1rio" });
      }
    });
    router.get("/users", async (req, res) => {
      try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await User.findById(decoded.idUsuario);
        if (!usuario) {
          return res.status(404).json({ mensagem: "Usu\xE1rio n\xE3o encontrado" });
        }
        res.json({
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          data_criacao: usuario.data_criacao,
          data_atualizacao: usuario.data_atualizacao,
          ultimo_login: usuario.ultimo_login
        });
      } catch (error) {
        if (error.name === "JsonWebTokenError") {
          return res.status(401).json({ mensagem: "Token inv\xE1lido" });
        }
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ mensagem: "Token expirado (mais de 30 minutos)" });
        }
        res.status(500).json({ mensagem: "Erro ao buscar informa\xE7\xF5es do usu\xE1rio" });
      }
    });
    module2.exports = router;
  }
});

// src/server.js
var express = require("express");
var mongoose = require("mongoose");
require("dotenv").config();
var authRoutes = require_authRoutes();
var app = express();
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("Conectado ao MongoDB")).catch((err) => console.error("Erro ao conectar ao MongoDB:", err));
app.use("/auth", authRoutes);
var PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
