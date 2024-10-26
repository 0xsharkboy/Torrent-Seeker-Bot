const { readdirSync } = require("fs")

module.exports = (bot) => {
  const srcDir = './src/'
  for (const file of readdirSync(srcDir).filter(file => file.endsWith('.js'))) {
    require(srcDir + file)(bot)
  }
}