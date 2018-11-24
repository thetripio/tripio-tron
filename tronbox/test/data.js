var LinkedListLib = artifacts.require("LinkedListLib");
var TripioRoomNightData = artifacts.require("TripioRoomNightData");
var TripioRoomNightAdmin = artifacts.require("TripioRoomNightAdmin");
var TripioRoomNightCustomer = artifacts.require("TripioRoomNightCustomer");
var TripioRoomNightVendor = artifacts.require("TripioRoomNightVendor");

contract('TripioRoomNightData', async(accounts) => {
    it("Authorize contract", async() => {
        let dataInstance = await TripioRoomNightData.deployed();
        let adminInstance =  await TripioRoomNightAdmin.deployed();
        let customerInstance = await TripioRoomNightCustomer.deployed();
        let vendorInstance = await TripioRoomNightVendor.deployed();
        
        // 授权合约
        await dataInstance.authorizeContract(adminInstance.address, 'Admin');
        await dataInstance.authorizeContract(customerInstance.address, 'Customer');
        await dataInstance.authorizeContract(vendorInstance.address, 'Vendor');

        // 查询所有授权合约
        var result = await dataInstance.getAuthorizeContractIds(0, 3);
        var ids = result[0];
        for (let i = 0; i < ids.length; i++) {
            let id = (ids[i]).toNumber();
            let contractInfo = await dataInstance.getAuthorizeContract(id);

            if(contractInfo[0] === 'Admin') {
                assert.equal(adminInstance.address, contractInfo._acontract);
            }else if(contractInfo[0] === 'Customer') {
                assert.equal(customerInstance.address, contractInfo._acontract);
            }else if(contractInfo[0] === 'Vendor') {
                assert.equal(vendorInstance.address, contractInfo._acontract);
            }

            // 解除授权
            await dataInstance.deauthorizeContractById(id);
        }

        // 再次查询
        result = await dataInstance.getAuthorizeContractIds(0, 3);
        ids = result[0].length;
        assert.equal(ids, 0);
    });
});