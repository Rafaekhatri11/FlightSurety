var FlightSuretyApp = artifacts.require("FlightSuretyApp")
var FlightSuretyData = artifacts.require("FlightSuretyData")
var BigNumber = require("bignumber.js")

var Config = async function (accounts) {
  // These test addresses are useful when you need to add
  // multiple users in test scripts
  let testAddresses = [
    "0x8155c55938fc8b4571fe696f39a9993442b86034",
    "0x25c25d2825725031f8b4e300ecf8beb6eb53f9fe",
    "0xc9fd264b63e81bf954282bb70fc80c41dbbe1e82",
    "0xd0d60d258c6fca0a3be9395d6a8bfae635d81d63",
    "0xfb1217309b5d27085a08dee381051bd04a661cbf",
    "0xd0dce65370e79d5f5733954ce680261b2b367e3c",
    "0x37a71c7630cc95dc8f70800014ad39399f4b6d34",
    "0xfd569404ae9891b907cd6776e6b968e2a4975971",
    "0x339c4d0fcd20fa1e2c104d01ee53614b12947e35",
    "0x9908d3512fe82ea8397e35a6c9200dd8a1d07327",
  ]

  let owner = accounts[0]
  let firstAirline = accounts[1]

  let flightSuretyData = await FlightSuretyData.new()
  let flightSuretyApp = await FlightSuretyApp.new()

  return {
    owner: owner,
    firstAirline: firstAirline,
    weiMultiple: new BigNumber(10).pow(18),
    testAddresses: testAddresses,
    flightSuretyData: flightSuretyData,
    flightSuretyApp: flightSuretyApp,
  }
}

module.exports = {
  Config: Config,
}
