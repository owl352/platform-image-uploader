require('dotenv').config();
const sharp = require('sharp');
const ascii85 = require('ascii85')
const utils = require('./utils');

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE);

async function main() {

  const client = utils.getClient()

  console.log("Reading and compressing image...")

  const compressedImage = await sharp('./example.jpg')
    .resize(500)
    .jpeg({
      quality: 21,
      mozjpeg: true,
      progressive: false,
      quantisationTable: 0,
      optimizeCoding: true,
      optimiseScans:true})
    .toBuffer()

  const base85Image = ascii85.encode(compressedImage).toString();

  if (base85Image.length / CHUNK_SIZE >= 4) {
    throw new Error('Image to large')
  }

  console.log('Image has been read!')

  const doc = utils.stringToChunks(base85Image, CHUNK_SIZE)

  const identity = await client.platform.identities.get(process.env.OWNER)

  const document = await client.platform.documents.create(
    `contract.chunks_string`,
    identity,
    doc
  );

  console.log("Document broadcast...")

  const documentBatch = {
    create: [document],
    replace: [],
    delete: [],
  }

  await client.platform.documents.broadcast(documentBatch, identity)

  console.log("Document broadcasted!")
  console.log(document.getId().toString())

  await client.disconnect();
}

main().catch(console.error)
