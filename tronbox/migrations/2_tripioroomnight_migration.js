let LinkedListLib = artifacts.require("LinkedListLib");
let TripioRoomNightData = artifacts.require('TripioRoomNightData');
let TripioRoomNightAdmin = artifacts.require('TripioRoomNightAdmin');
let TripioRoomNightCustomer = artifacts.require('TripioRoomNightCustomer');
let TripioRoomNightVendor = artifacts.require('TripioRoomNightVendor');
let TripioTokenOnline = artifacts.require('TripioTokenOnline');
let Test = artifacts.require('Test');
module.exports = function(deployer, network ,accounts) {
    // deploy TripioTokenOnline
    deployer.deploy(TripioTokenOnline);

    // deploy LinkedListLib
    deployer.deploy(LinkedListLib);

    // deploy TripioRoomNightData
    deployer.link(LinkedListLib, TripioRoomNightData);

    deployer.deploy(TripioRoomNightData).then(function() {
        // deploy TripioRoomNightAdmin
        return deployer.deploy(TripioRoomNightAdmin, TripioRoomNightData.address);
    }).then(function() {
         // deploy TripioRoomNightCustomer
        return deployer.deploy(TripioRoomNightCustomer, TripioRoomNightData.address);
    }).then(function() {
        // deploy TripioRoomNightVendor
        return deployer.deploy(TripioRoomNightVendor, TripioRoomNightData.address);
    });
};
