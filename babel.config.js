module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' }   // compile for your current Node version
    }]
  ]
};