const MINUTES_INTERVAL = 5;
let send_to_email = false;
let rinex_status_timeout;

$(function () {
  $("select#rinex-bs").chosen({ no_results_text: "Не найдено" });

  $("#rinexForm").ajaxForm({
    beforeSubmit: function (formData) {
      formData.push({ name: "send_to_email", value: send_to_email });
      toastr.success("Файл запрошен");
      toggleSendEmailBtn(false);
      toggleDownloadBtn(false);
      if (!send_to_email) {
        $("#rinex-loading").removeClass("hide");
      }
    },
    success: function (response) {
      if (response.success !== true) {
        toastr.error(response.data);
        send_to_email = false;
        return false;
      }

      if (!send_to_email) {
        getRinexHistoryStatus(response.data.rinexHistoryId); //first launch
        rinex_status_timeout = setInterval(
          getRinexHistoryStatus,
          10000,
          response.data.rinexHistoryId
        );
      } else {
        toastr.success("Ссылка на файл будет отправлена на email");
      }
      send_to_email = false;
    },
  });

  $("#ephForm").ajaxForm({
    beforeSubmit: function (formData) {
      formData.push({ name: "send_to_email", value: send_to_email });
    },
    success: function (response) {
      if (response.success !== true) {
        toastr.error("Файл " + response.data.file_name + " не найден!");
        send_to_email = false;
        return false;
      }

      if (!send_to_email) {
        downloadFile(response.data.file_name, response.data.file_content);
      }

      send_to_email = false;
      toastr.success("Готово");
    },
  });

  $(".userslist").select2();
});

var downloadFile = function (filename, content) {
  var blob = new Blob([content]);
  $("a#download")
    .attr({
      download: filename,
      href: URL.createObjectURL(blob),
    })
    .get(0)
    .click();
};

$("button.send-by-email").on("click", function (e) {
  e.preventDefault();
  send_to_email = true;
  var $form = $(this).closest("form");
  jQuery("#send-by-email-modal").modal();
  jQuery("#send-by-email-modal").attr("form", $form.attr("id"));
});

jQuery("#send-by-email-modal .btn-default").click(function () {
  var email = jQuery("#send-by-email-modal input[name=entered_email]").val();
  var form_id = jQuery("#send-by-email-modal").attr("form");
  var $cur_form = $("#" + form_id);
  $cur_form.find("input[name=email]").val(email);
  $cur_form.submit();
});

//Функция валидации даты и времени
function validateRinexDateTime() {
  if ($("#rinex-bs").val() === "") {
    toastr.error("Не выбрана базовая станция!");
    return false;
  }

  const measure_start = $("#measure-start").val();
  const measure_end = $("#measure-end");

  const datetime_from = moment(measure_start, "DD/MM/YYYY kk:mm");
  const datetime_to = moment(measure_end.val(), "DD/MM/YYYY kk:mm");

  const duration = moment.duration(datetime_to.diff(datetime_from));

  if (duration.asMilliseconds() <= 0) {
    toastr.error(
      "Минимально допустимый интервал " + MINUTES_INTERVAL + " минут!"
    );
    return false;
  }

  if (duration.asHours() > 24) {
    toastr.error("Неверный интервал измерений!");

    // меняем конечную дату и время на максимально возможное (т.е. + 24 часа)
    var valid_datetime_to = datetime_from.add(24, "hours");

    measure_end
      .data("DateTimePicker")
      .date(valid_datetime_to.format("DD/MM/YYYY HH:mm"));

    toggleSendEmailBtn(true);
    toggleDownloadBtn(true);
  }

  checkRinexExists();

  return true;
}

function checkRinexExists() {
  const measure_start = $("#measure-start").val();

  if (measure_start === "") {
    return true;
  }

  const data = {
    start_date: measure_start,
    end_date: $("#measure-end").val(),
    timezone: $('select[name="rinex[timezone]"]').val(),
    bs_id: $("#rinex-bs").val(),
  };

  $.get(
    "https://bp.eft-cors.ru/json/check-rinex-exists",
    data,
    function (response) {
      $(".spinner").hide();
      if (response.success === true) {
        toastr.success("Данные присутствуют!");
        toggleSendEmailBtn(true);
        toggleDownloadBtn(true);
        return true;
      } else {
        toastr.error(response.data);
        toggleSendEmailBtn(false);
        toggleDownloadBtn(false);
        return false;
      }
    },
    "json"
  );
}

function getRinexHistoryStatus(rinexHistoryId) {
  $.get(
    "https://bp.eft-cors.ru/json/get-rinex-history-status",
    { id: rinexHistoryId },
    function (response) {
      if (response.success === true) {
        if (response.data.status === 1) {
          //success
          toastr.success("Ссылка готова!");

          $("a#rinex-link")
            .attr({
              href: "rinex/" + response.data.result,
            })
            .removeClass("hide");

          $("#rinex-loading").addClass("hide");

          clearTimeout(rinex_status_timeout);
        }
        return true;
      } else {
        toastr.error("ERROR");
        return false;
      }
    },
    "json"
  );
}

function toggleSendEmailBtn(isEnabled) {
  if ($("#measure-start").val() === "" || $("#measure-end").val() === "") {
    isEnabled = false;
  }

  var $btn = $("#rinexForm").find("#send-by-email-btn");
  $btn.prop("disabled", !isEnabled);
}

function toggleDownloadBtn(isEnabled) {
  if ($("#measure-start").val() === "" || $("#measure-end").val() === "") {
    isEnabled = false;
  }
  var $btn = $("#rinexForm").find("#download-btn");
  $btn.prop("disabled", !isEnabled);
}

function goToBastation() {
  var bsId = $("#rinex-bs").val();
  if (bsId === "") {
    toastr.error("Не выбрана базовая станция!");
    return false;
  }

  location.href = "https://bp.eft-cors.ru/basestations/" + bsId;
}

$("select[name=userslist]").change(function () {
  var selected_user_email = $(this).find("option:selected").val();

  if (selected_user_email != "") {
    $("input[name=entered_email]").val(selected_user_email);
  } else {
    $("input[name=entered_email]").val("smf@eftgroup.ru");
  }
});
