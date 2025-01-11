require('dotenv').config();
const Dash = require("dash");
const sharp = require('sharp');

const chunkSizeString = 5120

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
      contractId: process.env.DATA_CONTRACT_ID,
    },
  }
};

async function main() {
  const client = new Dash.Client(options);


  const compressedImage = await sharp('./example.jpg')
    .resize(512)
    .jpeg({ quality: 20 })
    .toFile('./output.jpg')

  const imageBase64 = compressedImage.toString('base64')

  const chunksBase64 = [];

  for (let i = 0; i < imageBase64.length/chunkSizeString; i++) {
    chunksBase64.push(imageBase64.slice(chunkSizeString*i, chunkSizeString*(i+1)));
  }

  const docBase64 = {
    1: chunksBase64[0]??"0",
    2: chunksBase64[1]??"0",
    3: chunksBase64[3]??"0",
    4: chunksBase64[4]??"0"
  }

  const identity = await client.platform.identities.get(process.env.OWNER)

  const documentString = await client.platform.documents.create(
    `contract.chunks_string`,
    identity,
    docBase64
  );

  console.log('starting broadcast');

  const documentBatchBase64 = {
    create: [documentString],
    replace: [],
    delete: [],
  };

  await client.platform.documents.broadcast(documentBatchBase64, identity)

  console.log('end')
}

main().catch(console.error);
