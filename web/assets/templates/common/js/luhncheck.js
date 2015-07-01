function ExistsCreditCard(str) {
    var regExCC = new RegExp(/\b\d+[\.\ \-\d]+\d+\b/g);

    var matches;
    while ((matches = regExCC.exec(str)) !== null) {
        if (LuhnCheckCreditCard(matches[0]) != '')
            return true;
    }
    return false;
}

//Based upon http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript
function LuhnCheckCreditCard(str) {

    var pattern = '^(?:' +
                  '4[0-9]{12}(?:[0-9]{3})?|4[0-9]{3}\\D\\d{4}\\D\\d{4}\\D\\d{4}|' + //Visa
                  '5[1-5][0-9]{14}|5[1-5]\\d{2}\\D\\d{4}\\D\\d{4}\\D\\d{4}|' + //MasterCard
                  '6(?:011|5[0-9][0-9])[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|6(?:011|5[0-9][0-9])\\D\\d{4}\\D\\d{4}\\D\\d{4}|' +   //Discover
                  '3[47][0-9]{13}|3[47][0-9]{2}\\D\\d{6}\\D\\d{5}|' + //AMEX
                  '3(?:0[0-5]|[68][0-9])[0-9]{11}|3(?:0[0-5]|[68][0-9])[0-9]\\D\\d{6}\\D\\d{4}|' + //Diners Club
                  '((?:2131|1800|35\\d{3})\\d{11}|(?:2131|1800|35\\d{2})\\D\\d{4}\\D\\d{4}\\D\\d{4}))$' //JCB

    var regValidate = new RegExp(pattern, 'g');
    if (!str.match(regValidate))
        return '';

    var temp = String(str).replace(/[^\d]/g, ""); //Remove any non-digit character

    var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
    var counter = 0;
    var incNum;
    var odd = false;

    for (var i = temp.length - 1; i >= 0; --i) {
        incNum = parseInt(temp.charAt(i), 10);
        counter += (odd = !odd) ? incNum : luhnArr[incNum];
    }

    if (counter % 10 == 0)
        return temp;

    return '';
}