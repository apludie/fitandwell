/* ==========================================================================
   WELLPATH CALCULATORS
   All four calculators run entirely in the visitor's browser.
   Nothing that a visitor types is stored or sent anywhere.
   Each calculator only starts if its form exists on the current page.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- Shared helpers ---------------- */

  var LB_PER_KG = 2.2046226218;
  var CM_PER_IN = 2.54;

  function round(value, decimals) {
    var f = Math.pow(10, decimals || 0);
    return Math.round(value * f) / f;
  }

  function formatNumber(value, decimals) {
    return round(value, decimals || 0).toLocaleString("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    });
  }

  // Reads a number from an input. Returns NaN if empty or not a number.
  function readNumber(form, name) {
    var input = form.elements[name];
    if (!input) return NaN;
    var raw = String(input.value).trim();
    if (raw === "") return NaN;
    return Number(raw);
  }

  function readRadio(form, name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  // Collects validation problems, marks invalid fields and shows a message.
  function Validator(form) {
    this.form = form;
    this.errors = [];
    this.box = form.querySelector(".form-error");
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }
  Validator.prototype.check = function (name, value, min, max, label, allowEmptyAsZero) {
    if (allowEmptyAsZero && isNaN(value)) return 0;
    if (isNaN(value) || value < min || value > max) {
      this.errors.push("Enter " + label + " between " + min + " and " + max + ".");
      var input = this.form.elements[name];
      if (input) input.setAttribute("aria-invalid", "true");
      return NaN;
    }
    return value;
  };
  Validator.prototype.require = function (ok, message) {
    if (!ok) this.errors.push(message);
  };
  Validator.prototype.finish = function () {
    if (!this.box) return this.errors.length === 0;
    if (this.errors.length) {
      this.box.innerHTML = "<strong>Please check your entries:</strong> " + this.errors.join(" ");
      this.box.classList.add("is-visible");
      var firstBad = this.form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return false;
    }
    this.box.textContent = "";
    this.box.classList.remove("is-visible");
    return true;
  };

  function clearErrors(form) {
    var box = form.querySelector(".form-error");
    if (box) { box.textContent = ""; box.classList.remove("is-visible"); }
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }

  // Shows/hides the US or metric input group and disables hidden inputs.
  function setupUnitToggle(form) {
    var groups = form.querySelectorAll("[data-units]");
    if (!groups.length) return function () { return "us"; };
    function apply() {
      var units = readRadio(form, "units") || "us";
      groups.forEach(function (group) {
        var active = group.getAttribute("data-units") === units;
        group.hidden = !active;
        group.querySelectorAll("input").forEach(function (i) { i.disabled = !active; });
      });
      clearErrors(form);
    }
    form.querySelectorAll('input[name="units"]').forEach(function (r) { r.addEventListener("change", apply); });
    apply();
    return function () { return readRadio(form, "units") || "us"; };
  }

  function wire(formId, resultId, calculate) {
    var form = document.getElementById(formId);
    var result = document.getElementById(resultId);
    if (!form || !result) return;
    var placeholder = result.innerHTML;
    var getUnits = setupUnitToggle(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var html = calculate(form, getUnits());
      if (html) {
        result.innerHTML = html;
        result.setAttribute("tabindex", "-1");
        // Move focus to results on small screens so people see the answer.
        if (window.innerWidth < 900) result.focus({ preventScroll: false });
      }
    });

    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        clearErrors(form);
        result.innerHTML = placeholder;
        getUnits = setupUnitToggle(form);
      }, 0);
    });
  }

  /* ---------------- Formulas (exported for testing) ---------------- */

  var Formulas = {
    // BMI = weight (kg) / height (m)^2  ==  703 x weight (lb) / height (in)^2
    bmiFromImperial: function (pounds, inches) { return 703 * pounds / (inches * inches); },
    bmiFromMetric: function (kg, cm) { var m = cm / 100; return kg / (m * m); },

    bmiCategory: function (bmi) {
      if (bmi < 18.5) return "Underweight";
      if (bmi < 25) return "Healthy weight";
      if (bmi < 30) return "Overweight";
      return "Obesity";
    },

    // Weight range (lb) that corresponds to BMI 18.5–24.9 for a height in inches.
    healthyRangeLb: function (inches) {
      return { low: 18.5 * inches * inches / 703, high: 24.9 * inches * inches / 703 };
    },

    // Mifflin-St Jeor resting energy expenditure (kcal/day).
    mifflin: function (sex, kg, cm, age) {
      var base = 10 * kg + 6.25 * cm - 5 * age;
      return sex === "male" ? base + 5 : base - 161;
    },

    // Ideal body weight formulas (kg). Inches over 5 feet.
    ibw: function (sex, inches) {
      var over = inches - 60;
      var male = sex === "male";
      return {
        devine: male ? 50 + 2.3 * over : 45.5 + 2.3 * over,
        robinson: male ? 52 + 1.9 * over : 49 + 1.7 * over,
        miller: male ? 56.2 + 1.41 * over : 53.1 + 1.36 * over,
        hamwi: (male ? 106 + 6 * over : 100 + 5 * over) / LB_PER_KG
      };
    },

    // General hydration estimate in fluid ounces.
    waterOunces: function (pounds, exerciseMinutes, hotClimate) {
      return pounds * 0.5 + (exerciseMinutes / 30) * 12 + (hotClimate ? 16 : 0);
    }
  };
  window.WELLPATH_FORMULAS = Formulas;

  /* ---------------- BMI calculator ---------------- */

  wire("bmi-form", "bmi-result", function (form, units) {
    var v = new Validator(form);
    var inches, pounds, bmi;

    if (units === "metric") {
      var cm = v.check("height_cm", readNumber(form, "height_cm"), 90, 245, "height in centimeters");
      var kg = v.check("weight_kg", readNumber(form, "weight_kg"), 20, 450, "weight in kilograms");
      if (!v.finish()) return null;
      bmi = Formulas.bmiFromMetric(kg, cm);
      inches = cm / CM_PER_IN;
    } else {
      var ft = v.check("height_ft", readNumber(form, "height_ft"), 3, 8, "feet");
      var inch = v.check("height_in", readNumber(form, "height_in"), 0, 11.9, "inches", true);
      pounds = v.check("weight_lb", readNumber(form, "weight_lb"), 45, 1000, "weight in pounds");
      if (!v.finish()) return null;
      inches = ft * 12 + inch;
      if (inches < 36 || inches > 96) {
        v.require(false, "Height must be between 3 ft 0 in and 8 ft 0 in.");
        form.elements.height_ft.setAttribute("aria-invalid", "true");
        if (!v.finish()) return null;
      }
      bmi = Formulas.bmiFromImperial(pounds, inches);
    }

    var category = Formulas.bmiCategory(bmi);
    var range = Formulas.healthyRangeLb(inches);
    var rangeText = units === "metric"
      ? formatNumber(range.low / LB_PER_KG, 1) + "–" + formatNumber(range.high / LB_PER_KG, 1) + " kg"
      : formatNumber(range.low) + "–" + formatNumber(range.high) + " lb";
    var position = Math.min(100, Math.max(0, (bmi - 15) / 25 * 100));

    var explain = {
      "Underweight": "A BMI below 18.5 is classified as underweight. It can sometimes reflect low energy intake or a health condition, so it is worth discussing with a healthcare professional.",
      "Healthy weight": "A BMI from 18.5 to 24.9 is classified as a healthy weight range for most adults.",
      "Overweight": "A BMI from 25 to 29.9 is classified as overweight. On its own, BMI does not tell you about your overall health; waist size, activity, blood pressure and lab results add important context.",
      "Obesity": "A BMI of 30 or higher is classified as obesity. A healthcare professional can help you understand what this means for you and discuss options that fit your health and goals."
    }[category];

    return (
      "<h2>Your result</h2>" +
      '<p class="result__value">' + formatNumber(bmi, 1) + "<small>BMI</small></p>" +
      '<span class="result__category">' + category + "</span>" +
      '<div class="bmi-scale" aria-hidden="true"><div class="bmi-scale__bar"><span class="bmi-scale__marker" style="left:' + position + '%"></span></div>' +
      '<div class="bmi-scale__labels"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div></div>' +
      "<p>" + explain + "</p>" +
      '<ul class="result__rows"><li><span>BMI healthy-weight range for your height</span><span>' + rangeText + "</span></li></ul>" +
      '<p class="result__note">BMI is a screening measure for adults age 20 and older. It does not measure body fat directly or diagnose any condition.</p>'
    );
  });

  /* ---------------- Calorie calculator ---------------- */

  var ACTIVITY = {
    "1.2": "Sedentary",
    "1.375": "Lightly active",
    "1.55": "Moderately active",
    "1.725": "Very active",
    "1.9": "Extra active"
  };

  wire("calorie-form", "calorie-result", function (form) {
    var v = new Validator(form);
    var age = v.check("age", readNumber(form, "age"), 18, 100, "age");
    var sex = readRadio(form, "sex");
    v.require(sex === "male" || sex === "female", "Select the equation option (male or female).");
    var ft = v.check("height_ft", readNumber(form, "height_ft"), 4, 7, "feet");
    var inch = v.check("height_in", readNumber(form, "height_in"), 0, 11.9, "inches", true);
    var lb = v.check("weight_lb", readNumber(form, "weight_lb"), 70, 700, "weight in pounds");
    var activity = form.elements.activity.value;
    v.require(ACTIVITY.hasOwnProperty(activity), "Choose an activity level.");
    if (!v.finish()) return null;

    var kg = lb / LB_PER_KG;
    var cm = (ft * 12 + inch) * CM_PER_IN;
    var rmr = Formulas.mifflin(sex, kg, cm, age);
    var maintenance = rmr * Number(activity);
    var floor = sex === "male" ? 1500 : 1200;

    function lossRow(label, deficit) {
      var target = maintenance - deficit;
      var value = target < floor
        ? "Not shown*"
        : "about " + formatNumber(Math.round(target / 10) * 10) + " cal";
      return "<li><span>" + label + "</span><span>" + value + "</span></li>";
    }
    var anyBelow = maintenance - 500 < floor;

    return (
      "<h2>Your estimate</h2>" +
      '<p class="result__value">' + formatNumber(Math.round(maintenance / 10) * 10) + "<small>calories/day</small></p>" +
      '<span class="result__category">Estimated maintenance</span>' +
      "<p>This is roughly how many calories your body may use each day at your current weight, based on a " + ACTIVITY[activity].toLowerCase() + " routine.</p>" +
      '<ul class="result__rows">' +
      "<li><span>Resting energy (Mifflin-St Jeor)</span><span>" + formatNumber(Math.round(rmr / 10) * 10) + " cal</span></li>" +
      lossRow("Gradual loss: ~0.5 lb per week", 250) +
      lossRow("Moderate loss: ~1 lb per week", 500) +
      "</ul>" +
      (anyBelow
        ? '<p class="result__note">*Not shown because the result would fall below about ' + formatNumber(floor) + " calories a day, a level generally advised only with medical supervision.</p>"
        : "") +
      '<p class="result__note">These are estimates. Actual needs vary with body composition, health conditions, medications and other factors, and weight change is rarely linear. Please talk with your doctor or a registered dietitian before making significant changes.</p>'
    );
  });

  /* ---------------- Ideal weight calculator ---------------- */

  wire("ideal-form", "ideal-result", function (form) {
    var v = new Validator(form);
    var sex = readRadio(form, "sex");
    v.require(sex === "male" || sex === "female", "Select the formula option (male or female).");
    var ft = v.check("height_ft", readNumber(form, "height_ft"), 4, 7, "feet");
    var inch = v.check("height_in", readNumber(form, "height_in"), 0, 11.9, "inches", true);
    if (!v.finish()) return null;

    var inches = ft * 12 + inch;
    if (inches > 84) {
      v.require(false, "Height must be 7 ft 0 in or less for this calculator.");
      form.elements.height_ft.setAttribute("aria-invalid", "true");
      if (!v.finish()) return null;
    }
    var range = Formulas.healthyRangeLb(inches);
    var heightText = Math.floor(inches / 12) + " ft " + formatNumber(inches % 12, inches % 1 ? 1 : 0) + " in";

    var formulaRows = "";
    var formulaNote = "";
    if (inches >= 60) {
      var ibw = Formulas.ibw(sex, inches);
      formulaRows =
        "<li><span>Devine formula</span><span>" + formatNumber(ibw.devine * LB_PER_KG) + " lb</span></li>" +
        "<li><span>Robinson formula</span><span>" + formatNumber(ibw.robinson * LB_PER_KG) + " lb</span></li>" +
        "<li><span>Miller formula</span><span>" + formatNumber(ibw.miller * LB_PER_KG) + " lb</span></li>" +
        "<li><span>Hamwi formula</span><span>" + formatNumber(ibw.hamwi * LB_PER_KG) + " lb</span></li>";
    } else {
      formulaNote = '<p class="result__note">The Devine, Robinson, Miller and Hamwi formulas were designed for heights of 5 feet and above, so they are not shown for your height.</p>';
    }

    return (
      "<h2>Your estimate</h2>" +
      '<p class="result__value">' + formatNumber(range.low) + "–" + formatNumber(range.high) + "<small>lb</small></p>" +
      '<span class="result__category">BMI healthy-weight range</span>' +
      "<p>For a height of " + heightText + ", a BMI of 18.5 to 24.9 corresponds to roughly this weight range.</p>" +
      (formulaRows ? '<ul class="result__rows">' + formulaRows + "</ul><p>These older formulas each give a single reference weight. They were developed mainly for medication dosing and vary from one another, which is why we show them as context rather than a target.</p>" : "") +
      formulaNote +
      '<p class="result__note">This is a general screening estimate, not a personalized recommendation. It does not account for muscle mass, frame size, age, ethnicity or health conditions.</p>'
    );
  });

  /* ---------------- Water intake calculator ---------------- */

  wire("water-form", "water-result", function (form) {
    var v = new Validator(form);
    var lb = v.check("weight_lb", readNumber(form, "weight_lb"), 70, 700, "weight in pounds");
    var minutes = v.check("exercise", readNumber(form, "exercise"), 0, 600, "minutes of exercise", true);
    var climate = readRadio(form, "climate");
    v.require(climate === "mild" || climate === "hot", "Choose your typical climate.");
    if (!v.finish()) return null;

    var oz = Formulas.waterOunces(lb, minutes, climate === "hot");
    var cups = oz / 8;
    var liters = oz * 0.0295735;

    return (
      "<h2>Your estimate</h2>" +
      '<p class="result__value">' + formatNumber(Math.round(oz)) + "<small>fl oz/day</small></p>" +
      '<span class="result__category">General hydration estimate</span>' +
      '<ul class="result__rows">' +
      "<li><span>In 8-oz cups</span><span>about " + formatNumber(cups, 1) + " cups</span></li>" +
      "<li><span>In liters</span><span>about " + formatNumber(liters, 1) + " L</span></li>" +
      "<li><span>Included for exercise</span><span>" + formatNumber(Math.round(minutes / 30 * 12)) + " fl oz</span></li>" +
      "<li><span>Included for hot climate</span><span>" + (climate === "hot" ? "16 fl oz" : "none") + "</span></li>" +
      "</ul>" +
      "<p>This estimate covers fluids from all drinks. Water-rich foods such as fruits, vegetables and soups also contribute to hydration.</p>" +
      '<p class="result__note">Hydration needs vary with exercise, heat, diet, pregnancy, breastfeeding, illness and medications. If you have kidney, heart or liver conditions, or your doctor has advised a fluid limit, follow their guidance instead.</p>'
    );
  });
})();
