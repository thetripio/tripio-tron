var TripioRoomNightData = artifacts.require("TripioRoomNightData");
var TripioRoomNightAdmin = artifacts.require("TripioRoomNightAdmin");
var TripioTokenOnline = artifacts.require('TripioTokenOnline');
var TripioTokenOnline = artifacts.require('TripioTokenOnline');

contract('TripioRoomNightAdmin', async(accounts) => {
    var dataInstance = null;
    var adminInstance = null;
    var trioInstance = null;
    it("Authorize", async() => {
        dataInstance = await TripioRoomNightData.deployed();
        adminInstance = await TripioRoomNightAdmin.deployed();
        trioInstance = await TripioTokenOnline.deployed();
        await dataInstance.authorizeContract(adminInstance.address, 'Admin');
        let result = await dataInstance.getAuthorizeContractIds(0, 1);
        assert.equal(result[0].length, 1);
    });

    it("Add vendor", async() => {
        await adminInstance.addVendor(accounts[0], 'Kirn');
        let result = await adminInstance.getVendorIds(0, 1);
        let id = result[0].length;
        assert.equal(id, 1);
    });

    it("Remove vendor by address", async() => {
        let adminInstance = await TripioRoomNightAdmin.deployed();

        // 检查原有数据
        let result = await adminInstance.getVendorIds(0, 1);
        let id = result[0].length;
        assert.equal(id, 1);

        // 删除原有数据
        await adminInstance.removeVendorByAddress(accounts[0]);
        result = await adminInstance.getVendorIds(0, 1);
        
        id = result[0].length;
        assert.equal(id, 0);
    });

    it("Remove vendor by id", async() => {
        let adminInstance = await TripioRoomNightAdmin.deployed();

        await adminInstance.addVendor(accounts[0], 'Kirn');
        let result = await adminInstance.getVendorIds(0, 1);
        let id = result[0].length;
        assert.equal(id, 1);

        // 删除原有数据
        await adminInstance.removeVendorById((result[0][0]).toNumber());
        result = await adminInstance.getVendorIds(0, 1);
        
        id = result[0].length;
        assert.equal(id, 0);
    });

    it("Enable or disable vendor", async() => {
        let adminInstance = await TripioRoomNightAdmin.deployed();

        await adminInstance.addVendor(accounts[0], 'Kirn');
        result = await adminInstance.getVendorIds(0, 1);
        let id = result[0].length;
        assert.equal(id, 1);

        // 禁用
        let vid = (result[0][0]).toNumber();
        await adminInstance.makeVendorValid(vid, false);
        result = await adminInstance.getVendor(vid);
        assert.equal(result._valid, false);
        // 启用
        await adminInstance.makeVendorValid(vid, true);
        result = await adminInstance.getVendor(vid);
        assert.equal(result._valid, true);
    });

    it("Get vendor by id", async() => {
        var result = await adminInstance.getVendorIds(0, 1);
        let vid = (result[0][0]).toNumber();
        result = await adminInstance.getVendor(vid);
        assert.equal(result._vendor, '417746701c2de9a6126281a0272a31e4176078a6fe');
    });

    it("Get vendor by address", async() => {
        var result = await adminInstance.getVendorIds(0, 1);
        let vid = (result[0][0]).toNumber();
        result = await adminInstance.getVendorByAddress(accounts[0]);
        assert.equal(result._vendorId.toNumber(), vid, "查询失败");
    });

    it("Add token", async() => {
        await adminInstance.addToken(trioInstance.address);
        var result = await adminInstance.supportedTokens(0, 1);
        result = await adminInstance.getToken((result[0][0]).toNumber());
        let symbol = result._symbol;
        let name = result._name;
        let decimals = result._decimals;
        let _symbol = await trioInstance.symbol();
        // let _name = await trioInstance.name();
        let _decimals = await trioInstance.decimals();
        assert.equal(symbol, _symbol, "添加失败");
        // assert.equal(name, _name, "添加失败");
        assert.equal(decimals, _decimals, "添加失败");
        console.log(result);
    });

    it("Remove token", async() => {
        var result = await adminInstance.supportedTokens(0, 1);
        assert.equal(result[0].length, 1, "添加失败");
        await adminInstance.removeToken((result[0][0]).toNumber());
        result = await adminInstance.supportedTokens(0, 1);
        assert.equal(result[0].length, 0, "删除失败");
    });

    it("Update base uri", async() => {
        await adminInstance.updateBaseTokenURI('https://ipfs.io/ipfs/');
        assert.equal(1,1);
    });
});