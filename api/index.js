const { default: app } = require('../dist/index')
module.exports = app.fetch.bind(app)
