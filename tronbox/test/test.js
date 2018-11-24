var Test = artifacts.require('Test');
contract('Test', async(accounts) => {
    it("Buy", async() => {
        let test = await Test.deployed();
        let tx = await test.buy.call({from: accounts[0], callValue: 10});
        console.log(tx);
        let result = await test.getValue();
        console.log(result.toNumber());
        assert.equal(result.toNumber(), 10);
    });
});