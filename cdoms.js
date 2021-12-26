$(function () {
  $(document).ready(function () {});

  $("#table")
    .bootstrapTable("destroy")
    .bootstrapTable({
      data: data,
      exportDataType: $(this).val(),
      exportTypes: ["excel", "pdf"],
    });

  /*  Ana Tablo düzenleme  */
  const table = document.getElementById("table");
  for (let i in table.rows) {
    let row = table.rows[i];
    if (row.rowIndex !== 0) {
      for (let j in row.cells) {
        let col = row.cells[j];
        if (col.cellIndex !== undefined && col.cellIndex !== 0) {
          row.setAttribute("id", data[row.getAttribute("data-index")].id);

          col.setAttribute(
            "id",
            data[row.getAttribute("data-index")].id +
              "-" +
              Object.keys(data[row.getAttribute("data-index")])[col.cellIndex]
          );
        }

        if (
          col.cellIndex === 10 ||
          col.cellIndex === 11 ||
          col.cellIndex === 13 ||
          col.cellIndex === 14 ||
          col.cellIndex === 15 ||
          col.cellIndex === 21 ||
          col.cellIndex === 22 ||
          col.cellIndex === 20 ||
          col.cellIndex === 23 ||
          col.cellIndex === 25
        ) {
          //dateRangePickerModal
          //dataPickerModal
          col.setAttribute("class", "bc-blue");
          col.setAttribute("data-toggle", "modal");
          col.setAttribute("style", "text-decoration:underline;");
        }

        if (col.cellIndex === 2) {
          //workOrderDetailModal
          //toDoListModal
          col.setAttribute("data-toggle", "modal");
          col.innerHTML =
            col.innerHTML +
            "<a class='ml-2' onclick='openToDoListModal(this)' data-toggle='modal'><img src='./workOrder.png' width='20px' height='20px' /></a>";
        }

        if (col.cellIndex === 18) {
          //partsOrdersAndPickingModal
          col.setAttribute("data-toggle", "modal");
          col.setAttribute("style", "text-decoration:underline;");
        }

        if (col.cellIndex === 12 || col.cellIndex === 27) {
          //düzenlenebilir kolonların - arka plan rengi
          col.setAttribute("class", "bc-blue");
        }

        if (col.cellIndex === 17) {
          // teklif durumu - arka plan rengi
          if (col.innerHTML.includes("Onay")) {
            col.setAttribute("class", "bc-green");
          }
          if (col.innerHTML.includes("Red")) {
            col.setAttribute("class", "bc-orange");
          }
        }

        if (col.cellIndex === 18) {
          // parça listesi - arka plan rengi
          if (col.innerHTML.includes("Var")) {
            col.setAttribute("class", "bc-green");
          }
          if (col.innerHTML.includes("Yok")) {
            col.setAttribute("class", "bc-orange");
          }
        }

        if (col.cellIndex === 12) {
          var columnValue = col.innerHTML;
          col.innerHTML = "";

          var selectBox = document.createElement("SELECT");
          selectBox.setAttribute("id", col.id + "-select");
          selectBox.setAttribute("class", "custom-select-box");
          selectBox.setAttribute("onchange", "changeSelect(this)");
          document.getElementById(col.id).appendChild(selectBox);
          Object.keys(dismantlingSelectOptions).map(function (key) {
            var option = document.createElement("option");
            option.setAttribute("value", key);
            var optionValue = document.createTextNode(
              dismantlingSelectOptions[key]
            );
            option.appendChild(optionValue);

            if (columnValue === dismantlingSelectOptions[key]) {
              option.setAttribute("selected", true);
            }

            document.getElementById(col.id + "-select").appendChild(option);
          });
        }

        if (col.cellIndex === 19) {
          // müşteri parça bilgisi - arka plan rengi
          if (
            col.innerHTML.includes("Bekleniyor") ||
            col.innerHTML.includes("Stokta")
          ) {
            col.setAttribute("class", "bc-green");
          }
          if (col.innerHTML.includes("Hayır")) {
            col.setAttribute("class", "bc-orange");
          }
          var columnValue = col.innerHTML;
          col.innerHTML = "";
          var selectBox = document.createElement("SELECT");
          selectBox.setAttribute("id", col.id + "-select");
          selectBox.setAttribute("class", "custom-select-box");
          selectBox.setAttribute("onchange", "changeSelect(this)");
          document.getElementById(col.id).appendChild(selectBox);

          Object.keys(trackInformation).map(function (key) {
            var option = document.createElement("option");
            option.setAttribute("value", key);
            var optionValue = document.createTextNode(trackInformation[key]);
            option.appendChild(optionValue);
            if (columnValue === trackInformation[key]) {
              option.setAttribute("selected", true);
            }
            document.getElementById(col.id + "-select").appendChild(option);
          });
        }
      }
    }
  }
  /*  Ana Tablo düzenleme  */

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
        (cell.cellIndex === 10 ||
          cell.cellIndex === 11 ||
          cell.cellIndex === 13 ||
          cell.cellIndex === 14 ||
          cell.cellIndex === 15 ||
          cell.cellIndex === 21 ||
          cell.cellIndex === 22) &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDateRangePicker(cell, row.id);
      }

      if (
        cell.cellIndex === 2 &&
        cell.getAttribute("data-toggle") === "modal" &&
        e.target.id !== ""
      ) {
        openWorkOrderDetailModal(cell, row.id);
      }

      if (
        cell.cellIndex === 18 &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openPartsOrdersAndPickingModal(cell, row.id);
      }

      if (
        (cell.cellIndex === 20 ||
          cell.cellIndex === 23 ||
          cell.cellIndex === 25) &&
        cell.getAttribute("data-toggle") === "modal"
      ) {
        openDatePicker(cell, row.id);
      }

      if (cell.cellIndex === 27) {
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

function changeSelect(selectElement) {
  let rowId = selectElement.id.split("-")[0];
  let columnName = selectElement.id.split("-")[1];
  let selected = selectElement.value;
  let td = document.getElementById(selectElement.id).parentElement;

  if (columnName === "customerPartsInformation") {
    if (selected === "1" || selected === "2") {
      td.setAttribute("class", "bc-green");
    }
    if (selected === "3") {
      td.setAttribute("class", "bc-orange");
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

        if (col.cellIndex === 14) {
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
    firstTd.setAttribute("style", "width:" + firstColumnWidth + "px;");

    tr.appendChild(firstTd);

    let i = 1;
    for (const [key, value] of Object.entries(item)) {
      console.log(value);
      if (key !== "id") {
        tr.setAttribute("id", item.id);
        let columnWidth =
          document.getElementById("table").rows[1].cells[i].offsetWidth;

        var td = document.createElement("td");
        td.innerHTML = value;
        td.setAttribute(
          "style",
          "max-width:" + columnWidth + "px; min-width:" + columnWidth + "px;"
        );
        td.setAttribute("id", item.id + "-" + key);

        if (
          i === 10 ||
          i === 11 ||
          i === 13 ||
          i === 14 ||
          i === 15 ||
          i === 21 ||
          i === 22 ||
          i === 25 ||
          i === 23 ||
          i === 20
        ) {
          //DateRangePicker
          td.setAttribute("class", "bc-blue textDecoration");
          td.setAttribute("data-toggle", "modal");
        }

        if (i === 17) {
          // teklif durumu - arka plan rengi
          if (value.includes("Onay")) {
            td.setAttribute("class", "bc-green");
          }
          if (value.includes("Red")) {
            td.setAttribute("class", "bc-orange");
          }
        }

        if (i === 18) {
          td.setAttribute("data-toggle", "modal");
          // parça listesi - arka plan rengi
          if (value.includes("Var")) {
            td.setAttribute("class", "bc-green textDecoration");
          }
          if (value.includes("Yok")) {
            td.setAttribute("class", "bc-orange textDecoration");
          }
        }

        if (i === 19) {
          // müşteri parça bilgisi - arka plan rengi
          if (value.includes("Bekleniyor") || value.includes("Stokta")) {
            td.setAttribute("class", "bc-green");
          }

          if (value.includes("Hayır")) {
            td.setAttribute("class", "bc-orange");
          }
          console.log(td.innerHTML);
          var columnValue = td.innerHTML;
          td.innerHTML = "";

          var selectBox = document.createElement("SELECT");
          selectBox.setAttribute("id", td.id + "-select");
          selectBox.setAttribute("class", "custom-select-box");
          selectBox.setAttribute("onchange", "changeSelect(this)");
          td.appendChild(selectBox);

          Object.keys(trackInformation).map(function (key) {
            var option = document.createElement("option");
            option.setAttribute("value", key);
            var optionValue = document.createTextNode(trackInformation[key]);
            option.appendChild(optionValue);
            if (columnValue === trackInformation[key]) {
              option.setAttribute("selected", true);
            }
            selectBox.appendChild(option);
          });
        }

        if (i === 12 || i === 27) {
          //düzenlenebilir kolonların - arka plan rengi
          td.setAttribute("class", "bc-blue");
        }

        if (i === 12) {
          var columnValue = td.innerHTML;
          td.innerHTML = "";

          var selectBox = document.createElement("SELECT");
          selectBox.setAttribute("id", td.id + "-select");
          selectBox.setAttribute("class", "custom-select-box");
          selectBox.setAttribute("onchange", "changeSelect(this)");
          td.appendChild(selectBox);
          Object.keys(dismantlingSelectOptions).map(function (key) {
            var option = document.createElement("option");
            option.setAttribute("value", key);
            var optionValue = document.createTextNode(
              dismantlingSelectOptions[key]
            );
            option.appendChild(optionValue);

            if (columnValue === dismantlingSelectOptions[key]) {
              option.setAttribute("selected", true);
            }

            selectBox.appendChild(option);
          });
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

function editAjax(columnName, rowId, newValue) {
  console.log(
    "id:" + rowId + ", column: " + columnName,
    "newValue: " + newValue
  );
}
