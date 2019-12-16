$(document).ready(function() {
  return $('.nav-menu-icon,.drawer-closer,.drawer-close-icon').click(function() {
    if ($('.slider').hasClass('drawer-open')) {
      $('.slider').removeClass('drawer-open');
      return $('.drawer-closer').addClass('hide');
    } else {
      $('.slider').addClass('drawer-open');
      return $('.drawer-closer').removeClass('hide');
    }
  });
});
