$(document).ready ()->
  ###################
  # EVENT HANDLER
  ###################
  $('.nav-menu-icon,.drawer-closer,.drawer-close-icon').click ()->
    if $('.slider').hasClass('drawer-open')
      $('.slider').removeClass('drawer-open')
      $('.drawer-closer').addClass('hide')
    else
      $('.slider').addClass('drawer-open')
      $('.drawer-closer').removeClass('hide')
  
