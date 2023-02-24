const fs = require ('fs');
const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado (){
    return this.historial.map( lugar => {
        let palabras = lugar.split(' ');
        palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
        return palabras.join(' ');
    })
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      //petición Http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      return resp.data.features.map((lugar) => {
        return {
          id: lugar.id,
          nombre: lugar.place_name,
          lng: lugar.center[0],
          lat: lugar.center[1],
        };
      });
    } catch (error) {
      return [];
    }
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    };
  }

  async climaLugar(lat, lon) {
    try {
      //petición Http
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/weather',
        params: {...this.paramsOpenWeather, lat, lon}
      });

      const resp = await instance.get();
      const {weather, main} = resp.data;
        return {
          desc: weather[0].description,
          temp: main.temp,
          min: main.temp_min,
          max: main.temp_max,
        };

    } catch (error) {
      console.log(error);
    }
  }


agregarHistorial( lugar = '' ){
    //prevenir que se repitan
    if ( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
        return;       
    }
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift( lugar.toLocaleLowerCase() );
    this.guardarDB()
}

guardarDB(){
    const payload = {
        historial: this.historial
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload))
}

leerDB(){
    if (!fs.existsSync(this.dbPath)) return ;
    
      const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
      const data = JSON.parse(info);
    
      this.historial = data.historial;
}

}

module.exports = Busquedas;
