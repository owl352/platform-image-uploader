# Platform image uploader
___
#### This utils allows upload and read images and gifs from platform.

# Basics
___
Currently, the platform's transaction size is limited to approximately 20 thousand characters.
This limitation prevents us from openly uploading something really large scale. To solve this problem, a very simple and well-known solution was made - splitting data into chunks.
In addition to transaction size limits, there are also document limits, one of which is that the length of a string must not exceed 5120 characters

Now that we know the basics, we can move on to explaining everything that happens in this utility.

We should start with the fact that the chunk size of 5120 characters doesn't really suit us, because 4 full chunks per document will exceed the maximum transaction size, but not by much. The solution was to use just 5000 characters for the chunk size, in this case we can easily fit both the document and the transaction headers into the required transaction size, and there will be a little bit left over.

Now let's move on to image processing. This utility uses the `sharp` module, which allows you to edit the data medium. In the code is specified `resize`, when exceeding the required size, it is purely technically possible to throw it out, because of the fact that this fragment was created at the stage of chunks of 5120 characters, but now we have 2 documents even after compressing the image, so I decided to leave it to your discretion. After `resize`, we have the compression of the media content. The tasks I wanted to close required degrading the image quality, but you can also remove all the processing of the media content as well

After all that, we just get a content buffer, convert to ascii85, beat the resulting string into chunks, and then write to the platform as a pile of documents. I haven't studied transaction creation algorithms thoroughly, but for some reason I don't understand, using ascii85 reduces the number of characters by about 8-10%, thus helping to save credits

There's also some code here for decoding media content, which just does everything in reverse, but without processing the content

# Pre requirements
___
- Edit `.env`
- `npm i`

# Usage
___
- `npm run write` for writing selected data
- `npm run read` get data from chain (`DOCUMENT_ID` in `.env` required and must be equal of master document identifier - `mega_chunks`)

