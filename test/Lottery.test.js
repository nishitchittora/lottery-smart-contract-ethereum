const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require("../compile");

// only deploy a contract when we have access to external account
let accounts, lottery;
beforeEach(async ()=>{
    // Get a list of Unlock accounts from ganache
    accounts = await web3.eth.getAccounts()

    // Use one of those account to deploy contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
        data: bytecode
    }).send({from: accounts[0], gas: '1000000'});

});


describe("Lottery Contract", ()=>{
    it("deploys", ()=>{
        assert.ok(lottery.options.address);
    });

    it("allow one account", async ()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        });

        const player = await lottery.methods.getPlayers.call({
            from: accounts[0]
        });
        assert.equal(accounts[0], player[0]);
        assert.equal(1, player.length);
    });

    it("allow multiple account", async ()=>{
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("1", "ether")
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("1", "ether")
        });

        const player = await lottery.methods.getPlayers.call({
            from: accounts[0]
        });
        assert.equal(accounts[1], player[1]);
        assert.equal(accounts[2], player[2]);
        assert.equal(3, player.length);
    });

    it("require a min amount of ether", async ()=>{
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false)
        }catch(err){
            assert(err);
        }
    });

    it("only manager can pickWinner", async()=>{
        try{
            await lottery.methods.pickWinner().send({
              from: accounts[1]
            });
            assert(false)
        } catch(err){
          assert(err)
        }
    });

    it("end to end test", async()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("1", "ether")
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("1", "ether")
        });

        const initialBalance0 = await web3.eth.getBalance(accounts[0]);
        const initialBalance1 = await web3.eth.getBalance(accounts[1]);
        const initialBalance2 = await web3.eth.getBalance(accounts[2]);
        console.log("Amount of ether for account 0", initialBalance0);
        console.log("Amount of ether for account 1", initialBalance1);
        console.log("Amount of ether for account 2", initialBalance2);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })

        const finalBalance0 = await web3.eth.getBalance(accounts[0]);
        const finalBalance1 = await web3.eth.getBalance(accounts[1]);
        const finalBalance2 = await web3.eth.getBalance(accounts[2]);
        console.log("Amount of ether for account 0", finalBalance0);
        console.log("Amount of ether for account 1", finalBalance1);
        console.log("Amount of ether for account 2", finalBalance2);

        assert(true);

    })
})
