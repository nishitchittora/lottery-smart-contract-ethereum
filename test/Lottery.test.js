const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require("../compile");

// only deploy a contract when we have access to external account
let accounts, inbox, INITIAL_STRING="Hi there";
beforeEach(async ()=>{
    // Get a list of Unlock accounts from ganache
    accounts = await web3.eth.getAccounts()


    // Use one of those account to deploy contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
        data: bytecode,
        arguments: [INITIAL_STRING]
    }).send({from: accounts[0], gas: '1000000'});

});


describe("Inbox", ()=>{
    it("deploy a contract", ()=>{
        assert.ok(inbox.options.address);
    });

    it("Default value for constructor", async()=>{
          const message = await inbox.methods.message().call();
          assert.equal(message, INITIAL_STRING)
    });

    it("can change the message", async()=>{
        let t =await inbox.methods.setMessage("Bye there!").send({
            from: accounts[0]
        })
        console.log(t);
        const message = await inbox.methods.message().call();
        assert.equal(message, "Bye there!");
    });

})
