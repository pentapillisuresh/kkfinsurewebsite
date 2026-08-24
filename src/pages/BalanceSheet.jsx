import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import * as XLSX from "xlsx";
import { useApi } from '../hooks/useApi';
import { userApi } from '../api';
import "../styles/BalanceSheet.css";

const BalanceSheet = () => {
  const navigate = useNavigate();

  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const monthOptions = [
    { label: "Jan", value: "Jan" },
    { label: "Feb", value: "Feb" },
    { label: "Mar", value: "Mar" },
    { label: "Apr", value: "Apr" },
    { label: "May", value: "May" },
    { label: "Jun", value: "Jun" },
    { label: "Jul", value: "Jul" },
    { label: "Aug", value: "Aug" },
    { label: "Sep", value: "Sep" },
    { label: "Oct", value: "Oct" },
    { label: "Nov", value: "Nov" },
    { label: "Dec", value: "Dec" },
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = [];

  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push({
      label: String(i),
      value: String(i),
    });
  }

  // ---------------------------------------------------------
  // Generate Balance Sheet
  // ---------------------------------------------------------

  const handleGenerate = async () => {
    if (!startMonth || !startYear || !endMonth || !endYear) {
      window.alert(
        "Please select both start and end month/year."
      );
      return;
    }

    const startMonthIndex =
      monthOptions.findIndex(
        (m) => m.value === startMonth
      ) + 1;

    const endMonthIndex =
      monthOptions.findIndex(
        (m) => m.value === endMonth
      ) + 1;

    const startDate = `${startYear}-${String(
      startMonthIndex
    ).padStart(2, "0")}-01`;

    /*
      Use the actual last day of the selected month.
      This is better than using 28 as in the original code.
    */
    const lastDay = new Date(
      Number(endYear),
      endMonthIndex,
      0
    ).getDate();

    const endDate = `${endYear}-${String(
      endMonthIndex
    ).padStart(2, "0")}-${String(lastDay).padStart(
      2,
      "0"
    )}`;

    if (new Date(startDate) > new Date(endDate)) {
      window.alert(
        "Start date cannot be after end date."
      );
      return;
    }

    setLoading(true);

    try {
      const {data} =
        await userApi.generateBalanceSheet({
          periodStart: startDate,
          periodEnd: endDate,
        });

      console.log("startDate:", startDate);
      console.log("endDate:", endDate);

      console.log(
        "BALANCE SHEET RESPONSE:",
        data
      );

      console.log(
        "USER:",
        data?.data.user
      );

      console.log(
        "TRANSACTION COUNT:",
        data?.data?.transactions?.length
      );

      console.log(
        "TRANSACTIONS:",
        data?.data?.transactions
      );

      if (data.success) {
        console.log("INSIDE")
        setGeneratedData(data.data);
        setSummary(data.data.summary);
        setTransactions(
          data.data.transactions || []
        );
        setShowModal(true);
      } else {
        window.alert(
          data.message ||
            "Failed to generate balance sheet."
        );
      }
    } catch (error) {
      console.error(error);

      window.alert(
        error?.message ||
          "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Download Excel
  // ---------------------------------------------------------

  const downloadExcel = () => {
    if (!generatedData) {
      window.alert("No data to export.");
      return;
    }

    try {
      setLoading(true);

      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["BALANCE SHEET SUMMARY"],
        [""],
        [
          "User:",
          generatedData.user?.fullName || "",
        ],
        [
          "Email:",
          generatedData.user?.email || "",
        ],
        [
          "Period Start:",
          generatedData.summary?.period?.start || "",
        ],
        [
          "Period End:",
          generatedData.summary?.period?.end || "",
        ],
        [""],
        ["TOTALS"],
        [
          "Total Investments:",
          generatedData.summary?.totalInvestments || 0,
        ],
        [
          "Total Returns:",
          generatedData.summary?.totalReturns || 0,
        ],
        [
          "Total referrer payouts:",
          generatedData.summary?.totalCommissions || 0,
        ],
        [
          "Net Worth:",
          generatedData.summary?.netWorth || 0,
        ],
      ];

      const ws1 =
        XLSX.utils.aoa_to_sheet(summaryData);

      ws1["!cols"] = [
        { wch: 25 },
        { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(
        wb,
        ws1,
        "Summary"
      );

      // Transactions sheet
      const txData = [
        [
          "Date",
          "Description",
          "Type",
          "ROI",
          "Amount (₹)",
          "Balance (₹)",
        ],
      ];

      if (
        generatedData.transactions &&
        generatedData.transactions.length > 0
      ) {
        generatedData.transactions.forEach(
          (tx) => {
            txData.push([
              tx.formattedDate ||
                tx.date ||
                "",
              tx.description || "",
              tx.type || "",
              tx.ROI || "",
              tx.amount || 0,
              tx.balance || 0,
            ]);
          }
        );
      } else {
        txData.push([
          "No transactions found",
          "",
          "",
          "",
          "",
          "",
        ]);
      }

      const ws2 =
        XLSX.utils.aoa_to_sheet(txData);

      ws2["!cols"] = [
        { wch: 15 },
        { wch: 35 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(
        wb,
        ws2,
        "Transactions"
      );

      const timestamp =
        new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);

      const filename =
        `balance_sheet_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);

    } catch (error) {
      console.error(
        "Excel generation error:",
        error
      );

      window.alert(
        "Failed to generate Excel file."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Download CSV
  // ---------------------------------------------------------

  const downloadCSV = () => {
    if (!generatedData) {
      window.alert("No data to export.");
      return;
    }

    try {
      setLoading(true);

      const escapeCSV = (value) => {
        const stringValue =
          value === null ||
          value === undefined
            ? ""
            : String(value);

        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;
      };

      let csvContent = "";

      csvContent +=
        "BALANCE SHEET SUMMARY\n\n";

      csvContent +=
        `User,${escapeCSV(
          generatedData.user?.fullName
        )}\n`;

      csvContent +=
        `Email,${escapeCSV(
          generatedData.user?.email
        )}\n`;

      csvContent +=
        `Period Start,${escapeCSV(
          generatedData.summary?.period?.start
        )}\n`;

      csvContent +=
        `Period End,${escapeCSV(
          generatedData.summary?.period?.end
        )}\n\n`;

      csvContent += "TOTALS\n";

      csvContent +=
        `Total Investments,${generatedData.summary?.totalInvestments || 0}\n`;

      csvContent +=
        `Total Returns,${generatedData.summary?.totalReturns || 0}\n`;

      csvContent +=
        `Total referrer payouts,${generatedData.summary?.totalCommissions || 0}\n`;

      csvContent +=
        `Net Worth,${generatedData.summary?.netWorth || 0}\n\n`;

      csvContent += "TRANSACTIONS\n";

      csvContent +=
        "Date,Description,Type,ROI,Amount (₹),Balance (₹)\n";

      if (
        generatedData.transactions &&
        generatedData.transactions.length > 0
      ) {
        generatedData.transactions.forEach(
          (tx) => {
            csvContent += [
              escapeCSV(
                tx.formattedDate ||
                  tx.date ||
                  ""
              ),
              escapeCSV(
                tx.description || ""
              ),
              escapeCSV(tx.type || ""),
              escapeCSV(tx.ROI || ""),
              escapeCSV(tx.amount || 0),
              escapeCSV(tx.balance || 0),
            ].join(",") + "\n";
          }
        );
      } else {
        csvContent +=
          "No transactions found,,,,,\n";
      }

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `balance_sheet_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "CSV generation error:",
        error
      );

      window.alert(
        "Failed to generate CSV file."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // PDF / Print
  // ---------------------------------------------------------

  const downloadPDF = () => {
    if (!generatedData) {
      window.alert("No data to export.");
      return;
    }

    const transactionsHTML =
      generatedData.transactions
        ?.map((t) => {
          const isNegative =
            Number(t.amount) < 0;

          return `
            <tr>
              <td>${t.formattedDate || ""}</td>

              <td>
                ${t.description || ""}
              </td>

              <td>
                ${t.type || ""}
              </td>

              <td>
                ${t.ROI ? `${parseInt(t.ROI, 10)}%` : "-"}
              </td>

              <td style="
                text-align:right;
                color:${isNegative ? "#E03333" : "#7CB80B"};
                font-weight:bold;
              ">
                ${
                  isNegative
                    ? "-"
                    : "+"
                }₹${Math.abs(
            Number(t.amount || 0)
          )}
              </td>

              <td style="text-align:right">
                ₹${t.balance || 0}
              </td>
            </tr>
          `;
        })
        .join("") || "";

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!printWindow) {
      window.alert(
        "Please allow pop-ups to generate the PDF."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Balance Sheet</title>

          <meta charset="UTF-8">

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              font-family:
                Arial,
                Helvetica,
                sans-serif;

              padding: 40px;

              color: #1A2332;

              background: white;
            }

            .container {
              max-width: 900px;
              margin: auto;
            }

            .logo {
              text-align: center;
              margin-bottom: 20px;
            }

            .logo img {
              max-width: 140px;
            }

            .tagline {
              color: #6B7A8F;
              font-size: 12px;
              margin-top: 5px;
            }

            h1 {
              text-align: center;
              font-size: 28px;
              border-bottom:
                3px solid #2B46D5;
              padding-bottom: 15px;
            }

            .header {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }

            .header p {
              margin: 7px 0;
            }

            .header strong {
              color: #2B46D5;
            }

            .summary {
              background: #f0f4ff;
              border-left:
                4px solid #2B46D5;

              padding: 20px;

              border-radius: 8px;

              margin: 20px 0;
            }

            .summary-row {
              display: flex;
              justify-content:
                space-between;

              padding: 7px 0;
            }

            .summary-total {
              border-top:
                2px solid #2B46D5;

              margin-top: 10px;

              padding-top: 12px;

              font-size: 17px;

              font-weight: bold;
            }

            table {
              width: 100%;
              border-collapse:
                collapse;

              margin-top: 15px;
            }

            th {
              background:
                #2B46D5;

              color: white;

              padding: 10px;

              text-align: left;
            }

            td {
              padding: 9px;

              border-bottom:
                1px solid #E8ECF0;
            }

            tr:nth-child(even) {
              background:
                #f8f9fa;
            }

            .footer {
              margin-top: 30px;

              text-align: center;

              color: #6B7A8F;

              font-size: 12px;

              border-top:
                1px solid #E8ECF0;

              padding-top: 20px;
            }

            @media print {
              body {
                padding: 20px;
              }

              .no-print {
                display: none;
              }
            }

          </style>
        </head>

        <body>

          <div class="container">

            <div class="logo">
              ${
                "/images/logo3.jpeg"
                  ? `<img src="./images/logo3.jpeg" />`
                  : ""
              }

              <div class="tagline">
                Wealth | Trust | Growth
              </div>
            </div>

            <h1>
              Balance Sheet
            </h1>

            <div class="header">

              <p>
                <strong>User:</strong>
                ${
                  generatedData.user
                    ?.fullName || ""
                }
              </p>

              <p>
                <strong>Email:</strong>
                ${
                  generatedData.user
                    ?.email || ""
                }
              </p>

              <p>
                <strong>Period:</strong>
                ${
                  generatedData.summary
                    ?.period?.start
                    ?.slice(0, 7) || ""
                }
                to
                ${
                  generatedData.summary
                    ?.period?.end
                    ?.slice(0, 7) || ""
                }
              </p>

            </div>

            <div class="summary">

              <h3>
                Summary
              </h3>

              <div class="summary-row">
                <span>
                  Total Investments
                </span>

                <span>
                  ₹${
                    generatedData.summary
                      ?.totalInvestments || 0
                  }
                </span>
              </div>

              <div class="summary-row">
                <span>
                  Total Returns
                </span>

                <span>
                  ₹${
                    generatedData.summary
                      ?.totalReturns || 0
                  }
                </span>
              </div>

              <div class="summary-row">
                <span>
                  Total payouts
                </span>

                <span>
                  ₹${
                    generatedData.summary
                      ?.totalCommissions || 0
                  }
                </span>
              </div>

              <div class="summary-row summary-total">

                <span>
                  Net Worth
                </span>

                <span>
                  ₹${
                    generatedData.summary
                      ?.netWorth || 0
                  }
                </span>

              </div>

            </div>

            <h2>
              Transactions
            </h2>

            <table>

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>ROI</th>
                  <th>Amount</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                ${transactionsHTML}
              </tbody>

            </table>

            <div class="footer">

              Generated on
              ${new Date().toLocaleDateString(
                "en-IN"
              )}

              <br />

              © ${new Date().getFullYear()}
              KKFinsure.
              All rights reserved.

            </div>

          </div>

          <script>

            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };

          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ---------------------------------------------------------
  // Transaction row
  // ---------------------------------------------------------

  const renderTransaction = (
    item,
    index
  ) => {
    const isCredit =
      item.type === "return" ||
      item.type === "commission";

    const isDebit =
      item.type === "debit";

    return (
      <div
        className="transaction-row"
        key={
          item.id || index
        }
      >
        <div className="tx-date">
          {item.formattedDate ||
            "-"}
        </div>

        <div className="tx-roi">
          {item.ROI
            ? `${parseInt(
                item.ROI,
                10
              )}%`
            : "-"}
        </div>

        <div className="tx-amount positive">
          {isCredit &&
          Number(item.amount) > 0
            ? `+${item.amount}`
            : ""}
        </div>

        <div className="tx-amount negative">
          {isDebit &&
          Number(item.amount) < 0
            ? `-${Math.abs(
                item.amount
              )}`
            : ""}
        </div>

        <div className="tx-balance">
          ₹{item.balance ?? 0}
        </div>
      </div>
    );
  };

  return (
    <div className="balance-page">

  
{/* Header with Logo */}
{/* Header with Logo */}
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    {/* Left Section: Logo + Text Below */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/images/logo3.jpeg" 
            alt="Logo" 
            className="h-14 w-14 sm:h-12 sm:w-auto bg-transparent sm:bg-white rounded-lg p-0 sm:p-1 shadow-none sm:shadow-md object-contain"
          />
        </div>
        {/* Text Below Logo - On all devices */}
        <div className="flex flex-col items-center mt-1">
          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Asset - Wealth Management
          </p>
          <p className="text-[10px] sm:text-xs text-blue-200 font-medium tracking-wide text-center">
            Wealth | Trust | Growth
          </p>
        </div>
      </div>
    </div>

    {/* Right Section: Balance Sheet + Statement Badge */}
    <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="text-right">
        <h1 className="text-lg sm:text-2xl font-bold truncate">Balance Sheet</h1>
        <p className="text-blue-100 text-xs sm:text-sm truncate">Generate and manage your statements</p>
      </div>
      
      {/* Statement Badge */}
      <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm flex-shrink-0">
        <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <span className="font-semibold text-sm sm:text-base truncate">
          Statement
        </span>
      </div>
    </div>
  </div>
</div>

      {/* Main */}

      <main className="balance-content">

        <p className="subtitle">
          Select period to generate
          statement
        </p>

        {/* Start */}

        <div className="form-row">

          <div className="form-group">

            <label>
              Start Month
            </label>

            <select
              value={startMonth}
              onChange={(e) =>
                setStartMonth(
                  e.target.value
                )
              }
            >
              <option value="">
                Select month
              </option>

              {monthOptions.map(
                (month) => (
                  <option
                    key={
                      month.value
                    }
                    value={
                      month.value
                    }
                  >
                    {month.label}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              Start Year
            </label>

            <select
              value={startYear}
              onChange={(e) =>
                setStartYear(
                  e.target.value
                )
              }
            >

              <option value="">
                Select year
              </option>

              {yearOptions.map(
                (year) => (
                  <option
                    key={
                      year.value
                    }
                    value={
                      year.value
                    }
                  >
                    {year.label}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* End */}

        <div className="form-row">

          <div className="form-group">

            <label>
              End Month
            </label>

            <select
              value={endMonth}
              onChange={(e) =>
                setEndMonth(
                  e.target.value
                )
              }
            >

              <option value="">
                Select month
              </option>

              {monthOptions.map(
                (month) => (
                  <option
                    key={
                      month.value
                    }
                    value={
                      month.value
                    }
                  >
                    {month.label}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              End Year
            </label>

            <select
              value={endYear}
              onChange={(e) =>
                setEndYear(
                  e.target.value
                )
              }
            >

              <option value="">
                Select year
              </option>

              {yearOptions.map(
                (year) => (
                  <option
                    key={
                      year.value
                    }
                    value={
                      year.value
                    }
                  >
                    {year.label}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* Generate */}

        <button
          className="generate-button"
          onClick={
            handleGenerate
          }
          disabled={loading}
        >

          {loading
            ? "Generating..."
            : "Generate Balance Sheet"}

        </button>

      </main>

      {/* Result Modal */}

      {showModal && (
        <div className="modal-overlay">

          <div className="result-modal">

            <div className="modal-header">

              <h2>
                Balance Sheet
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              {/* Download Buttons */}

              <div className="download-row">

                <button
                  className="download-button pdf"
                  onClick={
                    downloadPDF
                  }
                >
                  📄 PDF
                </button>

                <button
                  className="download-button excel"
                  onClick={
                    downloadExcel
                  }
                >
                  📊 Excel
                </button>

                <button
                  className="download-button csv"
                  onClick={
                    downloadCSV
                  }
                >
                  📋 CSV
                </button>

              </div>

              {/* Summary */}

              {summary && (
                <div className="summary-card">

                  <div className="summary-period">

                    Period:{" "}

                    {summary.period.start.slice(
                      0,
                      7
                    )}

                    {" to "}

                    {summary.period.end.slice(
                      0,
                      7
                    )}

                  </div>

                  <div className="summary-grid">

                    <div>
                      Investments:
                      <strong>
                        ₹
                        {
                          summary.totalInvestments
                        }
                      </strong>
                    </div>

                    <div>
                      Returns:
                      <strong>
                        ₹
                        {
                          summary.totalReturns
                        }
                      </strong>
                    </div>

                    <div>
                      Payouts:
                      <strong>
                        ₹
                        {
                          summary.totalCommissions
                        }
                      </strong>
                    </div>

                    <div>
                      Net Worth:
                      <strong>
                        ₹
                        {
                          summary.netWorth
                        }
                      </strong>
                    </div>

                  </div>

                </div>
              )}

              {/* Transactions */}

              <h3 className="transactions-title">
                Transactions
              </h3>

              <div className="transaction-table">

                <div className="table-header">

                  <div>
                    Date
                  </div>

                  <div>
                    ROI
                  </div>

                  <div>
                    Cr.Amt
                  </div>

                  <div>
                    Dt.Amt
                  </div>

                  <div>
                    Balance
                  </div>

                </div>

                {transactions.length >
                0 ? (
                  transactions.map(
                    renderTransaction
                  )
                ) : (
                  <div className="empty">
                    No transactions
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BalanceSheet;
