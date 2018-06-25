import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import { Grid, Row, Col, FormGroup, ControlLabel, DropdownButton, MenuItem, } from "react-bootstrap";

const getTitle = (filetypes, currentType) =>
  _.find(filetypes, ({ value }) => value == currentType).name

const FiletypeSelector = ({ filetypes, currentType, onSelect }) =>
  <DropdownButton
    bsStyle={"default"}
    id={`dropdown-basic`}
    title={getTitle(filetypes, currentType)}>
    {filetypes.map((filetype, i) =>
      <MenuItem
        active={currentType.value == filetype.value}
        key={filetype.value}
        onSelect={onSelect}
        eventKey={i}>
        {filetype.name}
      </MenuItem>
    )}
  </DropdownButton>

export default FiletypeSelector;
