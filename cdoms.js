const numberOfColumnsFixed = 9;
const table = document.getElementById("table");
let data = mainTableData;

$(document).ready(function () {
  $("#table")
    .bootstrapTable("destroy")
    .bootstrapTable({
      onPostBody: function () {
        tableConfig();
        $("select").selectpicker("refresh");

        /* Detail Button işareti */
        detailButtonSign();
      },
      data: data,
      exportDataType: $(this).val(),
      exportTypes: ["excel"],
    });
  $("select").selectpicker("refresh");
  scrollBarPosition();
});

function toggleZoomScreen() {
  document.body.style.zoom = "80%";
}
toggleZoomScreen();

$(function () {
  $("#table").bootstrapTable("load", data);
  $("select").selectpicker("refresh");
  const thead = document.querySelector("thead");
  if (thead) {
    thead.addEventListener("click", function (e) {
      const cell = e.target.closest("th");
      // Tüm detayları açmak için
      if (cell.id === "detail-view") {
        let allDetailsViewSign = cell
          .querySelector("div")
          .querySelector("div").innerHTML;

        var detailIcons = document.getElementsByClassName("detailButton");
        detailIcons.forEach((element) => {
          if (allDetailsViewSign === "+") {
            element.innerHTML === "+" && element.click();
          } else {
            element.innerHTML === "-" && element.click();
          }
        });
      }
    });
  }

  /*  Ana Tablo td click  */
  const tbody = document.querySelector("tbody");
  if (tbody) {
    tbody.addEventListener("click", function (e) {
      const cell = e.target.closest("td");
      if (!cell) {
        return;
      }
      const row = cell.parentElement;

      /** Tabloda Detay alanlarının oluşturulması*/
      let rowDataIndex = row.getAttribute("data-index");

      let rowId = row.getAttribute("data-uniqueid");
      if (dataDetailArrays[rowId] !== undefined && cell.cellIndex === 0) {
        dataDetailArrays[rowId].map((item) => {
          let checkElement = data.find((element) => element.id === item.id);
          if (!checkElement) {
            data.splice(rowDataIndex + 1, 0, item);
          } else {
            data = data.filter((x) => x.id !== item.id);
          }
          rowDataIndex++;
        });
        $("#table").bootstrapTable("load", data);
      }
      /** Tabloda Detay alanlarının oluşturulması*/

      if (
        cell.classList.contains("editableDateRangePicker") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDateRangePicker(cell, rowId);
      }

      if (
        cell.id.split("-")[1] === "itemNo" &&
        cell.getAttribute("data-toggle") === "modal" &&
        e.target.id !== ""
      ) {
        openWorkOrderDetailModal(cell, rowId);
      }

      if (
        cell.classList.contains("openModalPartsList") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openPartsOrdersAndPickingModal(cell, rowId);
      }

      if (
        cell.classList.contains("editableDatePicker") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDatePicker(cell, rowId);
      }

      if (cell.classList.contains("editableInput")) {
        editTable(cell.id, rowId);
      }
    });
  }
  /*  Ana Tablo td click  */

  $('[data-toggle="tooltip"]').tooltip();
});

