var TripioRoomNightData = artifacts.require("TripioRoomNightData");
var TripioRoomNightAdmin = artifacts.require("TripioRoomNightAdmin");
var TripioRoomNightVendor = artifacts.require("TripioRoomNightVendor");
var TripioTokenOnline = artifacts.require('TripioTokenOnline');

var dataInstance = null;
var adminInstance = null;
var trioInstance = null;
var vendorInstance = null;
contract('TripioRoomNightVendor', async(accounts) => {
    it("Authorize", async() => {
        dataInstance = await TripioRoomNightData.deployed();
        adminInstance = await TripioRoomNightAdmin.deployed();
        vendorInstance = await TripioRoomNightVendor.deployed();
        trioInstance = await TripioTokenOnline.deployed();
        await dataInstance.authorizeContract(adminInstance.address, 'Admin');
        await dataInstance.authorizeContract(vendorInstance.address, 'Vendor');
        let result = await dataInstance.getAuthorizeContractIds(0, 2);
        assert.equal(result[0].length, 2);
    });

    it("Add vendor", async() => {
        await adminInstance.addVendor(accounts[0], 'Kirn');
        let result = await adminInstance.getVendorIds(0, 1);
        let id = result[0].length;
        assert.equal(id, 1);
    });

    it("Create rate plan", async() => {
        let ipfs = '0xa1001394f749d9a0c5f27761b2f08e9432ce215dad6f01dbe26e468857169cbb';
        await vendorInstance.createRatePlan('Superior Queen', ipfs);
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        result = await vendorInstance.ratePlanOfVendor(1, rpid);
        assert.equal(result._ipfs, ipfs);
    });

    it("Modify rate plan" , async() => {
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();

        let ipfs = '0xa1001394f749d9a0c5f27761b2f08e9432ce215dad6f01dbe26e468857169cbb';
        let name = 'Club King';
        await vendorInstance.modifyRatePlan(rpid, name, ipfs);
        
        result = await vendorInstance.ratePlanOfVendor(1, rpid)
        assert.equal(result._name, name)
    });

    it("Remove rate plan", async() => {
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();

        await vendorInstance.removeRatePlan(rpid);
        
        result = await vendorInstance.ratePlansOfVendor(1, 0, 1);

        assert.equal(result[0].length, 0)
    });

    it("Update price and inventory", async() => {
        // rate plan
        let ipfs = '0xa1001394f749d9a0c5f27761b2f08e9432ce215dad6f01dbe26e468857169cbb';
        await vendorInstance.createRatePlan('Superior King', ipfs);
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        result = await vendorInstance.ratePlanOfVendor(1, rpid)
        assert.equal(result._ipfs, ipfs)

        // token
        await adminInstance.addToken(trioInstance.address);
        result = await adminInstance.supportedTokens(0, 1);
        let tokenId = result[0][0].toNumber();
        result = await adminInstance.getToken(tokenId);
        let symbol = result._symbol;
        // let name = result._name;
        let decimals = result._decimals;
        let _symbol = await trioInstance.symbol.call();
        // let _name = await trioInstance.name.call();
        let _decimals = await trioInstance.decimals.call();
        assert.equal(symbol, _symbol);
        // assert.equal(name, _name);
        assert.equal(decimals, _decimals);

        // update price
        let tokenPrice = 100000;

        await vendorInstance.updatePrices(rpid, [20180725,20180726], 1, [0, tokenId], [10000, 100000])

        result = await vendorInstance.priceOfDate(1, rpid, 20180725, 1);
        let price = result._price;
        let inventory = result._inventory;
        assert.equal(price, tokenPrice);
        assert.equal(inventory, 1);
    });

    it("Get price", async() => {
        // 
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        let tokenPrice = 100000;
        let ethPrice = 10000;
        result = await vendorInstance.pricesOfDate(1, rpid, [20180725, 20180726], 1);
        assert.equal(tokenPrice, result[0].toNumber());
        result = await vendorInstance.pricesOfDate(1, rpid, [20180725, 20180726], 0);
        assert.equal(ethPrice, result[1].toNumber());
    });

    it("Update inventory only", async() => {
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        await vendorInstance.updateInventories(rpid, [20180725, 20180726], 2)
        result = await vendorInstance.inventoriesOfDate(1, rpid, [20180725, 20180726]);
        
        assert.equal(2, result[0]);
        assert.equal(2, result[1]);
    }); 

    it("Update price and inventory", async() => {
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        await vendorInstance.updatePrices(rpid, [20180725], 1, [0, 1], [10, 100]);

        result = await vendorInstance.priceOfDate.call(1, rpid, 20180725, 0);
        var price = result._price;
        var inventory = result._inventory;
        assert.equal(price, 10);
        assert.equal(inventory, 1);

        result = await vendorInstance.priceOfDate(1, rpid, 20180725, 1);
        price = result._price;
        inventory = result._inventory;
        assert.equal(price, 100);
        assert.equal(inventory, 1);

        await vendorInstance.updateInventories(rpid, [20180725], 2);
        result = await vendorInstance.priceOfDate(1, rpid, 20180725, 1);
        price = result._price;
        inventory = result._inventory;
        assert.equal(price, 100);
        assert.equal(inventory, 2);
    });

    it("Update base price", async() => {
        var result = await vendorInstance.ratePlansOfVendor(1, 0, 1);
        var rpid = result[0][0].toNumber();
        await vendorInstance.updateBasePrice(rpid, [0, 1], [10, 100], 1);
        
        result = await vendorInstance.priceOfDate(1, rpid, 20180801, 0);
        var price = result._price;
        var inventory = result._inventory;
        assert.equal(price, 10);
        assert.equal(inventory, 1);

        result = await vendorInstance.priceOfDate(1, rpid, 20180801, 1);
        price = result._price;
        inventory = result._inventory;
        assert.equal(price, 100);
        assert.equal(inventory, 1);
    });
});