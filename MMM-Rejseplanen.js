/* MagicMirror Modul: MMM-Rejseplanen - Bruger Rejseplanens nye HAFAS.api v2 */
Module.register("MMM-Rejseplanen", {
  defaults: {
    stopId: "STOP_EXT_ID", // f.eks. "8100148" (skal erstattes med korrekt ekstern ID)
    apiKey: "APIKEY",
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
    const url = `https://api.rejseplanen.dk/bin/rest.exe/departureBoard?id=${this.config.stopId}&maxDepartures=${this.config.maxDepartures}&format=json&accessId=${this.config.apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.departures = data?.DepartureBoard?.Departure || [];
        this.updateDom();
      })
      .catch((err) => {
        console.error("MMM-Rejseplanen:", err);
      });
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "rejseplanen small bright";

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
      icon.className = this.getTransportIconClass(dep.type);
      iconCell.appendChild(icon);
      row.appendChild(iconCell);

      const time = document.createElement("td");
      const realtime = dep.rtTime;
      const planned = dep.time;
      time.innerText = realtime && realtime !== planned ? `${realtime} ⚠️` : planned;
      row.appendChild(time);

      const line = document.createElement("td");
      line.innerText = dep.line;
      row.appendChild(line);

      const direction = document.createElement("td");
      direction.innerText = dep.direction;
      row.appendChild(direction);

      table.appendChild(row);
    });

    wrapper.appendChild(table);
    return wrapper;
  },

  getTransportIconClass: function (type) {
    switch (type?.toLowerCase()) {
      case "bus": return "fas fa-bus";
      case "train": return "fas fa-train";
      case "metro": return "fas fa-subway";
      case "tram": return "fas fa-tram";
      default: return "fas fa-question";
    }
  },

  getStyles: function () {
    return ["font-awesome.css"];
  }
});
