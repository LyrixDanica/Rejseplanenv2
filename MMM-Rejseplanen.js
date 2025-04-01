/* MagicMirror Modul: MMM-Rejseplanen - Klar til Rejseplanens nye API */
Module.register("MMM-Rejseplanen", {
  defaults: {
    stopPlaceId: "STOP_PLACE_ID", // Opdater med korrekt ID
    apiKey: "YOUR_API_KEY",       // Sæt din API-nøgle her
    maxDepartures: 5,
    reloadInterval: 60 * 1000 // 1 minut
  },

  start: function () {
    this.departures = [];
    this.getDepartures();
    this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.getDepartures();
    }, this.config.reloadInterval);
  },

  getDepartures: function () {
    const url = `https://api.rejseplanen.dk/v2/departures?stopPlaceId=${this.config.stopPlaceId}&maxDepartures=${this.config.maxDepartures}`;

    fetch(url, {
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        this.departures = data.departures || [];
        this.updateDom();
      })
      .catch((err) => {
        console.error("MMM-Rejseplanen:", err);
      });
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "rejseplanen small bright"; // Brug MagicMirrors standardfont og størrelse

    if (!this.departures.length) {
      wrapper.innerHTML = "Ingen tilgængelige data.";
      return wrapper;
    }

    const table = document.createElement("table");
    const header = document.createElement("tr");
    ["", "Tid", "Linje", "Mod"].forEach((title) => {
      const th = document.createElement("th");
      th.innerText = title;
      header.appendChild(th);
    });
    table.appendChild(header);

    this.departures.forEach((dep) => {
      const row = document.createElement("tr");

      const iconCell = document.createElement("td");
      const icon = document.createElement("i");
      icon.className = this.getTransportIconClass(dep.transportMode);
      iconCell.appendChild(icon);
      row.appendChild(iconCell);

      const time = document.createElement("td");
      const planned = dep.plannedDepartureTime?.substring(11, 16);
      const realtime = dep.realtimeDepartureTime?.substring(11, 16);
      time.innerText = realtime && realtime !== planned ? `${realtime} ⚠️` : planned;
      row.appendChild(time);

      const line = document.createElement("td");
      line.innerText = dep.lineLabel;
      row.appendChild(line);

      const direction = document.createElement("td");
      direction.innerText = dep.destinationDisplay;
      row.appendChild(direction);

      table.appendChild(row);
    });

    wrapper.appendChild(table);
    return wrapper;
  },

  getTransportIconClass: function (type) {
    switch (type) {
      case "bus": return "fas fa-bus";
      case "train": return "fas fa-train";
      case "metro": return "fas fa-subway";
      case "tram": return "fas fa-tram";
      default: return "fas fa-question";
    }
  },

  getStyles: function () {
    return ["font-awesome.css"]; // Brug kun standard styles
  }
});
