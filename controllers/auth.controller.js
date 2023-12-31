const { response } = require("express");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const { generarJWT } = require("../token/generar-jwt");

const crearUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let usuario = await userModel.findOne({ email });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario ya existe",
      });
    }

    usuario = new userModel(req.body);

    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      msg: "Registro Exitoso!",
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const usuario = await userModel.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "No se a encontrado ningun usuario con ese email",
      });
    }

    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Contraseña incorrecta",
      });
    }

    const token = await generarJWT(usuario.id, usuario.name);

    res.json({
      ok: true,
      msg: "Login Exitoso!",
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const revalidarToken = async (req, res = response) => {
  const { uid, name } = req;

  const token = await generarJWT(uid, name);

  res.json({
    ok: true,
    msg: "Token Renewed!",
    uid,
    name,
    token,
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
