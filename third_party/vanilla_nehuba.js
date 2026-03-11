(() => {
  if (!export_nehuba) {
    console.warn(`export_nehuba is not defined. Did you forget to import vanilla nehuba?`)
    return
  }
  const paramsString = window.location.search;
  const searchParams = new URLSearchParams(paramsString);
  const keys = [
    "zoomWithoutCtrl",
    "rightClickWithCtrl",
  ]
  const config = {}
  for (const key of keys){
    if (searchParams.has(key)) {
      config[key] = true
    }
  }
  window.nehubaViewer = export_nehuba.createNehubaViewer(config, err => console.error(err))
})()