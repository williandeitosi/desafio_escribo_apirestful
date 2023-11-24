const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

router.post('/signup', async (req, res) => {
  try {
    const {
      nome, email, senha, telefone,
    } = req.body;

    const verificarUsuario = await User.findOne({ email });
    if (verificarUsuario) {
      return res.status(400).json({ mensagem: 'E-mail já existente' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);
    const novoUsuario = new User({
      nome,
      email,
      senha: hashedSenha,
      telefone,
    });

    await novoUsuario.save();

    const token = jwt.sign(
      { idUsuario: novoUsuario._id },
      process.env.JWT_SECRET,
      {
        expiresIn: parseInt(process.env.TOKEN_EXPIRATION),
      },
    );

    const respostaDados = {
      id: novoUsuario._id,
      data_criacao: novoUsuario.data_criacao,
      data_atualizacao: novoUsuario.data_atualizacao,
      ultimo_login: novoUsuario.ultimo_login,
      token,
    };

    res.status(201).json(respostaDados);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    const validarSenha = await bcrypt.compare(senha, usuario.senha);
    if (!validarSenha) {
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    usuario.ultimo_login = Date.now();
    await usuario.save();

    const token = jwt.sign({ idUsuario: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.TOKEN_EXPIRATION),
    });

    const respostaDados = {
      id: usuario._id,
      data_criacao: usuario.data_criacao,
      data_atualizacao: usuario.data_atualizacao,
      ultimo_login: usuario.ultimo_login,
      token,
    };
    res.json(respostaDados);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao autenticar usuário' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.idUsuario);
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      data_criacao: usuario.data_criacao,
      data_atualizacao: usuario.data_atualizacao,
      ultimo_login: usuario.ultimo_login,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ mensagem: 'Token inválido' });
    } if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ mensagem: 'Token expirado (mais de 30 minutos)' });
    }
    res.status(500).json({ mensagem: 'Erro ao buscar informações do usuário' });
  }
});

module.exports = router;
