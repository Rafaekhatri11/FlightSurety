var Test = require("../config/testConfig.js")
//var BigNumber = require('bignumber.js');

contract("Oracles", async (accounts) => {
  const TEST_ORACLES_COUNT = 9
  var config
  before("setup contract", async () => {
    config = await Test.Config(accounts)

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0
    const STATUS_CODE_ON_TIME = 10
    const STATUS_CODE_LATE_AIRLINE = 20
    const STATUS_CODE_LATE_WEATHER = 30
    const STATUS_CODE_LATE_TECHNICAL = 40
    const STATUS_CODE_LATE_OTHER = 50
  })

  it("Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory", async () => {
    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call()

    // ACT
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      await config.flightSuretyApp.registerOracle({
        from: accounts[a],
        value: fee,
      })
      let result = await config.flightSuretyApp.getMyIndexes.call({
        from: accounts[a],
      })
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`)
      assert.equal(
        result.length,
        3,
        "Oracle should be registered with three indexes"
      )
    }
  })

  it("Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code", async () => {
    // ARRANGE
    let flight = "UdacityAir" // Course number
    let timestamp = Math.floor(Date.now() / 1000)

    // Submit a request for oracles to get status information for a flight
    await config.flightSuretyApp.fetchFlightStatus(
      config.firstAirline,
      flight,
      timestamp
    )
    // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({
        from: accounts[a],
      })

      let ether = await config.flightSuretyApp.REGISTRATION_FEE.call()
      console.log("ETHER :::: ************* ", ether)

      for (let idx = 0; idx < 3; idx++) {
        // console.log("IDX ------ : ", oracleIndexes[idx])
        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(
            oracleIndexes[idx],
            config.firstAirline,
            flight,
            timestamp,
            STATUS_CODE_ON_TIME,
            { from: accounts[a] }
          )
        } catch (e) {
          // Enable this when debugging
          console.log(
            "\nError",
            idx,
            oracleIndexes[idx].toNumber(),
            flight,
            timestamp
          )
        }
      }
    }
  })

  //   it("(passenger) receives credit of 1.5X the amount they paid, if flight is delayed due to airline fault", async () => {
  //     // ARRANGE
  //     let price = await config.flightSuretyData.INSURANCE_PRICE_LIMIT.call()
  //     console.log("PRICE :::", price)
  //     let creditToPay = await config.flightSuretyData.getCreditToPay.call({
  //       from: config.firstPassenger,
  //     })

  //     console.log("CREDIT ::: ", creditToPay)
  //     const creditInWei = price * 1.5
  //     assert.equal(
  //       creditToPay,
  //       creditInWei,
  //       "Passenger should have 1,5 ether to withdraw."
  //     )
  //   })
})
