import { createServer } from 'node:http'
import { createReadStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import { WritableStream, TransformStream } from 'node:stream/web';
import csvtojson from 'csvtojson'


const PORT = 3000

createServer(async (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    res.end()
    return
  }
  let items = 0
  Readable.toWeb(createReadStream('./animeflv.csv'))
    .pipeThrough(Transform.toWeb(csvtojson()))
    .pipeThrough(new TransformStream({
      transform(chunk, controller) {
        const json = JSON.parse(Buffer.from(chunk))
        controller.enqueue(JSON.stringify({
          title: json.title,
          description: json.description,
          url_anime: json.url_anime
        }).concat('\n'))
      }
    }))
    .pipeTo(new WritableStream({
      write(chunk) {
        items++;
        res.write(chunk)
      },
      close() {
        console.log(`Items: ${items}`)
        res.end()
      }
    }))

  res.writeHead(200, headers)

})
  .listen(PORT)
  .on('listening', () => {
    console.log(`Server running on http://localhost:${PORT}`)
  });