import React from "react";
import PropTypes from "prop-types";
import omit from "lodash/omit";
import cx from "classnames";
import Popover from "react-bootstrap/lib/Popover";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

function TooltipBody(props) {
  return <div className="tour-tooltip">{props.children}</div>;
}

function TooltipContent(props) {
  return <div className="tour-tooltip__content">{props.children}</div>;
}

function TooltipTitle(props) {
  return <h3 className="tour-tooltip__title">{props.children}</h3>;
}

function CloseOptions({ closeProps, skipProps }) {
  return (
    <Popover
      id="close-options-popover"
      title="Close the tutorial"
      className="tour-tooltip__close-options"
    >
      <button className="btn" {...skipProps}>
        Remind me next time
      </button>
      <button className="btn" {...closeProps}>
        Skip completely
      </button>
    </Popover>
  );
}

function CloseIcon(props) {
  return (
    <div className="tour-tooltip__close-wrapper">
      <OverlayTrigger
        trigger="focus"
        placement="bottom"
        overlay={CloseOptions(props)}
        onClick={(e) => e.target.focus()}
      >
        <button>&#x2715;</button>
      </OverlayTrigger>
    </div>
  );
}

function TooltipFooter(props) {
  return <div className="tour-tooltip__footer">{props.children}</div>;
}

function Button(props) {
  const btnClass = cx({
    btn: true,
    "btn-default": props.isBack,
    "btn-primary": !props.isBack
  });
  return (
    <button className={btnClass} {...omit(props, ["isBack"])}>
      {props.children}
    </button>
  );
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
  skipProps,
  title,
  showCloseButton
}) => (
  <TooltipBody innerRef={setTooltipRef} className="tour-tooltip">
    {<CloseIcon skipProps={skipProps} closeProps={closeProps} />}
    {title && (
      <TooltipTitle>
        {title}
        {showCloseButton}
      </TooltipTitle>
    )}
    {content && <TooltipContent>{content}</TooltipContent>}
    <TooltipFooter>
      {index > 0 && (
        <Button {...backProps} isBack>
          {locale.back}
        </Button>
      )}
      {continuous &&
        !isLastStep && <Button {...primaryProps}>{locale.next}</Button>}
      {!continuous ||
        (isLastStep && <Button {...closeProps}>{locale.close}</Button>)}
    </TooltipFooter>
  </TooltipBody>
);

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  continuous: PropTypes.bool.isRequired,
  backProps: PropTypes.object.isRequired,
  closeProps: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isLastStep: PropTypes.bool.isRequired,
  locale: PropTypes.object.isRequired,
  primaryProps: PropTypes.object.isRequired,
  setTooltipRef: PropTypes.func.isRequired,
  skipProps: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  showCloseButton: PropTypes.bool.isRequired
};

export default Tooltip;
