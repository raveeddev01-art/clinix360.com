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
        <Table striped hover>
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
                <td>{moment(invoice.date).format("MMMM D, YYYY")}</td>
                <td className="text-center">{invoice.users}</td>
                <td className="text-center">
                  {formatCurrency(invoice.credits)}
                </td>
                <td className="text-center">
                  {formatCurrency(invoice.charge)}
                </td>
                <td className="text-center">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={invoice.pdf}
                    className="btn btn-default btn-sm"
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
