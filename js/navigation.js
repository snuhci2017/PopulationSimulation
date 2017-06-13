;(function() {
$(function() {

    $('.site-nav-item').click(function () {
        $('.site-nav-item').removeClass('is-active');
        $(this).addClass('is-active');
        let numYear = Number($(this).attr('num-year'));
        let modeChangeEvent = new CustomEvent('mode_changed', {'detail' : {numYear}});
        document.dispatchEvent(modeChangeEvent);
        factorEvents.modeChangedEvent(numYear);
    });
});
})();
