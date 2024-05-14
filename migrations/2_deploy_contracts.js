const FlightSuretyApp = artifacts.require("FlightSuretyApp")
const FlightSuretyData = artifacts.require("FlightSuretyData")
const fs = require("fs")

module.exports = async function (deployer, network, accounts) {
  let firstAirline = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
  deployer.deploy(FlightSuretyData).then(() => {
    return deployer
      .deploy(FlightSuretyApp, FlightSuretyData.address)
      .then(() => {
        let config = {
          localhost: {
            url: "http://localhost:8545",
            dataAddress: FlightSuretyData.address,
            appAddress: FlightSuretyApp.address,
          },
        }
        fs.writeFileSync(
          __dirname + "/../src/dapp/config.json",
          JSON.stringify(config, null, "\t"),
          "utf-8"
        )
        fs.writeFileSync(
          __dirname + "/../src/server/config.json",
          JSON.stringify(config, null, "\t"),
          "utf-8"
        )
      })
  })
  // let firstAirline = accounts[1]
  // await deployer.deploy(FlightSuretyData)
  // const flightSuretyData = await FlightSuretyData.deployed()
  // await deployer.deploy(FlightSuretyApp, flightSuretyData.address)
  // const flightSuretyApp = await FlightSuretyApp.deployed()
  // // Authorize the FlightSuretyApp contract to call functions in FlightSuretyData
  // await flightSuretyData.authorizeCaller(flightSuretyApp.address, {
  //   from: accounts[0],
  // })
  // let config = {
  //   localhost: {
  //     url: "http://localhost:8545",
  //     dataAddress: flightSuretyData.address,
  //     appAddress: flightSuretyApp.address,
  //   },
  // }
  // fs.writeFileSync(
  //   __dirname + "/../src/dapp/config.json",
  //   JSON.stringify(config, null, "\t"),
  //   "utf-8"
  // )
  // fs.writeFileSync(
  //   __dirname + "/../src/server/config.json",
  //   JSON.stringify(config, null, "\t"),
  //   "utf-8"
  // )
}
