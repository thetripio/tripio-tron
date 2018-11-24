var TripioRoomNightData = artifacts.require("TripioRoomNightData");
var TripioRoomNightAdmin = artifacts.require("TripioRoomNightAdmin");
var TripioRoomNightVendor = artifacts.require("TripioRoomNightVendor");
var TripioRoomNightCustomer = artifacts.require("TripioRoomNightCustomer");
var TripioTokenOnline = artifacts.require('TripioTokenOnline');

var dataInstance = null;
var adminInstance = null;
var trioInstance = null;
var vendorInstance = null;
var customerInstance = null;
contract('TripioRoomNightCustomer', async(accounts) => {
    accounts[1] = 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY';
    let account0Hex = tronWeb.address.toHex(accounts[0]);
    let account1Hex = tronWeb.address.toHex(accounts[1]);
    it("Authorize", async() => {
        dataInstance = await TripioRoomNightData.deployed();
        adminInstance = await TripioRoomNightAdmin.deployed();
        vendorInstance = await TripioRoomNightVendor.deployed();
        trioInstance = await TripioTokenOnline.deployed();
        customerInstance = await TripioRoomNightCustomer.deployed();
        
        let customerAddress = tronWeb.address.fromHex(customerInstance.address);
        let txt = await tronWeb.trx.sendTransaction(customerAddress, 100, '695dccd15947b91ce7620880f7cef46eba15447b3c83c2ce71ef57d6e432a8b9');
        
        await dataInstance.authorizeContract(customerInstance.address, 'Customer');
        await dataInstance.authorizeContract(adminInstance.address, 'Admin');
        await dataInstance.authorizeContract(vendorInstance.address, 'Vendor');
        let result = await dataInstance.getAuthorizeContractIds(0, 3);
        assert.equal(result[0].length, 3);
    });

    it("Create rate plan", async() => {
        let ipfs = '0xa1001394f749d9a0c5f27761b2f08e9432ce215dad6f01dbe26e468857169cbb';
        await vendorInstance.createRatePlan('无早-大床房', ipfs);
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = (result[0][0]).toNumber();
        result = await vendorInstance.ratePlanOfVendor(1, rpid)
        assert.equal(result._ipfs, ipfs)
    });

    it("Update price and inventory", async() => {
        // 启用Token转账
        await trioInstance.enableTransfer();

        // 预留一个Token
        await adminInstance.addToken(trioInstance.address);
        var result = await adminInstance.supportedTokens(0, 1);
        let tokenId = (result[0][0]).toNumber();
        result = await adminInstance.getToken(tokenId);
        let symbol = result._symbol;
        // let name = result._name;
        let decimals = result._decimals;
        let _symbol = await trioInstance.symbol();
        // let _name = await trioInstance.name();
        // console.log(_name);
        let _decimals = await trioInstance.decimals();
        assert.equal(symbol, _symbol);
        // assert.equal(name, _name);
        assert.equal(decimals, _decimals);

        result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = (result[0][0]).toNumber();

        // 更新价格
        let ethPrice = 10;
        let tokenPrice = 100000;
        let inventory = 2;
        await vendorInstance.updatePrices(rpid, [20180725,20180726], inventory, [0, tokenId], [ethPrice, tokenPrice])
        result = await vendorInstance.priceOfDate(1, rpid, 20180725, 1);
        let price = result._price;
        inventory = result._inventory;
        assert.equal(price, tokenPrice);
        assert.equal(inventory, 2);
    });

    it("BuyInBatch", async() => {
        let tokenPrice = 200000;
        await trioInstance.approve(customerInstance.address, tokenPrice);
        await customerInstance.buyInBatch(1, 1, [20180725,20180726], 1);
        var result = await customerInstance.roomNightsOfOwner(0, 10, false);
        assert(result[0].length == 2);

        let trxPrice = 20;
        await customerInstance.buyInBatch(1, 1, [20180725,20180726], 0, {from: accounts[0], callValue: trxPrice});
        result = await customerInstance.roomNightsOfOwner(0, 10, false);
        assert(result[0].length == 4);

        result = await vendorInstance.priceOfDate(1, 1, 20180725, 1);
        let inventory = result._inventory;
        assert.equal(inventory, 0);
    });

    

    // it("Room night approval", async() => {
    //     // 查询account1的Token
    //     var result = await customerInstance.roomNightsOfOwner(0, 2, false, {from: accounts[1]});
    //     let rnid0 = result[0][0].toNumber();

    //     // 授权account0可以操作rnid0
    //     await customerInstance.approve(accounts[0], rnid0, {from: accounts[1]});
        
    //     // 从account1转移到account0, 并校验结果
    //     await customerInstance.transferFrom(accounts[1], accounts[0], rnid0);
    //     result = await customerInstance.ownerOf(rnid0);
    //     assert.equal(result, account0Hex);

    //     var result = await customerInstance.balanceOf(accounts[0]);
    //     assert.equal(result.toNumber(), 4);

    // })

    // it("Room night approval for all", async() => {
    //     // account0 授权 account1可以操作自己的token
    //     await customerInstance.setApprovalForAll(accounts[1], true);

    //     var result = await customerInstance.isApprovedForAll(accounts[0], accounts[1]);
    //     assert.equal(result, true);

    //      // 查询account1的Token
    //     result = await customerInstance.roomNightsOfOwner(0, 2, false);
    //     let rnid0 = result[0][0].toNumber();

    //     // 从account1转移到account0, 并校验结果
    //     await customerInstance.transferFrom(accounts[0], accounts[1], rnid0, {from : accounts[1]});
    //     result = await customerInstance.ownerOf(rnid0);
    //     assert.equal(result, account1Hex);

    //     await customerInstance.setApprovalForAll(accounts[1], false);
    //     result = await customerInstance.isApprovedForAll(accounts[0], accounts[1]);
    //     assert.equal(result, false);
    // });

    it("Update baseURI", async() => {
        await adminInstance.updateBaseTokenURI('https://ipfs.io/ipfs/');
        assert.equal(1, 1);
    });

    it("Roon night infomation", async() => {
        var result = await customerInstance.roomNightsOfOwner(0, 2, false);
        let rnid0 = result[0][0].toNumber();
        let rnid1 = result[0][1].toNumber();
        
        result = await customerInstance.roomNight(rnid0);
        assert.equal(result._vendorId, 1);
        result = await customerInstance.roomNight(rnid1);
        assert.equal(result._vendorId, 1);

        result = await customerInstance.tokenURI(rnid0);
        assert.equal('https://ipfs.io/ipfs/QmZB8R7T5xvKJDUJ6pXtUym6frQx1r6bQPcwquR1rtGHL6', result);
    });

    it("Room night amount", async() => {
        var result = await customerInstance.balanceOf(accounts[0]);
        assert.equal(result.toNumber(), 4);
    });

    it("Room night owner", async() => {
        var result = await customerInstance.roomNightsOfOwner(0, 2, false);
        let rnid0 = result[0][0].toNumber();

        result = await customerInstance.ownerOf(rnid0);
        assert.equal(result, account0Hex);
    });

    it("Room night transfer", async() => {
        var result = await customerInstance.roomNightsOfOwner(0, 2, false);
        let rnid0 = result[0][0].toNumber();
        await customerInstance.safeTransferFrom(accounts[0], accounts[1], rnid0);
        result = await customerInstance.ownerOf(rnid0);
        assert.equal(result, account1Hex);
    });

    it("Withdraw_0", async() => {
        let customerAddress = tronWeb.address.fromHex(customerInstance.address);
        var result = await tronWeb.trx.getBalance(customerAddress);
        assert.equal(result, 100);

        // eth 提现
        await customerInstance.withdrawBalance();

        // 启用Token转账
        await trioInstance.enableTransfer();
        await trioInstance.transfer(customerInstance.address, 10000);

        result = await trioInstance.balanceOf(customerInstance.address);
        assert.equal(result.balance, 10000);

        await customerInstance.withdrawToken(trioInstance.address);
        result = await trioInstance.balanceOf(customerInstance.address);
        assert.equal(result.balance, 0);
    });

    it('Waiting', async() => {
        await new Promise(function (resolve, reject) {
            var timeOut = 10;
            setTimeout(function () {
                resolve('200 OK');
            }, timeOut * 1000);
        });
    });

    it("Withdraw_1", async() => {
        let customerAddress = tronWeb.address.fromHex(customerInstance.address);
        let result = await tronWeb.trx.getBalance(customerAddress);
        assert.equal(result, 0);
    });
});