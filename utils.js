const Dash = require("dash");

module.exports = {
  getClient: ()=>{
    const options = {
      network: 'testnet',
      dapiAddresses: [{
        host: '127.0.0.1',
        port: 1443,
        protocol: 'https',
        allowSelfSignedCertificate: true,
      }],
      wallet: {
        mnemonic: process.env.MNEMONIC,
        unsafeOptions: {
          skipSynchronizationBeforeHeight: 1150000,
        },
      },
      apps: {
        contract: {
          contractId: process.env.CONTRACT_ID,
        },
      }
    }

    return new Dash.Client(options)
  },
  stringToChunks: (str, size)=>{
    const chunks = []

    for (let i = 0; i < str.length / size; i++) {
      chunks.push(str.slice(i * size, (i + 1) * size))
    }

    return {
      1: chunks[0] ?? '',
      2: chunks[1] ?? '',
      3: chunks[2] ?? '',
      4: chunks[3] ?? '',
    }
  }
}
