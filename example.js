import fs from "fs"
import { ZipArchive } from './index.js'


export default async function main() {

// create a file to stream archive data to.
const output = fs.createWriteStream(import.meta.dirname + "/example.zip");
const archive = new ZipArchive({
  zlib: { level: 0 }, // Sets the compression level.
  // dry: true
});

// // listen for all archive data to be written
// // 'close' event is fired only when a file descriptor is involved
// output.on("close", function () {
//   console.log(archive.pointer() + " total bytes");
//   console.log(
//     "archiver has been finalized and the output file descriptor has closed.",
//   );
// });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
// output.on("end", function () {
//   console.log("Data has been drained");
// });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on("error", function (err) {
  throw err;
});

const compressedEntries = []

archive.on("entry", function (entry) {
    compressedEntries.push(entry)
});

// pipe archive data to the file
archive.pipe(output);

// append a file from string
const entries = [{content: import.meta.dirname + '/file2.txt', name: "file2.txt" }, {content:import.meta.dirname + '/file3.txt', name: "file3.txt" }]
for (const entry of entries) {
    archive.file(entry.content, { name: entry.name });
}

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
await archive.finalize();
console.log(`Size ${archive.pointer()}`)

// const fd = await fs.promises.open(import.meta.dirname + "/example.zip", 'r')
// for (let i= 0; i < entries.length; i++) {
//     const compressedEntry = compressedEntries[i]
//     const buffer = Buffer.alloc(compressedEntry.csize)
//     const result = await fd.read(buffer, 0, buffer.byteLength, compressedEntry._offsets.contents)
//     // const content = zlib.inflateRawSync(buffer)
//     if (result.buffer.toString() !== entries[i].content) {
//         throw new Error('Contents dont match')
//     }
// }
// await fd.close()
}
try {
  await main()
} catch (e) {
  console.error(e)
}
