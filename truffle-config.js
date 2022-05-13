module.exports = {
  contracts_build_directory: './frontend/src/contracts',

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" ,// Match any network id
      from: "0x9Ab2270AC4F8b2Fb26ACb020FCEF95E7c7438169"
    },
    develop: {
      port: 8545
    }
  }
};
