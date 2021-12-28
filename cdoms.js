const numberOfColumnsFixed = 5;
const table = document.getElementById("table");

$(document).ready(function () {
  $("#table")
    .bootstrapTable("destroy")
    .bootstrapTable({
      onSort: function () {
        //tableConfig();
      },
      onSearch: function () {
        tableConfig();
      },
      data: data,
      exportDataType: $(this).val(),
      exportTypes: ["excel"],
    });
});

$(function () {
  tableConfig();

  // Tüm detayları açmak için
  const thead = document.querySelector("thead");
  if (thead) {
    thead.addEventListener("click", function (e) {
      const cell = e.target.closest("th");
      console.log(cell.id);
      if (cell.id === "detail-view") {
        var detailIcons = document.getElementsByClassName("detail-icon");
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

      if (
        cell.classList.contains("editableDateRangePicker") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDateRangePicker(cell, row.id);
      }

      if (
        cell.id.split("-")[1] === "itemNo" &&
        cell.getAttribute("data-toggle") === "modal" &&
        e.target.id !== ""
      ) {
        openWorkOrderDetailModal(cell, row.id);
      }

      if (
        cell.classList.contains("openModalPartsList") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openPartsOrdersAndPickingModal(cell, row.id);
      }

      if (
        cell.classList.contains("editableDatePicker") &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDatePicker(cell, row.id);
      }

      if (cell.classList.contains("editableInput")) {
        //Tablo detayına tıklanmışsa ilk alan true
        editTable(
          row.className !== "detail-tr" ? false : true,
          e.target.id,
          cell.id,
          row.id
        );
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
    fixedColumn(table, row, i, 5);

    if (row.rowIndex === 0) {
      row.cells[0].innerHTML =
        "<div class='th-inner'><div class='openAllDetails'>+</div></div>";
      row.cells[0].setAttribute("id", "detail-view");
    }

    if (row.rowIndex !== 0) {
      for (let j in row.cells) {
        let col = row.cells[j];
        let colName = Object.keys(data[row.getAttribute("data-index")])[
          col.cellIndex
        ];
        if (col.cellIndex !== undefined && col.cellIndex !== 0) {
          row.setAttribute("id", data[row.getAttribute("data-index")].id);

          col.setAttribute(
            "id",
            data[row.getAttribute("data-index")].id + "-" + colName
          );
        }
        $("#table").bootstrapTable("refresh");
        if (col.classList) {
          // Editable input
          if (col.classList.contains("editableInput")) {
            col.classList.add("bc-blue");
          }
          // DateRangePicker ve DatePicker kolonları
          if (
            col.classList.contains("editableDateRangePicker") ||
            col.classList.contains("editableDatePicker")
          ) {
            col.classList.add("bc-blue");
            col.setAttribute("data-toggle", "modal");
            col.classList.add("textDecoration");
          }

          // Select kolonları
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

        if (colName === "itemNo") {
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
      editAjax(cell.id, rowId, start.format("DD.M.YYYY"));
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
        cell.id,
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

function detailFormatter(index, row) {
  let detailTable = document.createElement("table");

  let detailTableBody = document.createElement("tbody");

  dataDetail[row.id].map((item) => {
    let firstColumnWidth =
      document.getElementById("table").rows[1].cells[0].offsetWidth;

    var tr = document.createElement("tr");
    tr.setAttribute("class", "detail-tr");

    var firstTd = document.createElement("td");
    firstTd.setAttribute(
      "style",
      "width:" + firstColumnWidth + "px;position:sticky;left:0px;z-index:60;"
    );

    tr.appendChild(firstTd);

    let i = 1;
    let distanceColumnWidth = 0;
    for (const [key, value] of Object.entries(item)) {
      if (key !== "id") {
        tr.setAttribute("id", item.id);
        let columnWidth =
          document.getElementById("table").rows[1].cells[i].offsetWidth;
        var td = document.createElement("td");
        td.innerHTML = value;
        if (i <= 5) {
          distanceColumnWidth +=
            document.getElementById("table").rows[1].cells[i - 1].offsetWidth;

          td.setAttribute(
            "style",
            "max-width:" +
              columnWidth +
              "px; min-width:" +
              columnWidth +
              "px;position:sticky;left:" +
              distanceColumnWidth +
              "px;z-index:60;"
          );
        } else {
          td.setAttribute(
            "style",
            "max-width:" + columnWidth + "px; min-width:" + columnWidth + "px;"
          );
        }

        td.setAttribute("id", item.id + "-" + key);

        let mainRow = document.getElementById(row.id).cells[i];

        if (mainRow && mainRow.classList !== undefined && mainRow.classList) {
          if (mainRow.classList.contains("editableInput")) {
            td.classList.add("bc-blue");
          }
          if (mainRow.classList.contains("editableDateRangePicker")) {
            td.classList.add("editableDateRangePicker");
          }

          if (mainRow.classList.contains("editableDatePicker")) {
            td.classList.add("editableDatePicker");
          }
          if (
            mainRow.classList.contains("editableDateRangePicker") ||
            mainRow.classList.contains("editableDatePicker")
          ) {
            td.classList.add("bc-blue");
            td.classList.add("textDecoration");
            td.setAttribute("data-toggle", "modal");
          }

          if (mainRow.classList.contains("editableInput")) {
            td.classList.add("editableInput");
          }

          if (mainRow.classList.contains("editableSelect")) {
            td.classList.add("editableSelect");

            if (key === "isDismantling") {
              td.classList.add("bc-blue");

              createSelectBox(td, dismantlingSelectOptions);
            }

            if (key === "customerPartsInformation") {
              // müşteri parça bilgisi - arka plan rengi
              if (value.includes("Bekleniyor") || value.includes("Stokta")) {
                td.classList.add("bc-green");
              }

              if (value.includes("Hayır")) {
                td.classList.add("bc-orange");
              }

              createSelectBox(td, trackInformation);
            }
          }

          if (mainRow.classList.contains("openModalPartsList")) {
            td.classList.add("openModalPartsList");
            td.setAttribute("data-toggle", "modal");
            td.classList.add("textDecoration");
            // parça listesi
            if (value.includes("Var")) {
              td.classList.add("bc-green");
            }
            if (value.includes("Yok")) {
              td.classList.add("bc-orange");
            }
          }
        }

        if (key === "offerStatus") {
          // teklif durumu
          if (value.includes("Onay")) {
            td.setAttribute("class", "bc-green");
          }
          if (value.includes("Red")) {
            td.setAttribute("class", "bc-orange");
          }
        }

        tr.appendChild(td);
        i++;
      }
    }
    detailTableBody.appendChild(tr);
  });

  detailTable.appendChild(detailTableBody);

  return detailTable;
}

function editTable(isDetail, eTargetId, tdId, rowId) {
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

function fixedColumn(table, row, i) {
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
