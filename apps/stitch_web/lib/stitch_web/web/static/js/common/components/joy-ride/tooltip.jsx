import React from "react";
import Popover from "react-bootstrap/lib/Popover";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

function TooltipBody(props) {
  const style = {
    minWidth: '200px',
    maxWidth: '300px',
    paddingBottom: '20px',
    backgroundColor: '#FFFFFF',
  };

  return (<div style={style}>{props.children}</div>);
}

function TooltipContent(props) {
  const style = {
    color: '#333',
    padding: '0 20px',
    clear: 'both'
  };

  return (<div style={style}>{props.children}</div>);
}

function TooltipTitle(props) {
  const style = {
    margin: '0',
    color: '#036',
    padding: '20px',
    fontWeight: '600',
  };

  return (<h3 style={style}>{props.children}</h3>);
}

function CloseOptions({ closeProps, skipProps }) {
  const style = {
    width: '190px',
    borderRadius: '0',
    fontFamily: 'inherit'
  };

  return (
    <Popover id="close-options-popover" title="Close the tutorial" style={style}>
      <button className="btn" {...skipProps}>Remind me next time</button>
      <button className="btn" {...closeProps}>Skip completely</button>
    </Popover>
  );
}

function CloseIcon(props) {
  const style = {
    float: 'right',
    background: 'none',
    border: 'none',
    marginTop: '-62px',
  };

  return (
    <OverlayTrigger trigger="focus" placement="bottom" overlay={CloseOptions(props)}>
      <button style={style}>&#x2715;</button>
    </OverlayTrigger>
  );
}

function TooltipFooter(props) {
  const style = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: '20px',
  };

  return (<div style={style}>{props.children}</div>);
}

function Button(props) {
  const style = {
    backgroundColor: '#036',
    marginLeft: '5px',
    color: '#fff'
  };

  return (<button style={style} {...props}>{props.children}</button>);
}

const Tooltip = ({
  content,
  continuous,
  backProps,
  closeProps,
  index,
  isLastStep,
  locale,
  primaryProps,
  setTooltipRef,
  size,
  skipProps,
  title,
  showCloseButton,
}) => (
    <TooltipBody innerRef={setTooltipRef}>
      {title && <TooltipTitle>{title}{showCloseButton}</TooltipTitle>}
      {<CloseIcon skipProps={skipProps} closeProps={closeProps} />}
      {content && <TooltipContent>{content}</TooltipContent>}
      <TooltipFooter>
        {index > 0 && <Button {...backProps}>{locale.back}</Button>}
        {continuous && !isLastStep && <Button {...primaryProps}>{locale.next}</Button>}
        {!continuous || isLastStep && <Button {...closeProps}>{locale.close}</Button>}
      </TooltipFooter>
    </TooltipBody >
  );

export default Tooltip;
