def run_script(controller, params)
  controller.ok(params['txt'].reverse)
end