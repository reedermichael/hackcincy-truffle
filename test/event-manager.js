let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.12.226:8545'));
let pasync = require('pasync');

let EventManager = artifacts.require("./EventManager.sol");
let Event = artifacts.require("./Event.sol");
let Ticket = artifacts.require("./Ticket.sol");

web3.utils.toAsciiOriginal = web3.utils.toAscii;
web3.utils.toAscii = function(input) { return web3.utils.toAsciiOriginal(input).replace(/\u0000/g, '') };

function deployed() {
  return EventManager.deployed();
}

function guidGenerator() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

contract('EventManager', function(accounts) {
  it('should init manager', function() {
    return deployed().then((terrapin) => terrapin.owner.call())
      .then((ownerAddress) => {
        assert(ownerAddress === accounts[0]);
        // assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
      });
  });

  // it.only('should create 5 events', function() {
  //   let terrapin;
  //   return deployed().then((_terrapin) => {
  //     terrapin = _terrapin; // make global for use in later "then"s
  //     // console.log(JSON.stringify(terrapin.abi, null, '  '), terrapin.address);
  //     let numTimes = [ 1, 2, 3, 4, 5, 6 ];
  //     return pasync.eachSeries(numTimes, () => {
  //       return terrapin.createEvent(
  //         guidGenerator(),
  //         {
  //           from: accounts[1],
  //           gas: 4700000
  //         }
  //       )
  //         .then((tx) => {
  //           return new Promise((resolve) => {
  //             setTimeout(() => {
  //               resolve(tx);
  //             }, 5000);
  //           });
  //         })
  //         .then((tx) => web3.eth.getTransactionReceipt(tx.tx))
  //         .then((test) => {
  //           console.log('test:', test);
  //         });
  //     });
  //   });
  // });

  it.only('should create an event and issue tickets', function() {
    let eventName = 'Phish @ MSG';
    let price = 50;

    let terrapin;
    return deployed().then((_terrapin) => {
      terrapin = _terrapin; // make global for use in later "then"s
      // console.log(JSON.stringify(terrapin.abi, null, '  '), terrapin.address);
      return terrapin.createEvent(
        eventName,
        {
          from: accounts[1],
          gas: 4700000
        });
    })
      .then((tx) => terrapin.getEvents.call())
      .then((eventAddresses) => {
        let eventInstance = Event.at(eventAddresses[0]);
        return eventInstance.name.call()
          .then((name) => {
            name = web3.utils.toAscii(name);
            // ensure name of instance is what we published
            assert(name === eventName);
          })
          // test tickets
          .then(() => {
            // shuuld be done with doWhielst
            let numTickets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            return pasync.eachSeries(numTickets, () => {
              return eventInstance.printTicket(price, {
                from: accounts[1],
                gas: 4700000
              }).then((tx) => {
                console.log(tx);
              });
            });
          })
          .then(() => eventInstance.getTickets.call())
          .then((tickets) => {
            return pasync.eachSeries(tickets, (ticketAddr) => {
              let ticketInstance = Ticket.at(ticketAddr);
              // console.log(ticketInstance);
              return ticketInstance.owner.call()
                .then((owner) => {
                  assert(owner === accounts[1]);
                });
            });
          });
      });
  });

  // it('should', function() {
  //   return x;
  // });
});

// it("should put 10000 MetaCoin in the first account", function() {
//   return MetaCoin.deployed().then(function(instance) {
//     return instance.getBalance.call(accounts[0]);
//   }).then(function(balance) {
//     assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
//   });
// });
// it("should call a function that depends on a linked library", function() {
//   var mewta;
//   var metaCoinBalance;
//   var metaCoinEthBalance;
//
//   return MetaCoin.deployed().then(function(instance) {
//     meta = instance;
//     return meta.getBalance.call(accounts[0]);
//   }).then(function(outCoinBalance) {
//     metaCoinBalance = outCoinBalance.toNumber();
//     return meta.getBalanceInEth.call(accounts[0]);
//   }).then(function(outCoinBalanceEth) {
//     metaCoinEthBalance = outCoinBalanceEth.toNumber();
//   }).then(function() {
//     assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
//   });
// });
// it("should send coin correctly", function() {
//   var meta;
//
//   // Get initial balances of first and second account.
//   var account_one = accounts[0];
//   var account_two = accounts[1];
//
//   var account_one_starting_balance;
//   var account_two_starting_balance;
//   var account_one_ending_balance;
//   var account_two_ending_balance;
//
//   var amount = 10;
//
//   return MetaCoin.deployed().then(function(instance) {
//     meta = instance;
//     return meta.getBalance.call(account_one);
//   }).then(function(balance) {
//     account_one_starting_balance = balance.toNumber();
//     return meta.getBalance.call(account_two);
//   }).then(function(balance) {
//     account_two_starting_balance = balance.toNumber();
//     return meta.sendCoin(account_two, amount, {from: account_one});
//   }).then(function() {
//     return meta.getBalance.call(account_one);
//   }).then(function(balance) {
//     account_one_ending_balance = balance.toNumber();
//     return meta.getBalance.call(account_two);
//   }).then(function(balance) {
//     account_two_ending_balance = balance.toNumber();
//
//     assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
//     assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
//   });
// });
