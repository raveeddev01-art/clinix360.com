import { matchPath } from "react-router-dom";

const IsSelected = (context, path, onlyActiveOnIndex = false) => {
  const { router } = context;
  const { route: { location } } = router;
  const isActive = matchPath(location.pathname, { path, exact: true }) != null;
  return isActive;
};
export default IsSelected;
