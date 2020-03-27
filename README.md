# Procesar los archivos ruc[0..9].zip del sitio de la set.

Sitio: https://www.set.gov.py/portal/PARAGUAY-SET/InformesPeriodicos

Link: https://www.set.gov.py/portal/PARAGUAY-SET/InformesPeriodicos?folder-id=repository:collaboration:/sites/PARAGUAY-SET/categories/SET/Informes%20Periodicos/listado-de-ruc-con-sus-equivalencias

### Pasos a seguir en la `primera` emisión

1. Crear una carpeta e inicializar el proyecto
```bash
mkdir set-files
cd set-files
npm init
mkdir -p files/zip
mkdir files/txt
mkdir files/sql
mkdir sql
mkdir logs
touch .gitignore
touch README.md
touch procesador.js
```

En el package.json agregar 

```json
"prettier":{
    "trailingComma": "es5",
    "useTabs": false,
    "tabWidth": 2,
    "semi": false,
    "singleQuote": true
  },
```

2. Instalar las librerias/modulos necesarios de npm para nuestro proyecto
```bash
npm -i S request decompress readline
```
3. Descargar el archivo `ruc0.zip` 
1. Descomprimir el archivo ruc0.zip en ruc0.txt
1. Procesar el txt file ruc0.txt y generar el archivo sql ruc0.sql
1. Crear una base de datos `setfiles` en postgresql con una tabla `contribuyentes`

```sql
CREATE TABLE public.contribuyente
(
    ruc integer NOT NULL,
    nombre character varying NOT NULL,
    dv smallint NOT NULL,
    anterior character varying NOT NULL,
    CONSTRAINT contribuyente_pkey PRIMARY KEY (ruc)
);
```

7. Procesar el archivo sql ruc0.sql con los inserts a la tabla contribuyentes y verificar en la base de datos.
1. `Fin de la primera emision.`

### Pasos a seguir en la `segunda` emisión

> Vamos a ir viendo.