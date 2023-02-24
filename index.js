require("dotenv").config();
const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer.js");
const Busquedas = require("./models/busquedas.js");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    //imprimir el menu
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //mostrar mensaje
        const termino = await leerInput("Ingrese ciudad:");

        //buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        //selecciona la ciudad
        const id = await listarLugares(lugares);
        if ( id === '0' ) continue;

        const lugarSeleccionado = lugares.find( l => l.id === id );  

        //guardar en db
         busquedas.agregarHistorial( lugarSeleccionado.nombre );  
        
        //clima
        const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);

        //datos del clima
        console.clear();
        console.log("\nInformación de la ciudad:\n".green);
        console.log("Ciudad:", lugarSeleccionado.nombre.green);
        console.log("Latitud:", lugarSeleccionado.lat);
        console.log("Longitud:", lugarSeleccionado.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:",clima.max);
        console.log("Como está el clima:",clima.desc.green);

        break;

      case 2:
        //recuperar historial
      busquedas.historialCapitalizado.forEach((lugar, i) => {
        const index = `${ i+1 }.`.green;
        console.log(`${index} ${lugar}`);       
      });
        break;

      case 0:
        //salir
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
