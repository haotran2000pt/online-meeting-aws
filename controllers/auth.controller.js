const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const bcrypt = require('bcrypt')

const register = catchAsync(async (req, res) => {
  req.body.password = await bcrypt.hash(req.body.password, 10);
  req.body.displayName = req.body.firstName + ' ' + req.body.lastName;

  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.CREATED).send({ user, tokens });
})

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
})

const loginWithGoogle = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const user = await authService.loginWithGoogle(idToken);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
})

const loginWithFacebook = catchAsync(async (req, res) => {
  const { accessToken } = req.body;
  const user = await authService.loginWithFacebook(accessToken);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
})

const refreshToken = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send(tokens);
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.password, 10)
  await authService.resetPassword(req.query.token, newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

const me = catchAsync(async (req, res) => {
  res.send(req.user)
});

module.exports = { register, login, sendVerificationEmail, verifyEmail, refreshToken, forgotPassword, resetPassword, me, loginWithGoogle, loginWithFacebook }
