var Test = require("../config/testConfig.js")
var BigNumber = require("bignumber.js")
// var { Web3 } = require("web3")

contract("Flight Surety Tests", async (accounts) => {
  console.log(accounts)
  const TEST_ORACLES_COUNT = 20
  const STATUS_CODE_LATE_AIRLINE = 20
  var config
  before("setup contract", async () => {
    config = await Test.Config(accounts)
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address,
      { from: accounts[0] }
    )

    console.log("BEFORE SETUP CONTRACT COMPLETED :..... ")
  })

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`App contract is authorized by Data contract`, async function () {
    // Get operating status

    let status = await config.flightSuretyData.isAuthorized.call(
      config.flightSuretyApp.address
    )
    assert.equal(status, true, "App contract should be authorized")
  })

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call()
    console.log("status-------------------------", status)
    assert.equal(status, true, "Incorrect initial operating status value")
  })

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: config.testAddresses[2],
      })
    } catch (e) {
      accessDenied = true
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner")
  })

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false
    try {
      await config.flightSuretyData.setOperatingStatus(false)
    } catch (e) {
      accessDenied = true
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner")
  })

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
    await config.flightSuretyData.setOperatingStatus(false)

    let reverted = false
    try {
      await config.flightSurety.setTestingMode(true)
    } catch (e) {
      reverted = true
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational")

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true)
  })

  it("Contract owner is registered as an airline when contract is deployed", async () => {
    let airlinesCount = await config.flightSuretyData.airlinesCount.call()
    let isAirline = await config.flightSuretyData.isAirline.call(accounts[0])
    assert.equal(
      isAirline,
      true,
      "First airline should be registired at contract deploy."
    )
    assert.equal(
      airlinesCount,
      1,
      "Airlines count should be one after contract deploy."
    )
  })

  it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let newAirline = accounts[2]

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: config.firstAirline,
      })
    } catch (e) {}
    let result = await config.flightSuretyData.isAirline.call(newAirline)

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    )
  })

  it("(airline) can register an Airline using registerAirline() directly without need of a consensus", async () => {
    // ARRANGE
    let funds = await config.flightSuretyData.MINIMUM_FUNDS.call()

    // ACT
    try {
      await config.flightSuretyData.fund({ from: accounts[0], value: funds })
      await config.flightSuretyApp.registerAirline(
        config.firstAirline,
        "dummy airline 2 name",
        { from: accounts[0] }
      )
    } catch (e) {
      console.log(e)
    }
    let airlinesCount = await config.flightSuretyData.airlinesCount.call()
    let result = await config.flightSuretyData.isAirline.call(
      config.firstAirline
    )

    // ASSERT
    assert.equal(
      result,
      true,
      "Airline should be able to register another airline directly if there are less than 4 registered"
    )
    assert.equal(
      airlinesCount,
      2,
      "Airlines count should be one after contract deploy."
    )
  })

  it("(airline) needs 50% votes to register an Airline using registerAirline() once there are 4 or more airlines registered", async () => {
    // ACT
    try {
      await config.flightSuretyApp.registerAirline(
        accounts[2],
        "dummy airline 3 name",
        { from: accounts[0] }
      )
      await config.flightSuretyApp.registerAirline(
        accounts[3],
        "dummy airline 4 name",
        { from: accounts[0] }
      )
      await config.flightSuretyApp.registerAirline(
        accounts[4],
        "dummy airline 5 name",
        { from: accounts[0] }
      )
    } catch (e) {
      console.log(e)
    }
    let result = await config.flightSuretyData.isAirline.call(accounts[4])
    let airlinesCount = await config.flightSuretyData.airlinesCount.call()

    console.log("result ::", result)
    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    )
    assert.equal(
      airlinesCount,
      4,
      "Airlines count should be one after contract deploy."
    )
  })

  it("(airline) can register a flight using registerFlight()", async () => {
    // ARRANGE
    flightTimestamp = Math.floor(Date.now() / 1000) //convert timestamp from miliseconds (javascript) to seconds (solidity)

    // ACT
    try {
      await config.flightSuretyApp.registerFlight(
        "Emirates",
        "Dubai",
        flightTimestamp,
        { from: config.firstAirline }
      )
    } catch (e) {
      // console.log(e)
    }
  })

  it("(passenger) may pay up to 1 ether for purchasing flight insurance.", async () => {
    // ARRANGE
    let price = await config.flightSuretyData.INSURANCE_PRICE_LIMIT.call()
    // ACT
    try {
      console.log("PRICE : ---------- ", price)
      await config.flightSuretyData.buy("Emirates", {
        from: config.firstPassenger,
        value: price,
      })
    } catch (e) {
      console.log(e)
    }

    let registeredPassenger =
      await config.flightSuretyData.passengerAddresses.call(0)
    assert.equal(
      registeredPassenger,
      config.firstPassenger,
      "Passenger should be added to list of people who bought a ticket."
    )
  })

  // it("Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory", async () => {
  //   // ARRANGE
  //   let fee = await config.flightSuretyApp.REGISTRATION_FEE.call()

  //   // ACT
  //   for (let a = 20; a < TEST_ORACLES_COUNT + 20; a++) {
  //     await config.flightSuretyApp.registerOracle({
  //       from: accounts[a],
  //       value: fee,
  //     })
  //     let result = await config.flightSuretyApp.getMyIndexes.call({
  //       from: accounts[a],
  //     })
  //     assert.equal(
  //       result.length,
  //       3,
  //       "Oracle should be registered with three indexes"
  //     )
  //   }
  // })

  it("(passenger) receives credit of 1.5X the amount they paid, if flight is delayed due to airline fault", async () => {
    // ARRANGE
    let price = await config.flightSuretyData.INSURANCE_PRICE_LIMIT.call()

    console.log(" price  ", price.toString())

    let creditToPay = await config.flightSuretyData.getCreditToPay.call({
      from: config.firstPassenger,
    })

    console.log(" creditToPaycreditToPay  ", creditToPay.toString())
    const creditInWei = price * 1.5
    console.log("creditInWeicreditInWeicreditInWei ", creditInWei.toString())
    assert.equal(
      creditToPay,
      creditInWei,
      "Passenger should have 1,5 ether to withdraw."
    )
  })

  //   it("(passenger) can withdraw any funds owed to them as a result of receiving credit for insurance payout", async () => {
  //     let creditToPay = await config.flightSuretyData.getCreditToPay.call({
  //       from: config.firstPassenger,
  //     })

  //     let passengerOriginalBalance = await web3.eth.getBalance(
  //       config.firstPassenger
  //     )
  //     let receipt = await config.flightSuretyData.pay({
  //       from: config.firstPassenger,
  //     })
  //     let passengerFinalBalance = await web3.eth.getBalance(config.firstPassenger)

  //     // Obtain total gas cost
  //     const gasUsed = Number(receipt.receipt.gasUsed)
  //     const tx = await web3.eth.getTransaction(receipt.tx)
  //     const gasPrice = Number(tx.gasPrice)

  //     let finalCredit = await config.flightSuretyData.getCreditToPay.call({
  //       from: config.firstPassenger,
  //     })

  //     assert.equal(
  //       finalCredit.toString(),
  //       0,
  //       "Passenger should have transfered the ethers to its wallet."
  //     )
  //     assert.equal(
  //       Number(passengerOriginalBalance) +
  //         Number(creditToPay) -
  //         gasPrice * gasUsed,
  //       Number(passengerFinalBalance),
  //       "Passengers balance should have increased the amount it had credited"
  //     )
  //   })
})