function tableConfig() {
  console.log("object");
  /*  Ana Tablo düzenleme */
  for (let i in table.rows) {
    let row = table.rows[i];

    // Kolonları sabitlemek için
    fixedColumn(row, i);

    // Tüm detayları açacak buton
    if (row.rowIndex === 0) {
      row.cells[0].innerHTML =
        "<div class='th-inner'><div class='openAllDetails'>+</div></div><div class='fht-cell'></div>";
      row.cells[0].setAttribute("id", "detail-view");
    }

    if (row.rowIndex !== 0) {
      for (let j in row.cells) {
        let col = row.cells[j];
        let colName = Object.keys(
          data.find((item) => item.id === row.getAttribute("data-uniqueid"))
        )[col.cellIndex];
        row.setAttribute("id", row.getAttribute("data-uniqueid"));
        if (col.cellIndex !== undefined && col.cellIndex !== 0) {
          col.setAttribute(
            "id",
            data.find((item) => item.id === row.getAttribute("data-uniqueid"))
              .id +
              "-" +
              colName
          );
        }

        //$("#table").bootstrapTable("refresh");
        // Eğer row id si dataDetailArrays içinde varsa bu row ana tablonundur ve detayı açılabilir

        if (col.cellIndex !== undefined && col.cellIndex === 0) {
          col.setAttribute("id", "detail" + row.id);
          if (
            dataDetailArrays[row.getAttribute("data-uniqueid")] !== undefined
          ) {
            col.innerHTML = "<div class='detailButton'>+</div>";
          } else {
            col.innerHTML = "";
          }
        }

        if (col.classList) {
          // Editable input
          if (col.classList.contains("editableInput")) {
            col.classList.add("bc-blue");
          }
          // Editable DateRangePicker ve DatePicker
          if (
            col.classList.contains("editableDateRangePicker") ||
            col.classList.contains("editableDatePicker")
          ) {
            col.classList.add("bc-blue");
            col.setAttribute("data-toggle", "modal");
          }

          // Editable Select
          if (col.classList.contains("editableSelect")) {
            col.classList.add("d-flex");
            col.classList.add("justify-content-center");

            if (colName === "isDismantling") {
              col.classList.add("bc-blue");
              createSelectBox(col, dismantlingSelectOptions, "isDismantling");
            }

            if (colName === "customerPartsInformation") {
              // müşteri parça bilgisi - arka plan rengi
              if (
                col.innerHTML.includes("Bekleniyor") ||
                col.innerHTML.includes("Stokta")
              ) {
                col.classList.add("bc-green");
              }
              if (col.innerHTML.includes("Hayır")) {
                col.classList.add("bc-orange");
              }
              createSelectBox(
                col,
                trackInformation,
                "customerPartsInformation"
              );
            }
          }

          // Parça Listesi Modal
          if (col.classList.contains("openModalPartsList")) {
            col.setAttribute("data-toggle", "modal");
            col.classList.add("textDecoration");
            // parça listesi
            if (col.innerHTML.includes("Var")) {
              col.classList.add("bc-green");
            }
            if (col.innerHTML.includes("Yok")) {
              col.classList.add("bc-orange");
            }
          }
        }

        if (
          colName === "itemNo" &&
          dataDetailArrays[row.getAttribute("data-uniqueid")] !== undefined
        ) {
          // ERS İşemri/Kalem No
          //workOrderDetailModal
          //toDoListModal
          col.setAttribute("data-toggle", "modal");
          col.classList.add("cursorPointer");
          col.innerHTML =
            col.innerHTML +
            "<a class='ml-2' onclick='openToDoListModal(this)' data-toggle='modal'><img src='./workOrder.png' width='20px' height='20px' /></a>";
        }

        if (colName === "offerStatus") {
          // teklif durumu - arka plan rengi
          if (col.innerHTML.includes("Onay")) {
            col.setAttribute("class", "bc-green");
          }
          if (col.innerHTML.includes("Red")) {
            col.setAttribute("class", "bc-orange");
          }
        }
      }
    }
  }
  /*  Ana Tablo düzenleme  */
}

function changeSelect(selectElement) {
  let rowId = selectElement.id.split("-")[0];
  let columnName = selectElement.id.split("-")[1];
  let selected = selectElement.value;
  let td = document.getElementById(selectElement.id).parentElement
    .parentElement;

  if (columnName === "customerPartsInformation") {
    if (selected === "1" || selected === "2") {
      td.classList.replace("bc-orange", "bc-green");
    }
    if (selected === "3") {
      td.classList.replace("bc-green", "bc-orange");
    }
  }

  editAjax(columnName, rowId, selected);
}

function openDatePicker(cell, rowId) {
  $("#dataPickerModal").modal("show");
  $("#datePicker").daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      startDate: cell.innerHTML.split("-")[0],
      startDate: cell.innerHTML.split("-")[0],
      locale: {
        format: "DD.M.YYYY",
      },
    },
    function (start, end, label) {
      cell.innerHTML = start.format("DD.M.YYYY");
      editAjax(cell.id.split("-")[1], rowId, start.format("DD.M.YYYY"));
      $("#dataPickerModal").modal("hide");
    }
  );
}

