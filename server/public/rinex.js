const list = Array.from(document.querySelector("#rinex-bs").children),
  favorite = list.filter((item) => item.className === "favorite");

document.querySelector(
  "#alert-message"
).innerHTML = `Будут обработаны следующие базовые станции, находящиеся в избранных: <br><b><ol>${favorite
  .map((item) => `<li>${item.text}</li>`)
  .join("")}</ol></b>`;
document.querySelectorAll(".form-group")[0].remove();
document.querySelectorAll(".form-group")[0].remove();
document.querySelectorAll(".form-group")[0].remove();
document.querySelectorAll(".form-group")[0].remove();
document.querySelectorAll(".form-group")[2].remove();
document.querySelectorAll(".form-group")[2].remove();
const div = document.querySelector(".form-group");
document
  .querySelector(".col-md-12.col-lg-8")
  .insertAdjacentHTML(
    "afterbegin",
    `<div class="form-group"><label class="col-sm-4 control-label">Продолжительность файлов:</label> <div class="col-sm-8"><label class="radio-inline"><input type="radio" name="rinex[type]" value="1" checked>1ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="2">2ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="3">3ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="4">4ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="6">6ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="8">8ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="12">12ч</label><label class="radio-inline"><input  type="radio" name="rinex[type]" value="24">24ч</label></div></div>`
  );
document
  .querySelector(".col-md-12.col-lg-8")
  .insertAdjacentHTML(
    "afterbegin",
    `<div class="form-group"><label class="col-sm-4 control-label">Дата:</label> <div class="col-sm-8"><label class="radio-inline"><input  type="date" name="rinex[date]" value="2021-10-05" /></label></div></div>`
  );
document
  .querySelector(".col-md-12.col-lg-8")
  .insertAdjacentHTML(
    "beforeend",
    `<div class="form-group"><label class="col-sm-4 control-label"></label> <div class="col-sm-8"><label class="radio-inline"><input type="button" value="Запуск" onclick="ddos()" /></label></div></div>`
  );

const typeRinex = (type) => {
  switch (type) {
    case "1":
      return 24;
    case "2":
      return 12;
    case "3":
      return 8;
    case "4":
      return 6;
    case "6":
      return 4;
    case "8":
      return 3;
    case "12":
      return 2;
    case "24":
      return 1;
  }
};
let formMax = new FormData();

function formatter(time) {
  return `${
    time.getDate().toString().length == 1
      ? "0" + time.getDate().toString()
      : time.getDate()
  }/${
    (time.getMonth() + 1).toString().length == 1
      ? "0" + (time.getMonth() + 1).toString()
      : time.getMonth() + 1
  }/${time.getFullYear()} ${
    time.getHours().toString().length == 1
      ? "0" + time.getHours().toString()
      : time.getHours()
  }:${
    time.getMinutes().toString().length == 1
      ? "0" + time.getMinutes().toString()
      : time.getMinutes()
  }`;
}

function ddos() {
  rinex.insertAdjacentHTML(
    "beforeend",
    `
    <table id="tableRinex" cellpadding="7" border="1" width="100%" style="text-align: center">
    <tr>
    <td></td>
    ${favorite
      .map((item) => `<td id="header${item.value}">${item.text}</td>`)
      .join("")}
    </tr>
    </table>
  `
  );

  formMax.set("_token", rinexForm["_token"].value);
  formMax.set("send_to_email", false);
  formMax.set("email", "smf@eft-cors.ru");
  formMax.set("rinex[timezone]", "0");
  formMax.set("rinex[type]", rinexForm["rinex[type]"].value);
  formMax.set("rinex[version]", rinexForm["rinex[version]"].value);
  formMax.set("rinex[frequency]", rinexForm["rinex[frequency]"].value);

  const start = new Date(rinexForm["rinex[date]"].value + " 00:30");

  const type = formMax.get("rinex[type]");

  funcRinexChecking(start, type);
}
let timer;
async function funcRinexChecking(start, type) {
  for (let i = 0; i <= typeRinex(type) - 1; i++) {
    tr = document.createElement("tr");
    tableRinex.insertAdjacentElement("beforeend", tr);
    for (let k = 0; k <= favorite.length - 1; k++) {
      let query = new newRinexQuery(k, i, type, start, tr);
      let check = await query.checkRinex();
      let get = check && (await query.getRinex(check));
      let status =
        get &&
        (await new Promise((resolve) => {
          timer = setInterval(
            query.checkStatusCompelete,
            3000,
            get,
            check,
            resolve
          );
        }));
    }
  }
}

class newRinexQuery {
  constructor(k, i, type, start, tr) {
    this.k = k;
    this.i = i;
    this.type = type;
    this.start = start;
    this.tr = tr;
  }
  checkRinex() {
    let go = new Date(this.start.getTime() + this.i * +this.type * 3600000),
      end = new Date(this.start.getTime() + ++this.i * +this.type * 3600000);

    formMax.set("rinex[bs]", favorite[this.k].value);
    return fetch(
      `https://bp.eft-cors.ru/json/check-rinex-exists?start_date=${formatter(
        go
      )}&end_date=${formatter(end)}&timezone=${"0"}&bs_id=${
        favorite[this.k].value
      }`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        this.k === 0 &&
          this.tr.insertAdjacentHTML(
            "beforeend",
            `<td>${formatter(go)}<br />${formatter(end)}</td>`
          );
        let td = document.createElement("td");
        td.innerHTML =
          res.success === true ? `Файл обрабатывается...` : `Файл отсутствует`;
        this.tr.insertAdjacentElement("beforeend", td);
        return res.success === true
          ? { go: formatter(go), end: formatter(end), td }
          : false;
      });
  }
  getRinex({ go, end }) {
    formMax.set("rinex[measure_start]", go);
    formMax.set("rinex[measure_end]", end);

    console.log("_______________");
    console.log(formMax.get("rinex[measure_start]"));
    console.log(formMax.get("rinex[measure_end]"));
    console.log(formMax.get("_token"));
    console.log(formMax.get("rinex[timezone]"));
    console.log(formMax.get("rinex[version]"));
    console.log(formMax.get("rinex[frequency]"));
    console.log(formMax.get("rinex[bs]"));
    console.log("_______________");

    return fetch("https://bp.eft-cors.ru/json/get-rinex", {
      method: "POST",
      body: formMax,
    })
      .then((res) => res.json())
      .then((res) => {
        return res.data.rinexHistoryId;
      });
  }
  checkStatusCompelete(get, check, resolve) {
    return fetch(
      `https://bp.eft-cors.ru/json/get-rinex-history-status?id=${get}`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.data.status === 1) {
          let link = document.createElement("a");
          link.href = `rinex/${res.data.result}`;
          link.innerText = `${res.data.result}`;
          check.td.innerHTML = "";
          check.td.insertAdjacentElement("beforeend", link);
          resolve();
          clearInterval(timer);
          return;
        } else {
        }
      });
  }
}
