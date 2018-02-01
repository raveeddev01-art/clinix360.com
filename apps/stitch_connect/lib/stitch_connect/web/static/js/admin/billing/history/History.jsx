import React from "react";
import { inject, observer } from "mobx-react";
import { Table } from "react-bootstrap";
import moment from "moment";

import { formatCurrency } from "lib/utils";

@inject("billingStore")
@observer
class History extends React.Component {
  render() {
    const { billingStore: { invoices } } = this.props;

    return (
      <div className="history-tab">
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th className="text-center">Users</th>
              <th className="text-center">Credits</th>
              <th className="text-center">Charge</th>
              <th className="text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{moment(invoice.inserted_at).format("MMMM D, YYYY")}</td>
                <td className="text-center">{invoice.quantity}</td>
                <td className="text-center">{formatCurrency(0)}</td>
                <td className="text-center">
                  {formatCurrency(invoice.amount)}
                </td>
                <td className="text-center">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={invoice.statement_pdf_url}
                    className="btn btn-default btn-sm btn-pdf"
                  >
                    PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default History;
