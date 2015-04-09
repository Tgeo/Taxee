/* JavaScript port of Taxee (https://github.com/clearlyandy/Taxee) */

var taxCalculator = function () {

    var stateCalculator = new stateTaxCalculatorModel();
    var federalCalculator = new federalTaxCalculatorModel();

    this.calculateTaxes = function (year, pay_rate, pay_periods, filing_status, state) {
        if (!year || !pay_rate || !pay_periods || !filing_status || !state)
            throw "Missing required parameters";

        var totalTaxes = 0;
        var federal_response = federalCalculator.calculate(year, pay_rate, pay_periods, filing_status, state);
        totalTaxes += federal_response.ficaAmount;
        totalTaxes += federal_response.federalAmount;

        var state_response = stateCalculator.calculate(year, pay_rate, pay_periods, filing_status, state);
        totalTaxes += state_response.state_amount;

        return totalTaxes;
    }
}


var federalTaxCalculatorModel = function () {

    this.federalData = null; //stores data once retrieved for subsequent calculations
    this.ssa_rate = 0.062;
    this.medicare_rate = 0.0145;
    this.supported_years = [2014]; //only 2014 -- more years requires more data

    this.get_federal_data = function (year) {
        if (!in_array(year, this.supported_years)) {
            throw "Invalid year";
        }
        if (this.federalData) {
            return this.federalData; //pull from "cache"
        }
        var handle = file_get_contents("tax_tables/" + year + "/federal.json", "r");
        if (!handle)
            throw "Couldn't get tax tables";
        this.federalData = JSON.parse(handle);
        return this.federalData;
    };

    this.calculate = function (year, pay_rate, pay_periods, filing_status) {
        var ficaAmount = this.get_fica_tax_amount(pay_rate, pay_periods);
        var federalAmount = this.get_federal_income_tax_amount(year, pay_rate, pay_periods, filing_status);
        return { ficaAmount: ficaAmount, federalAmount: federalAmount };
    };

    this.get_federal_income_tax_amount = function (year, pay_rate, pay_periods, filing_status) {
        var federalData = this.get_federal_data(year);
        var fit_filing_status = filing_status;
        var income = pay_rate * pay_periods;
        var target_table = federalData.tax_withholding_percentage_method_tables.annual[fit_filing_status];
        var deduction_amount = 0;

        if (target_table.deductions) {
            target_table.deductions.forEach(function (deduction) {
                deduction_amount += deduction.deduction_amount;
            });
        }

        var exemption_amount = 0;
        var adjusted_income = income - deduction_amount - exemption_amount;

        var amount = 0;
        for (var mridx = 0; mridx < sizeof(target_table.income_tax_brackets); mridx++) {
            var tax_bracket = target_table.income_tax_brackets[mridx];

            if (mridx == (sizeof(target_table.income_tax_brackets) - 1)) {
                amount += (adjusted_income - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
            } else if ((adjusted_income < target_table.income_tax_brackets[mridx + 1].bracket)) {
                amount += (adjusted_income - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
                break;
            } else {
                amount += (target_table.income_tax_brackets[mridx + 1].bracket - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
            }
        }

        if (amount < 0)
            amount = 0;

        return parseFloat(number_format(amount, 2, '.', ''));
    }

    this.get_fica_tax_amount = function (pay_rate, pay_periods) {
        var amount = ((pay_rate * pay_periods) * this.ssa_rate) + ((pay_rate * pay_periods) * this.medicare_rate);
        return round(amount, 2);
    }
}


var stateTaxCalculatorModel = function () {

    this.StateConstants = new StateConstants();

    this.stateData = [];
    this.ssa_rate = 0.062;
    this.medicare_rate = 0.0145;
    this.supported_years = [2014];

    this.get_state_data = function (year, state_abbr) {
        var state = this.StateConstants.abbreviation_to_full_name(state_abbr);
        if (!in_array(year, this.supported_years)) {
            throw "Invalid year";
        }
        if (!state) {
            throw "Invalid state";
        }

        var state = state.toLowerCase();
        var stateName = str_replace(" ", "_", state);

        if (this.stateData && this.stateData[stateName]) {
            return this.stateData[stateName]; //pull from "cache"
        }

        var handle = file_get_contents("tax_tables/" + year + "/" + stateName + ".json", "r");
        if (!handle)
            throw "Couldn't get tax tables";
        this.stateData[stateName] = JSON.parse(handle);
        return this.stateData[stateName];
    }

    this.calculate = function (year, pay_rate, pay_periods, filing_status, state) {
        var income = pay_rate * pay_periods;
        var state_amount = this.get_state_tax_amount(year, income, filing_status, state);
        return { state_amount: state_amount };
    }

    this.get_state_tax_amount = function (year, income, filing_status, state_abbr) {
        var target_table = this.get_state_data(year, state_abbr)[filing_status];

        var deduction_amount = 0;
        if (target_table.deductions) {
            target_table.deductions.forEach(function (deduction) {
                deduction_amount += deduction.deduction_amount;
            });
        }

        var exemption_amount = 0;
        var adjusted_income = income - deduction_amount - exemption_amount;
        if (adjusted_income < 0) {
            adjusted_income = 0;
        }

        if (target_table.type && (target_table.type == "none" || target_table.type == "TODO UNKNOWN!")) {
            return null;
        }
        else {
            var amount = 0;
            for (var mridx = 0; mridx < sizeof(target_table.income_tax_brackets); mridx++) {
                var tax_bracket = target_table.income_tax_brackets[mridx];
                if (mridx == (sizeof(target_table.income_tax_brackets) - 1)) {
                    amount += (adjusted_income - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
                } else if ((adjusted_income < target_table.income_tax_brackets[mridx + 1].bracket)) {
                    amount += (adjusted_income - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
                    break;
                } else {
                    amount += (target_table.income_tax_brackets[mridx + 1].bracket - tax_bracket.bracket) * (tax_bracket.marginal_rate / 100);
                }
            }

            return parseFloat(number_format(amount, 2, '.', ''));
        }

        return null;
    }
}


var StateConstants = function () {

    this.initialized = false;
    this.states = ["Alabama", "Alaska", "Arizona", "Arkansas",
        "California", "Colorado", "Connecticut", "Delaware",
        "District of Columbia", "Florida", "Georgia", "Hawaii",
        "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
        "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
        "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
        "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
        "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah",
        "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

    this.state_abbreviations = ["AL", "AK", "AZ", "AR",
        "CA", "CO", "CT", "DE",
        "DC", "FL", "GA", "HI",
        "ID", "IL", "IN", "IA", "KS", "KY",
        "LA", "ME", "MD", "MA", "MI",
        "MN", "MS", "MO", "MT", "NE",
        "NV", "NH", "NJ", "NM", "NY",
        "NC", "ND", "OH", "OK", "OR",
        "PA", "RI", "SC",
        "SD", "TN", "TX", "UT",
        "VT", "VA", "WA", "WV", "WI", "WY"];

    this.initialize = function () {
        if (this.initialized)
            return;

        this.initialized = true;
    }

    this.abbreviation_to_full_name = function (state_abbr) {
        this.initialize();
        state_abbr = state_abbr.toUpperCase();
        var match = array_search(state_abbr, this.state_abbreviations);
        if (match > -1) {
            var state = this.states[array_search(state_abbr, this.state_abbreviations)];
            return state;
        }
        return false;
    }
}
