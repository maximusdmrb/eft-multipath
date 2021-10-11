<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <!-- <button onclick="ddos">Оуч :)</button> -->
    <script>
      const params = {
        bs: [483 /*385,  483, 913, 914 */],
        email: "maximusdmrb@gmail.com",
        year: 2021,
        month: "09",
        date: 18,
        type: "3",
      };

      const typeRinex = {
        type1: {
          time: [
            "00:30",
            "01:30",
            "02:30",
            "03:30",
            "04:30",
            "05:30",
            "06:30",
            "07:30",
            "08:30",
            "09:30",
            "10:30",
            "11:30",
            "12:30",
            "13:30",
            "14:30",
            "15:30",
            "16:30",
            "17:30",
            "18:30",
            "19:30",
            "20:30",
            "21:30",
            "22:30",
            "23:30",
          ],
          interval: 12000,
        },
        type2: {
          time: [
            "00:30",
            "02:30",
            "04:30",
            "06:30",
            "08:30",
            "10:30",
            "12:30",
            "14:30",
            "16:30",
            "18:30",
            "20:30",
            "22:30",
          ],
          interval: 15000,
        },
        type3: {
          time: [
            "00:30",
            "03:30",
            "06:30",
            "09:30",
            "12:30",
            "15:30",
            "18:30",
            "21:30",
          ],
          interval: 20000,
        },
        type4: {
          time: ["00:30", "04:30", "08:30", "12:30", "16:30", "20:30"],
          interval: 30000,
        },
        type6: {
          time: ["00:30", "06:30", "12:30", "18:30"],
          interval: 45000,
        },
        type8: {
          time: ["00:30", "08:30", "16:30"],
          interval: 50000,
        },
        type12: { time: ["00:30", "12:30"], interval: 50000 },
        type24: { time: ["00:30"], interval: 70000 },
      };
      let formMax = new FormData();
      function ddos({ bs, email, date, month, year, type }) {
        formMax.set("_token", "GnVgpcKaw1w3z6CpFIDLUJiLzpmD1p83I3VU0kB4");
        formMax.set("email", params.email);
        formMax.set("send_to_email", false);
        formMax.set("rinex[timezone]", "0");
        formMax.set("rinex[version]", "3.02");
        formMax.set("rinex[frequency]", "1");

        let indexTime = 0,
          indexBs = 0;
        let timer = setInterval(query, typeRinex[`type${type}`].interval);
        query();
        function query() {
          formMax.set("rinex[bs]", `${params.bs[indexBs]}`);
          if (indexTime != typeRinex[`type${type}`].time.length - 1) {
            formMax.set(
              "rinex[measure_start]",
              `${date}/${month}/${year} ${
                typeRinex[`type${type}`].time[indexTime]
              }`
            );
            formMax.set(
              "rinex[measure_end]",
              `${date}/${month}/${year} ${
                typeRinex[`type${type}`].time[indexTime + 1]
              }`
            );
            indexTime++;
          } else {
            formMax.set(
              "rinex[measure_start]",
              `${date}/${month}/${year} ${
                typeRinex[`type${type}`].time[indexTime]
              }`
            );
            formMax.set(
              "rinex[measure_end]",
              `${date + 1}/${month}/${year} ${typeRinex[`type${type}`].time[0]}`
            );
            if (indexBs == params.bs.length - 1) {
              clearInterval(timer);
            }
            indexTime = 0;
            indexBs++;
          }
          console.log("_______________");
          console.log(formMax.get("rinex[measure_start]"));
          console.log(formMax.get("rinex[measure_end]"));
          console.log(formMax.get("_token"));
          console.log(formMax.get("rinex[timezone]"));
          console.log(formMax.get("rinex[version]"));
          console.log(formMax.get("rinex[frequency]"));
          console.log(formMax.get("rinex[bs]"));
          console.log("_______________");
          fetch("https://bp.eft-cors.ru/json/get-rinex", {
            method: "post",
            body: formMax,
          });
        }
      }
    </script>
  </body>
</html>