function openDateRangePicker(cell, rowId) {
  $("#dateRangePickerModal").modal("show");
  $("#dateRangePicker").daterangepicker(
    {
      opens: "left",
      startDate: cell.innerHTML.split("-")[0],
      endDate: cell.innerHTML.split("-")[1],
      locale: {
        format: "DD.M.YYYY",
      },
    },
    function (start, end, label) {
      cell.innerHTML =
        start.format("DD.M.YYYY") + "-" + end.format("DD.MM.YYYY");
      $("#dateRangePickerModal").modal("hide");
      editAjax(
        cell.id.split("-")[1],
        rowId,
        start.format("DD.M.YYYY") + "-" + end.format("DD.MM.YYYY")
      );
    }
  );
}

function openToDoListModal(columnInfo) {
  let rowId = columnInfo.parentElement.id.split("-")[0];
  let columnName = columnInfo.parentElement.id.split("-")[1];
  if (columnInfo.getAttribute("data-toggle") === "modal") {
    $("#toDoListModal").modal("show");
    $("#toDoList").bootstrapTable("destroy").bootstrapTable({
      data: toDoListData,
    });
  }
}

function openWorkOrderDetailModal(cell, rowId) {
  let columnName = cell.id.split("-")[1];
  $("#workOrderDetailModal").modal("show");
  $("#workOrderDetail").bootstrapTable("destroy").bootstrapTable({
    data: workOrderDetailData,
  });
  const table = document.getElementById("workOrderDetail");
  for (let i in table.rows) {
    let row = table.rows[i];
    if (row.rowIndex !== 0) {
      for (let j in row.cells) {
        let col = row.cells[j];

        if (col.cellIndex === 13) {
          if (col.innerHTML.includes("Onay")) {
            col.setAttribute("class", "bc-vivid-green");
          }
          if (col.innerHTML.includes("Red")) {
            col.setAttribute("class", "bc-vivid-red");
          }
          if (col.innerHTML.includes("İptal")) {
            col.setAttribute("class", "bc-vivid-purple");
          }
        }
      }
    }
  }
}

function openPartsOrdersAndPickingModal(cell, rowId) {
  let columnName = cell.id.split("-")[1];
  $("#partsOrdersAndPickingModal").modal("show");
  $("#partsOrdersAndPicking").bootstrapTable("destroy").bootstrapTable({
    data: partsOrdersAndPickingeData,
  });
  document.getElementById("total-record").innerHTML =
    partsOrdersAndPickingeData.length;

  // Seçili checkbox sayısı
  var tdCheckboxes = $('#partsOrdersAndPicking td input[type="checkbox"]');
  var thCheckboxes = $('#partsOrdersAndPicking th input[type="checkbox"]');
  var countCheckedCheckboxes = 0;
  $("#total-selected").text(0);
  tdCheckboxes.change(function () {
    countCheckedCheckboxes = tdCheckboxes.filter(":checked").length;
    $("#total-selected").text(countCheckedCheckboxes);
  });

  thCheckboxes.change(function () {
    countCheckedCheckboxes = tdCheckboxes.filter(":checked").length;
    $("#total-selected").text(countCheckedCheckboxes);
  });

  // Beklenen Teslim tarihi
  $("#deliveryDate").daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      locale: {
        format: "DD.M.YYYY",
      },
    },
    function (start, end, label) {
      console.log(start.format("DD.M.YYYY"));
    }
  );
}

function editTable(tdId, rowId) {
  var clickedTr = document.getElementById(rowId);
  clickedTd = clickedTr.getElementsByTagName("td")[tdId];

  var checkEditableInput = document.getElementById("editable-input");

  if (checkEditableInput === null) {
    var editableInput = document.createElement("input");
    editableInput.setAttribute("id", "editable-input");
    editableInput.setAttribute("value", clickedTd.innerHTML);
    clickedTd.innerHTML = "";
    clickedTd.appendChild(editableInput);
  } else {
    var editableInput = document.getElementById("editable-input");
    editableInput.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        clickedTd.innerHTML = editableInput.value;
        editableInput.remove();
        editAjax(tdId.split("-")[1], rowId, editableInput.value);
      }
    });
  }
}

