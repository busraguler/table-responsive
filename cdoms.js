$(function () {
  $(document).ready(function () {
    /*****Seçili checkbox sayısı */ //
    var checkedRows = [];
    $("#partsOrdersAndPicking").on("check.bs.table", function (e, row) {
      let checkRow = checkedRows.find((x) => x.id === row.id);
      if (!checkRow) {
        checkedRows.push({ id: row.id });
      }
      document.getElementById("total-selected").innerHTML = checkedRows.length;
    });

    $("#partsOrdersAndPicking").on("uncheck.bs.table", function (e, row) {
      $.each(checkedRows, function (index, value) {
        if (row !== undefined && value !== undefined && value.id === row.id) {
          checkedRows.splice(index, 1);
        }
      });
      document.getElementById("total-selected").innerHTML = checkedRows.length;
    });
    /*****Seçili checkbox sayısı */ //
  });

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
        row.setAttribute("id", data[row.rowIndex - 1].id);
        if (col.cellIndex !== undefined) {
          col.setAttribute(
            "id",
            data[row.rowIndex - 1].id +
              "-" +
              Object.keys(data[row.rowIndex - 1])[col.cellIndex - 1]
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

      if (cell.cellIndex === 12 || cell.cellIndex === 27) {
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
  console.log(rowId, columnName);
  if (columnInfo.getAttribute("data-toggle") === "modal") {
    $("#toDoListModal").modal("show");
    $("#toDoList").bootstrapTable("destroy").bootstrapTable({
      data: toDoListData,
    });
  }
}

function openWorkOrderDetailModal(cell, rowId) {
  let columnName = cell.id.split("-")[1];
  console.log(rowId, columnName);
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
  console.log(rowId, columnName);
  $("#partsOrdersAndPickingModal").modal("show");
  $("#partsOrdersAndPicking").bootstrapTable("destroy").bootstrapTable({
    data: partsOrdersAndPickingeData,
  });
  document.getElementById("total-record").innerHTML =
    partsOrdersAndPickingeData.length;
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
          td.setAttribute("class", "bc-blue");
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
          // parça listesi - arka plan rengi
          if (value.includes("Var")) {
            td.setAttribute("class", "bc-green");
          }
          if (value.includes("Yok")) {
            td.setAttribute("class", "bc-orange");
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
        }

        if (i === 12 || i === 27) {
          //düzenlenebilir kolonların - arka plan rengi
          td.setAttribute("class", "bc-blue");
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
  if (
    eTargetId !== "" &&
    tdId !== "" &&
    eTargetId === tdId &&
    checkEditableInput === null
  ) {
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
        editAjax(tdId, rowId, editableInput.value);
      }
    });

    editableInput.addEventListener("mouseout", function (event) {
      event.preventDefault();
      clickedTd.innerHTML = editableInput.value;
      editableInput.remove();
      editAjax(tdId, rowId, editableInput.value);
    });
  }
}

function editAjax(columnName, rowId, newValue) {
  console.log(
    "id:" + rowId + ", column: " + columnName,
    "newValue: " + newValue
  );
}
