var HDWalletProvider = require("@truffle/hdwallet-provider")
var mnemonic =
  "spin leave badge hat guilt destroy test life village tail sugar unveil"

module.exports = {
  networks: {
    development: {
      // provider: function () {
      //   return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50)
      // },
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      // gas: 2000000000,
    },
  },
  compilers: {
    solc: {
      version: "^0.4.24",
    },
  },
}
