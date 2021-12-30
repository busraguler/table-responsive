const numberOfColumnsFixed = 5;
const table = document.getElementById("table");

$(document).ready(function () {
  $("#table")
    .bootstrapTable("destroy")
    .bootstrapTable({
      onPostBody: function (data) {
        tableConfig();
      },

      data: data,
      exportDataType: $(this).val(),
      exportTypes: ["excel"],
    });
});

$(function () {
  const thead = document.querySelector("thead");
  if (thead) {
    thead.addEventListener("click", function (e) {
      const cell = e.target.closest("th");
      // Tüm detayları açmak için
      if (cell.id === "detail-view") {
        var detailIcons = document.getElementsByClassName("detailButton");
        detailIcons.forEach((element) => element.click());
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
  /*  Ana Tablo düzenleme */
  for (let i in table.rows) {
    let row = table.rows[i];

    // Kolonları sabitlemek için
    fixedColumn(row, i);

    // Tüm detayları açacak buton
    if (row.rowIndex === 0) {
      row.cells[0].innerHTML =
        "<div class='th-inner'><div class='openAllDetails'>+</div></div>";
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
          if (
            dataDetailArrays[row.getAttribute("data-uniqueid")] !== undefined
          ) {
            col.innerHTML = "<div class='detailButton'>+</div>";

            //    if (row.nextSibling.cells[0].innerHTML === "-") console.log("sc");
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
            col.classList.add("textDecoration");
          }

          // Editable Select
          if (col.classList.contains("editableSelect")) {
            if (colName === "isDismantling") {
              col.classList.add("bc-blue");
              createSelectBox(col, dismantlingSelectOptions);
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
              createSelectBox(col, trackInformation);
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
  let td = document.getElementById(selectElement.id).parentElement;

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

  /* editableInput.addEventListener("mouseout", function (event) {
      event.preventDefault();
      clickedTd.innerHTML = editableInput.value;
      editableInput.remove();
      editAjax(tdId, rowId, editableInput.value);
    });*/
}

function createSelectBox(col, optionsData) {
  var columnValue = col.innerHTML;
  col.innerHTML = "";
  var selectBox = document.createElement("SELECT");
  selectBox.setAttribute("id", col.id + "-select");
  selectBox.setAttribute("class", "custom-select-box");
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
    selectBox.appendChild(option);
  });
}

function editAjax(columnName, rowId, newValue) {
  console.log(
    "id:" + rowId + ", column: " + columnName,
    "newValue: " + newValue
  );
}

function fixedColumn(row, i) {
  let columnWidth = 0;
  for (let x in row.cells) {
    let col = row.cells[x];
    if (col.cellIndex === 0) {
      col.setAttribute("style", "left: 0px;position: sticky;z-index:60;");
    } else {
      columnWidth +=
        row.cells[x - 1] !== undefined &&
        table.rows[i].cells[x - 1].offsetWidth;
      if (col.cellIndex <= numberOfColumnsFixed) {
        col.setAttribute(
          "style",
          "left:" + columnWidth + "px;position: sticky;z-index:60;"
        );
      }
    }
  }
}
