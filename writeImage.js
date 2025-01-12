require('dotenv').config()
const sharp = require('sharp')
const ascii85 = require('ascii85')
const utils = require('./utils')

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE)

async function main () {
  const client = utils.getClient()

  console.log('Reading and compressing image...')

  const isAnimated = process.env.FILE_PATH.includes('.gif')

  const data = await sharp(process.env.FILE_PATH, { animated: isAnimated })
  const metadata = await data.metadata()

  let compressedData

  if (metadata.width > 512) {
    data.resize(512)
  }

  if (isAnimated) {
    compressedData = await data
      .gif({
        reuse: false,
        colors: 64,
        effort: 1,
        dither: 1
      })
      .toBuffer()
  } else {
    compressedData = await data
      .webp({
        quality: 29,
        alphaQuality: 0,
        smartSubsample: false,
        preset: 'picture',
        effort: 6,
        minSize: true
      })
      .toBuffer()
  }

  const base85Image = ascii85.encode(compressedData).toString()

  if (base85Image.length / CHUNK_SIZE >= 115) {
    throw new Error('Content to large')
  }

  console.log('Image has been read!')

  const chunks = utils.dataToChunks(base85Image, CHUNK_SIZE)

  const docs = utils.dataToChunks(chunks, 4)

  const identity = await client.platform.identities.get(process.env.OWNER)

  const documents = []

  console.log('Documents broadcast...')

  for (let i = 0; i < docs.length; i++) {
    const tmp = await client.platform.documents.create(
      'contract.chunks_string',
      identity,
      {
        0: '',
        1: '',
        2: '',
        3: '',
        // rewrite
        ...Object.assign({}, docs[i])
      }
    )

    const documentBatch = {
      create: [tmp],
      replace: [],
      delete: []
    }

    await client.platform.documents.broadcast(documentBatch, identity)

    documents.push(tmp)
  }

  console.log('Broadcasting links document...')

  const ids = []

  for (let i = 0; i < documents.length; i++) {
    ids.push(documents[i].getId().toString())
  }

  const linksDocument = await client.platform.documents.create(
    'contract.mega_chunks',
    identity,
    {
      media_type: isAnimated ? 0 : 1,
      adresses: ids.join(',')
    }
  )

  const documentBatch = {
    create: [linksDocument],
    replace: [],
    delete: []
  }

  await client.platform.documents.broadcast(documentBatch, identity)

  console.log('Documents broadcasted!')
  console.log(linksDocument.getId().toString())

  await client.disconnect()
}

main().catch(console.error)
