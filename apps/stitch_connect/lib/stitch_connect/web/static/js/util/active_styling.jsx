const IsSelected = (context, url, onlyActiveOnIndex = false) => {
  const { router } = context;
  const isActive = router.isActive(url, onlyActiveOnIndex);

  return isActive;
};
export default IsSelected;
