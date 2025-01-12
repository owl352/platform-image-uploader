require('dotenv').config()
const sharp = require('sharp')
const ascii85 = require('ascii85')
const utils = require('./utils')
const process = require('process')
const { Identifier } = require('dash').PlatformProtocol

async function main () {
  const client = utils.getClient()

  console.log('Reading document from blockchain')

  const [documentRaw] = (await client.platform.documents.get(
    'contract.mega_chunks',
    {
      where: [
        ['$id', '=', process.env.DOCUMENT_ID]
      ]
    }))

  const { media_type: mediaType, adresses: rawAdresses } = documentRaw.toObject()

  console.log('Document exist')

  const addresses = rawAdresses.split(',')

  const extendedChunksDocuments = await client.platform.documents.get(
    'contract.chunks_string',
    {
      where: [
        ['$id', 'in', addresses]
      ]
    })

  const chunksDocuments = extendedChunksDocuments.map(doc => doc.toObject())

  const sortedChunksDocuments = addresses.map(id =>
    chunksDocuments.find(doc => Identifier.from(doc.$id).toString() === id)
  )

  const textChunks = []

  for (let documentIndex = 0; documentIndex < sortedChunksDocuments.length; documentIndex++) {
    for (let chunk = 0; chunk < 4; chunk++) {
      textChunks.push(sortedChunksDocuments[documentIndex][chunk])
    }
  }

  const base85IMG = textChunks.join('')

  await sharp(ascii85.decode(base85IMG), { animated: mediaType === 0 })
    .toFile(mediaType === 0 ? './readed.gif' : './readed.jpg')

  console.log('Done')

  await client.disconnect()
}

main().catch(console.error)
