require('dotenv').config();
const sharp = require('sharp');
const ascii85 = require('ascii85')
const utils = require('./utils');
const process = require("process");

async function main() {

  const client = utils.getClient()

  console.log("Reading document from blockchain")

  const [documentRaw] = (await client.platform.documents.get(
    'contract.chunks_string',
    {
      where: [
        ['$id', '=', process.env.DOCUMENT_ID]
      ]
    }))

  const document = documentRaw.toObject()

  console.log('Document exist')


  const chunks = [document[1], document[2], document[3], document[4]];

  let base85IMG = chunks.join('')

  await sharp(ascii85.decode(base85IMG))
    .toFile('./readed.jpg')

  console.log('Done')

  await client.disconnect();
}

main().catch(console.error)
