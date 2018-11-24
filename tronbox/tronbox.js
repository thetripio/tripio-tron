module.exports = {
  solc: {
        optimizer: {
          enabled: true,
          runs: 200
        }
  },
  networks: {
    development: {
      from: 'TLqsnzxEWWe6UWDiZcAaQyZjqtNiH68zoH',
      privateKey: '695dccd15947b91ce7620880f7cef46eba15447b3c83c2ce71ef57d6e432a8b9',
      consume_user_resource_percent: 30,
      fee_limit: 100000000,
      host: "https://api.trongrid.io",
      port: 8090,
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",
      network_id: "*" // Match any network id
    },
    production: {}
  }
};
