const fs = require('fs') // para manipular el sistema de archivos
const request = require('request') // para descargar el archivo
const decompress = require('decompress') // para descromprimir archivos .zip
const readline = require('readline') // para leer linea por linea un archivo y procesarlo

// luego sera un Array con los nombres de los 10 archivos ruc[0..9].zip
const archivo = 'ruc1.zip'

// la URL de la SET desde donde se descargan los archivos de RUC
const urlSET =
  'http://www.set.gov.py/rest/contents/download/collaboration/sites/PARAGUAY-SET/documents/informes-periodicos/ruc/'

// La cabecera que le debemos enviar al servidor http de la SET, simulamos ser un browser
const headerObj = {
 // Accept:
  //  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  //'User-Agent':
  //  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
  Host: 'www.set.gov.py',
  Origin: 'www.set.gov.py',
}

// armamos la ruta a la carpeta donde descargar el archivo .zip
const pathFile = `files/zip/${archivo}`

// creamos el archivo con extensión .zip donde descarguemos el stream
const w = fs.createWriteStream(pathFile)
const r = request.get({ url: urlSET + archivo, headers: headerObj })

r.on('response', function(res) {
  console.log(
    `Recibimos ${res.headers['content-disposition']} de tipo ${res.headers['content-type']}`
  )

  res.pipe(w)

  w.on('finish', async function() {
    console.log(`Concluida la descarga del archivo ${archivo}.`)
    // Aca podemos descomprimir ... con decompress
    if (fs.existsSync(pathFile)) {
      console.log(`La ruta y archivo ${pathFile} existe`)
      //console.log(pathFile)
      const txtFile = pathFile.split('/')[2].split('.')[0] + '.txt'
      try {
        const resFile = await decompress(pathFile, 'files/txt/')
        console.log(`El archivo ${pathFile} ha sido descomprimido con éxito.`)
        // Aca debemos procesar el rucX.txt
        procesarTxt(txtFile)
      } catch (error) {
        console.log(
          `Error al descomprimir ${pathFile}: Mensaje: ${error.message}.`
        )
      }
    } else {
      console.log(`La ruta y archivo ${pathFile} NO existe`)
    }
  })

  w.on('error', function(error) {
    console.log(
      `Error durante la descarga del archivo: ${pathFile}. Mensaje: ${error.message}.`
    )
  })
})

r.on('error', function(error) {
  console.log(
    `Error al descargar el archivo ${archivo}. Mensaje ${error.message}`
  )
})

function procesarTxt(txtFile) {
  
    // instanciamos una constante con el nombre del archivo + la extensión .sql
    const sqlFile = txtFile.split('.')[0] + '.sql'
  
    let contentFile = `` // vamos a ir acumulando las lineas parseadas a insert into ...
  
    // Si ya existe el archivo sql previamente, lo borramos
    if (fs.existsSync(`files/sql/${sqlFile}`)) {
      fs.unlink(`files/sql/${sqlFile}`, err => {
        if (err) {
          return console.log(
            `Error al borrar el archivo files/sql/${sqlFile}. Mensaje: ${err.message}`
          )
        }
        console.log(
          `El archivo files/sql/${sqlFile} ha sido borrado porque ya existía.`
        )
      })
    }
  
    const outstream = new (require('stream'))(),
      instream = fs.createReadStream(`files/txt/${txtFile}`),
      rl = readline.createInterface(instream, outstream)
  
    let count = 1
  
    rl.on('line', function(line) {
     
    
      const campos = line.split('|')
  
      const contribuyente = {
        ruc: +campos[0].match(/\d+/g).map(Number),
        nombre: campos[1].replace(/\'/g, "''"),
        dv: +campos[2],
        anterior: campos[3].replace(/\'/g, "''"),
      }
  
      contentFile += `INSERT INTO public.contribuyente VALUES ( ${contribuyente.ruc}, '${contribuyente.nombre}', ${contribuyente.dv}, '${contribuyente.anterior}' );\n`
  
      count++
    })
  
    rl.on('close', function(line) {
      //console.log('close')
  
      try {
        fs.appendFileSync(`files/sql/${sqlFile}`, contentFile, 'utf8')
        contentFile = `` // limpiamos la variable
        console.log(`El archivo files/sql/${sqlFile} ha sido generado con éxito.`)
      } catch (error) {
        console.log(`Error al cargar el archivo .sql. Mensaje: ${error.message}`)
      }
    })
  }
  