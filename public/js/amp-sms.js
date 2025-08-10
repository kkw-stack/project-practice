// Desktop Change url 
// layout="fill" height="155" width="47" attribute require to run the code on load (without user action)
(function(){
    var ua = navigator.userAgent.toLowerCase();
    var isMobile = ua.indexOf("mobile") > -1;

    if(!isMobile) {
        const link = document.getElementById('btn_contact_sms');
        const phone = link.getAttribute('data-tel');
        link.setAttribute('href', 'tel:'+phone);
    }
})();

