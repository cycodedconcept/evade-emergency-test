import React from "react";

const BillingHistory = () => {
    const data = [
        { invoice: "Basic Plan – Dec 2022", amount: "$10.00", date: "Dec 1, 2024", status: "Paid" },
        { invoice: "Basic Plan – Nov 2022", amount: "$10.00", date: "Nov 1, 2024", status: "Paid" },
        { invoice: "Basic Plan – Oct 2022", amount: "$10.00", date: "Oct 1, 2024", status: "Paid" },
        { invoice: "Basic Plan – Sep 2022", amount: "$10.00", date: "Aug 1, 2024", status: "Paid" },
        { invoice: "Basic Plan – Aug 2022", amount: "$10.00", date: "Jul 1, 2025", status: "Paid" },
        { invoice: "Basic Plan – Jul 2022", amount: "$10.00", date: "Jun 1, 2025", status: "Paid" },
        { invoice: "Basic Plan – Oct 2022", amount: "$10.00", date: "Aug 1, 2025", status: "Paid" },
        { invoice: "Basic Plan – Jul 2022", amount: "$10.00", date: "Jun 1, 2025", status: "Paid" },
        { invoice: "Basic Plan – Jun 2022", amount: "$10.00", date: "Aug 1, 2025", status: "Paid" },
    ];

    return (
        <div className="col-md-9 col-lg-9 p-0 p-lg-3 py-4 mb-4">
            <div className=" mt-4 rounded-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Billing History</h4>
                    <button className="btn btn-outline-secondary rounded-lg">
                        <i className="bi bi-cloud-download mr-1 strong"></i>
                        Download all
                    </button>
                </div>
                <p className="text-muted">Update your billing details and address.</p>

                <div className="table-responsive-md rounded-lg">
                    <table className="table w-100 border-0 table-hover">
                        <thead className="border-0">
                            <tr className="border-0">
                                <th className="border-0"><input type="checkbox" /></th>
                                <th className="border-0">Invoice</th>
                                <th className="border-0">Amount</th>
                                <th className="border-0">Date</th>
                                <th className="border-0">Status</th>
                                <th className="border-0"></th>
                            </tr>
                        </thead>
                        <tbody className="border-0">
                            {data.map((row, index) => (
                                <tr key={index} className="border-0">
                                    <td className="border-0"><input type="checkbox" /></td>
                                    <td className="border-0">{row.invoice}</td>
                                    <td className="border-0">USD {row.amount}</td>
                                    <td className="border-0">{row.date}</td>
                                    <td className="border-0 text-success ">


                                        <span class="badge badge-pill semi-transparent px-2 py-1" style={{ fontSize: '11px' }}>
                                            <i className="bi bi-check-lg strong mr-1" ></i>
                                            {row.status}
                                        </span>

                                    </td>
                                    <td className="border-0">
                                        <i className="bi bi-cloud-download p-3" style={{ fontSize: '17px' }}></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingHistory;
