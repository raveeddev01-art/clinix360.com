import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";

import Navbar from "react-bootstrap/lib/Navbar";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import NavDropdown from "react-bootstrap/lib/NavDropdown";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Button from "react-bootstrap/lib/Button";

class Header extends Component {
  render() {
    const logoLink = !window.electronApp ? `https://${applicationHost}` : "#";

    return (
      // <Navbar id="header" inverse collapseOnSelect>
      //   <Navbar.Header>
      //     <Navbar.Brand>
      //       <a href={logoLink} className="brand">
      //         <img src="/images/stitch-brand.png" alt="Stitch" />
      //       </a>
      //     </Navbar.Brand>
      //     <Navbar.Toggle />
      //   </Navbar.Header>
      //   <Navbar.Collapse>
      //     <ul className="nav navbar-nav navbar-right">
      //       {!window.electronApp && (
      //         <li>
      //           <Dropdown id="products-dropdown-menu">
      //             <Dropdown.Toggle className="btn-dropdown">
      //               Products
      //             </Dropdown.Toggle>
      //             <Dropdown.Menu className="products-menu">
      //               <MenuItem href={`https://${applicationHost}/connect`}>
      //                 <div className="product-icon">
      //                   <img src="/images/connect-menu.png" alt="" />
      //                 </div>
      //                 Connect
      //                 <span>Team Messaging</span>
      //               </MenuItem>
      //               <MenuItem href={`https://${applicationHost}/engage`}>
      //                 <div className="product-icon">
      //                   <img src="/images/engage-menu.png" alt="" />
      //                 </div>
      //                 Engage
      //                 <span>Patient Messaging</span>
      //               </MenuItem>
      //               <MenuItem href={`https://${applicationHost}/manage`}>
      //                 <div className="product-icon">
      //                   <img src="/images/manage-menu.png" alt="" />
      //                 </div>
      //                 Manage
      //                 <span>Patient Management</span>
      //               </MenuItem>
      //             </Dropdown.Menu>
      //           </Dropdown>
      //         </li>
      //       )}

      //       {!window.electronApp && (
      //         <li role="presentation">
      //           <a
      //             href={`https://${applicationHost}/pricing`}
      //             className="nav-link"
      //           >
      //             Pricing
      //           </a>
      //         </li>
      //       )}

      //       {!window.electronApp && (
      //         <li>
      //           <Dropdown id="resources-dropdown-menu">
      //             <Dropdown.Toggle className="btn-dropdown">
      //               Resources
      //             </Dropdown.Toggle>

      //             <Dropdown.Menu>
      //               <MenuItem href={`https://${applicationHost}/downloads`}>
      //                 <i className="fa fa-cloud-download" /> Downloads
      //               </MenuItem>

      //               <MenuItem
      //                 href="https://calendly.com/teamstitch/demo"
      //                 target="_blank"
      //               >
      //                 <i className="fa fa-desktop" /> Demo
      //               </MenuItem>

      //               <MenuItem
      //                 href="https://intercom.help/teamstitch"
      //                 target="_blank"
      //               >
      //                 <i className="fa fa-life-ring" /> Support
      //               </MenuItem>

      //               <MenuItem href={`https://${applicationHost}/customers`}>
      //                 <i className="fa fa-users" /> Customers
      //               </MenuItem>
      //             </Dropdown.Menu>
      //           </Dropdown>
      //         </li>
      //       )}
      //       <li role="presentation">
      //         <a href="https://teamstitch.com/signin" className="nav-link">
      //           Sign In
      //         </a>
      //       </li>

      //       <li role="presentation">
      //         <a
      //           href="https://teamstitch.com/signup/email"
      //           className="nav-link btn-outline"
      //         >
      //           Create Team
      //         </a>
      //       </li>
      //     </ul>
      //   </Navbar.Collapse>
      // </Navbar>

      <Navbar id="header" inverse collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href={`https://${applicationHost}`} className="brand">
              <img src="/images/stitch-brand.png" alt="Stitch" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav pullRight>
            <LinkContainer to="/demo">
              <NavItem>Demo</NavItem>
            </LinkContainer>

            <NavDropdown title="Products" id="products-dropdown">
              <MenuItem href={`https://${applicationHost}/connect`}>
                <div className="product-icon">
                  <img src="/images/connect-menu.png" alt="" />
                </div>
                Connect <div className="subtext">Team Communication</div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/engage`}>
                <div className="product-icon">
                  <img src="/images/engage-menu.png" alt="" />
                </div>
                Engage <div className="subtext">Patient Management</div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/manage`}>
                <div className="product-icon">
                  <img src="/images/manage-menu.png" alt="" />
                </div>
                Manage <div className="subtext">Patient Communication</div>
              </MenuItem>
            </NavDropdown>

            <LinkContainer to="/pricing">
              <NavItem>Pricing</NavItem>
            </LinkContainer>

            <NavDropdown title="Resources" id="resources-dropdown">
              <MenuItem href={`https://${applicationHost}/downloads`}>
                <i className="fa fa-cloud-download" /> Downloads
                <div className="subtext hidden-sm hidden-lg">
                  Apps for Mac, Windows, iOS and Android
                </div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/pilot`}>
                <i className="fa fa-hospital-o" /> Pilot
                <div className="subtext hidden-sm hidden-lg">
                  Enterprise grade deployment plans
                </div>
              </MenuItem>

              <MenuItem href="https://intercom.help/teamstitch">
                <i className="fa fa-life-ring" /> Support
                <div className="subtext hidden-sm hidden-lg">
                  Everything you need to be a Stitch power user
                </div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/jobs`}>
                <i className="fa fa-wrench" /> Jobs
                <div className="subtext hidden-sm hidden-lg">We're hiring!</div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/customers`}>
                <i className="fa fa-users" /> Customers
                <div className="subtext hidden-sm hidden-lg">
                  Everything you need to be a Stitch power user
                </div>
              </MenuItem>
            </NavDropdown>

            <NavItem href="https://teamstitch.com/signin">Sign In</NavItem>

            <NavItem
              href="https://teamstitch.com/signup/email"
              className="btn-trial"
            >
              Start a trial
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