function createSelectBox(col, optionsData, columnName) {
  var columnValue = col.innerHTML;
  col.innerHTML = "";
  var selectBox = document.createElement("SELECT");
  selectBox.setAttribute("id", col.id + "-select");
  selectBox.setAttribute("class", "selectpicker");
  selectBox.setAttribute("onchange", "changeSelect(this)");
  col.appendChild(selectBox);

  Object.keys(optionsData).map(function (key) {
    var option = document.createElement("option");
    option.setAttribute("value", key);
    var optionValue = document.createTextNode(optionsData[key]);
    option.appendChild(optionValue);
    if (columnValue === optionsData[key]) {
      option.setAttribute("selected", true);
    }
    if (columnName === "customerPartsInformation") {
      let backColor = "white";
      if (optionsData[key] === "Parça Bekleniyor") {
        backColor = "#b1d7ff";
      } else if ((backColor = optionsData[key] === "Stokta")) {
        backColor = "#c5fecc";
      } else {
        backColor = "white";
      }
      option.style.color = "black";
      option.style.backgroundColor = backColor;
    }

    selectBox.appendChild(option);
  });
}

function editAjax(columnName, rowId, newValue) {
  console.log(
    "id:" + rowId + ", column: " + columnName,
    "newValue: " + newValue
  );
}

// Sabitlenecek kolonlar
function fixedColumn(row, i) {
  let columnWidth = 0;
  for (let x in row.cells) {
    let col = row.cells[x];
    if (col.cellIndex === 0) {
      col.setAttribute("style", "left: 0px;position: sticky;z-index:60;");
    } else {
      if (col.cellIndex <= numberOfColumnsFixed + 1) {
        columnWidth +=
          row.cells[x - 1] !== undefined &&
          calculateOffsetWidth(
            table.rows[i].cells[x - 1].getBoundingClientRect()
          );
        if (col.cellIndex <= numberOfColumnsFixed) {
          col.setAttribute(
            "style",
            "left:" + columnWidth + "px;position: sticky;z-index:60;"
          );
        }

        if (col.cellIndex === numberOfColumnsFixed + 1) {
        }
      }
    }
  }
}

// Scrollbar pozisyonunun sabit kolonlara göre ayarlar
function scrollBarPosition() {
  let totalWidth = 0;
  let row = table.rows[0];
  for (let j in row.cells) {
    if (j <= numberOfColumnsFixed) {
      totalWidth +=
        row.cells[j] !== undefined &&
        calculateOffsetWidth(row.cells[j].getBoundingClientRect());
    }
  }
  var style = document.createElement("style");
  style.innerHTML =
    `::-webkit-scrollbar {
      width: 2px;
      height: 10px;
    }::-webkit-scrollbar-track {
      background: #f1f1f1;
      margin-left: ` +
    totalWidth +
    `px;
    }::-webkit-scrollbar-thumb {
      background: #888;
    }::-webkit-scrollbar-thumb:hover {
      background: rgb(145, 145, 145);
    }`;
  document.body.appendChild(style);
}

// Sütun genişliğini hesaplar
function calculateOffsetWidth(element) {
  var width;
  if (element.width) {
    width = element.width;
  } else {
    width = element.right - element.left;
  }

  return parseFloat(width.toFixed(2));
}

function detailButtonSign() {
  mainTableData.map((item) => {
    if (dataDetailArrays[item.id] !== undefined) {
      dataDetailArrays[item.id].map((x) => {
        data.map((t) => {
          if (t.id === x.id) {
            $("#detail" + item.id)
              .children()
              .text("-");
          }
        });
      });
    }
  });

  let plusNumber = 0;
  let minusNumber = 0;
  var detailIcons = document.getElementsByClassName("detailButton");
  detailIcons.forEach((element) => {
    element.innerHTML === "+" && plusNumber++;
    element.innerHTML === "-" && minusNumber++;
  });

  if (detailIcons.length === plusNumber) {
    $(".openAllDetails").text("+");
  } else if (detailIcons.length === minusNumber) {
    $(".openAllDetails").text("-");
  } else {
  }
}
