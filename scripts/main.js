import { createSignupProgressActor } from './signup-progress-actor.js';

let signupProgressActor = createSignupProgressActor();

/** @type {HTMLFormElement} */
let signupFormEl = document.getElementById('signup-form');

(function module_page_title() {
  const TITLES = {
    'your-info': 'Step 1 of 4: Your info | Signup',
    'select-plan': 'Step 2 of 4: Select plan | Signup',
    'add-ons': 'Step 3 of 4: Add-ons | Signup',
    summary: 'Step 4 of 4: Summary | Signup',
  };

  /** @type {HTMLTitleElement} */
  let titleEl = document.querySelector('title');

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;
    titleEl.innerText = TITLES[model.currentStep];
  });
})();

(function module_signup_progress() {
  const STATUS_DESCRIPTIONS = {
    completed: 'Completed',
    started: 'Started',
    'not-started': 'Not started',
  };

  /** @type {HTMLOListElement} */
  let signupProgressEl = document.getElementById('signup-progress');

  /** @type {HTMLLIElement[]} */
  let signupProgressStepEls = Array.from(
    signupProgressEl.querySelectorAll('.js-signup-progress-step'),
  );

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;

    for (let stepEl of signupProgressStepEls) {
      let status = model.statuses[stepEl.dataset.key];
      stepEl.dataset.status = status;

      /** @type {HTMLParagraphElement} */
      let statusEl = stepEl.querySelector('.js-signup-progress-step-status');
      statusEl.innerText = STATUS_DESCRIPTIONS[status];

      let isCurrent = stepEl.dataset.key == model.currentStep;
      stepEl.ariaCurrent = isCurrent ? 'step' : null;
    }
  });
})();

(function module_signup_form_step_your_info() {
  /**
   * @typedef {(value: string) => [boolean, string | null]} InputValidatorFunction
   */

  /** @type {HTMLFieldSetElement} */
  let signupFormStepEl = signupFormEl.querySelector(
    '.js-signup-form-step[data-step="your-info"]',
  );

  /** @type {HTMLInputElement} */
  let nameInputEl = signupFormStepEl.querySelector('#name');

  /** @type {HTMLSpanElement} */
  let nameErrorEl = signupFormStepEl.querySelector('#name-error');

  /** @type {HTMLInputElement} */
  let emailInputEl = signupFormStepEl.querySelector('#email');

  /** @type {HTMLSpanElement} */
  let emailErrorEl = signupFormStepEl.querySelector('#email-error');

  /** @type {HTMLInputElement} */
  let telephoneInputEl = signupFormStepEl.querySelector('#telephone');

  /** @type {HTMLSpanElement} */
  let telephoneErrorEl = signupFormStepEl.querySelector('#telephone-error');

  /** @type {HTMLButtonElement} */
  let buttonNextEl = signupFormStepEl.querySelector(
    '.js-button[data-action="next"]',
  );

  nameInputEl.addEventListener('input', onYourInfoUpdate);

  nameInputEl.addEventListener(
    'input',
    createInputEventListener(nameInputEl, nameErrorEl, validateName),
  );

  emailInputEl.addEventListener('input', onYourInfoUpdate);

  emailInputEl.addEventListener(
    'input',
    createInputEventListener(emailInputEl, emailErrorEl, validateEmail),
  );

  telephoneInputEl.addEventListener('input', onYourInfoUpdate);

  telephoneInputEl.addEventListener(
    'input',
    createInputEventListener(
      telephoneInputEl,
      telephoneErrorEl,
      validateTelephone,
    ),
  );

  buttonNextEl.addEventListener('click', function () {
    signupProgressActor.send({
      type: 'YOUR_INFO.NEXT',
      isInfoValid: isInfoValid(),
    });
  });

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;
    signupFormStepEl.hidden = model.currentStep != 'your-info';
  });

  function onYourInfoUpdate() {
    buttonNextEl.disabled = !isInfoValid();
  }

  function isInfoValid() {
    let formData = new FormData(signupFormEl);

    let name = formData.get('name');
    let email = formData.get('email');
    let telephone = formData.get('telephone');

    let [isNameValid] = validateName(name);
    let [isEmailValid] = validateEmail(email);
    let [isTelephoneValid] = validateTelephone(telephone);

    return isNameValid && isEmailValid && isTelephoneValid;
  }

  /**
   * @param {HTMLInputElement} inputEl
   * @param {HTMLSpanElement} errorEl
   * @param {InputValidatorFunction} validate
   * @returns {() => void}
   */
  function createInputEventListener(inputEl, errorEl, validate) {
    return function () {
      let [isValid, errorMessage] = validate(inputEl.value);

      if (isValid) {
        inputEl.ariaInvalid = false;
        errorEl.innerText = '';
      } else {
        inputEl.ariaInvalid = true;
        errorEl.innerText = errorMessage;
      }
    };
  }

  /** @type {InputValidatorFunction} */
  function validateName(name) {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return [false, 'Name cannot be empty'];
    }

    if (trimmed.length < 3) {
      return [false, 'Name must be at least 3 characters long'];
    }

    if (trimmed.length > 20) {
      return [false, 'Name must be at most 20 characters long'];
    }

    // Only allow letters and spaces
    const validPattern = /^[A-Za-z\s]+$/;
    if (!validPattern.test(trimmed)) {
      return [false, 'Name can only contain letters and spaces'];
    }

    return [true, null];
  }

  /** @type {InputValidatorFunction} */
  function validateEmail(email) {
    const trimmed = email.trim();

    if (trimmed.length === 0) {
      return [false, 'Email is required'];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      return [false, 'Invalid email format'];
    }

    return [true, null];
  }

  /** @type {InputValidatorFunction} */
  function validateTelephone(telephone) {
    if (typeof telephone !== 'string') {
      return [false, 'Telephone must be a string'];
    }

    const trimmed = telephone.trim();

    if (trimmed.length === 0) {
      return [false, 'Telephone is required'];
    }

    // Allow digits, spaces, dashes, parentheses, and leading +
    const validCharsRegex = /^[\d+\-\s()]+$/;
    if (!validCharsRegex.test(trimmed)) {
      return [false, 'Telephone contains invalid characters'];
    }

    // Remove all non-digit characters for length validation
    const digitsOnly = trimmed.replace(/\D/g, '');

    // Basic sanity check: most phone numbers are between 7 and 15 digits
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return [false, 'Telephone must have between 7 and 15 digits'];
    }

    // Ensure + appears only at the start if present
    if (trimmed.includes('+') && !trimmed.startsWith('+')) {
      return [false, "Invalid '+' placement"];
    }

    return [true, null];
  }
})();

(function module_signup_form_step_select_plan() {
  /** @type {HTMLFieldSetElement} */
  let signupFormStepEl = signupFormEl.querySelector(
    '.js-signup-form-step[data-step="select-plan"]',
  );

  /** @type {HTMLInputElement} */
  let monthlyInputEl = signupFormStepEl.querySelector(
    '#billing-frequency-monthly',
  );

  /** @type {HTMLInputElement} */
  let yearlyInputEl = signupFormStepEl.querySelector(
    '#billing-frequency-yearly',
  );

  /** @type {HTMLParagraphElement} */
  let arcadePriceEl = signupFormStepEl.querySelector('#arcade-price');

  /** @type {HTMLParagraphElement} */
  let advancedPriceEl = signupFormStepEl.querySelector('#advanced-price');

  /** @type {HTMLParagraphElement} */
  let proPriceEl = signupFormStepEl.querySelector('#pro-price');

  let priceEls = [arcadePriceEl, advancedPriceEl, proPriceEl];

  /** @type {HTMLParagraphElement} */
  let arcadeBonusEl = signupFormStepEl.querySelector('#arcade-bonus');

  /** @type {HTMLParagraphElement} */
  let advancedBonusEl = signupFormStepEl.querySelector('#advanced-bonus');

  /** @type {HTMLParagraphElement} */
  let proBonusEl = signupFormStepEl.querySelector('#pro-bonus');

  let bonusEls = [arcadeBonusEl, advancedBonusEl, proBonusEl];

  /** @type {HTMLButtonElement} */
  let buttonBackEl = signupFormStepEl.querySelector(
    '.js-button[data-action="back"]',
  );

  /** @type {HTMLButtonElement} */
  let buttonNextEl = signupFormStepEl.querySelector(
    '.js-button[data-action="next"]',
  );

  monthlyInputEl.addEventListener('change', () =>
    onBillingFrequencyChange(monthlyInputEl.value),
  );

  yearlyInputEl.addEventListener('change', () =>
    onBillingFrequencyChange(yearlyInputEl.value),
  );

  buttonBackEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'SELECT_PLAN.BACK' });
  });

  buttonNextEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'SELECT_PLAN.NEXT' });
  });

  document.addEventListener('BILLING_FREQUENCY.CHANGE', function (event) {
    /** @type {"monthly" | "yearly"} */
    let billingFrequency = event.detail;

    for (let priceEl of priceEls) {
      priceEl.innerText = priceEl.dataset[billingFrequency];
    }

    for (let bonusEl of bonusEls) {
      bonusEl.hidden = billingFrequency == 'monthly';
    }
  });

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;
    signupFormStepEl.hidden = model.currentStep != 'select-plan';
  });

  /**
   * @param {"monthly" | "yearly"} frequency
   */
  function onBillingFrequencyChange(frequency) {
    let customEvent = new CustomEvent('BILLING_FREQUENCY.CHANGE', {
      detail: frequency,
    });
    document.dispatchEvent(customEvent);
  }
})();

(function module_signup_form_step_add_ons() {
  /** @type {HTMLFieldSetElement} */
  let signupFormStepEl = signupFormEl.querySelector(
    '.js-signup-form-step[data-step="add-ons"]',
  );

  /** @type {HTMLParagraphElement[]} */
  let priceEls = Array.from(
    signupFormStepEl.querySelectorAll('.js-add-on-price'),
  );

  /** @type {HTMLButtonElement} */
  let buttonBackEl = signupFormStepEl.querySelector(
    '.js-button[data-action="back"]',
  );

  /** @type {HTMLButtonElement} */
  let buttonNextEl = signupFormStepEl.querySelector(
    '.js-button[data-action="next"]',
  );

  buttonBackEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'ADD_ONS.BACK' });
  });

  buttonNextEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'ADD_ONS.NEXT' });
  });

  document.addEventListener('BILLING_FREQUENCY.CHANGE', function (event) {
    /** @type {"monthly" | "yearly"} */
    let billingFrequency = event.detail;

    for (let priceEl of priceEls) {
      priceEl.innerText = priceEl.dataset[billingFrequency];
    }
  });

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;
    signupFormStepEl.hidden = model.currentStep != 'add-ons';
  });
})();

(function module_signup_form_step_summary() {
  const DATA = {
    SUBSCRIPTIONS: {
      arcade: {
        id: 'arcade',
        name: 'Arcade',
        price: {
          monthly: 9,
          yearly: 90,
        },
      },

      advanced: {
        id: 'advanced',
        name: 'Advanced',
        price: {
          monthly: 12,
          yearly: 120,
        },
      },

      pro: {
        id: 'pro',
        name: 'Pro',
        price: {
          monthly: 15,
          yearly: 150,
        },
      },
    },

    ADD_ONS: {
      'online-service': {
        id: 'online-service',
        name: 'Online service',
        price: {
          monthly: 1,
          yearly: 10,
        },
      },

      'larger-storage': {
        id: 'larger-storage',
        name: 'Larger storage',
        price: {
          monthly: 2,
          yearly: 20,
        },
      },

      'customizable-profile': {
        id: 'customizable-profile',
        name: 'Customizable profile',
        price: {
          monthly: 2,
          yearly: 20,
        },
      },
    },
  };

  /** @type {HTMLFieldSetElement} */
  let signupFormStepEl = signupFormEl.querySelector(
    '.js-signup-form-step[data-step="summary"]',
  );

  /** @type {HTMLSpanElement} */
  let subscriptionPlanEl = signupFormStepEl.querySelector(
    '.js-subscription-plan',
  );

  /** @type {HTMLSpanElement} */
  let subscriptionPriceEl = signupFormStepEl.querySelector(
    '.js-subscription-price',
  );

  /** @type {HTMLButtonElement} */
  let changeSubscriptionEl = signupFormStepEl.querySelector(
    '.js-button[data-action="change-subscription"]',
  );

  /** @type {HTMLUListElement} */
  let addOnsEl = signupFormStepEl.querySelector('.js-add-ons');

  /** @type {HTMLTemplateElement} */
  let addOnDetailTemplate = addOnsEl.querySelector('template#add-on-detail');

  /** @type {HTMLSpanElement} */
  let totalBillingFrequencyEl = signupFormStepEl.querySelector(
    '.js-total-billing-frequency',
  );

  /** @type {HTMLSpanElement} */
  let totalPriceEl = signupFormStepEl.querySelector('.js-total-price');

  /** @type {HTMLButtonElement} */
  let buttonBackEl = signupFormStepEl.querySelector(
    '.js-button[data-action="back"]',
  );

  changeSubscriptionEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'SUMMARY.CHANGE_SUBSCRIPTION' });
  });

  buttonBackEl.addEventListener('click', function () {
    signupProgressActor.send({ type: 'SUMMARY.BACK' });
  });

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;
    signupFormStepEl.hidden = model.currentStep != 'summary';
  });

  document.addEventListener('SIGNUP_PROGRESS.UPDATE', function (event) {
    let model = event.detail;

    if (model.currentStep != 'summary') return;

    let formData = new FormData(signupFormEl);

    /** @type {"monthly" | "yearly"} */
    let billingFrequency = formData.get('billing-frequency');

    /** @type {"arcade" | "advanced" | "pro"} */
    let subscriptionLevel = formData.get('subscription-level');

    /** @type {("online-service" | "larger-storage" | "customizable-profile")[]} */
    let addOnIds = formData.getAll('add-ons');

    let priceSuffix = billingFrequency == 'monthly' ? 'mo' : 'yr';

    let subscriptionPrice =
      DATA.SUBSCRIPTIONS[subscriptionLevel].price[billingFrequency];

    let totalPrice = (function () {
      let total = subscriptionPrice;

      for (let id of addOnIds) {
        let price = DATA.ADD_ONS[id].price[billingFrequency];
        total += price;
      }

      return total;
    })();

    subscriptionPlanEl.innerText = `${capitalize(subscriptionLevel)} (${capitalize(billingFrequency)})`;
    subscriptionPriceEl.innerText = `$${subscriptionPrice}/${priceSuffix}`;

    totalBillingFrequencyEl.innerText = `Total (${capitalize(billingFrequency)})`;
    totalPriceEl.innerText = `$${totalPrice}/${priceSuffix}`;

    if (addOnIds.length == 0) {
      addOnsEl.hidden = true;
    } else {
      addOnsEl.hidden = false;
      addOnsEl.innerHTML = '';

      for (let id of addOnIds) {
        let addOnData = DATA.ADD_ONS[id];

        /** @type {HTMLLIElement} */
        let addOnDetailEl = addOnDetailTemplate.content.cloneNode(true);

        /** @type {HTMLSpanElement} */
        let nameEl = addOnDetailEl.querySelector('.js-name');

        /** @type {HTMLSpanElement} */
        let priceEl = addOnDetailEl.querySelector('.js-price');

        nameEl.innerText = addOnData.name;
        priceEl.innerText = `+$${addOnData.price[billingFrequency]}/${priceSuffix}`;

        addOnsEl.appendChild(addOnDetailEl);
      }
    }
  });

  /**
   * @param {string} word
   * @returns {string}
   */
  function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1);
  }
})();
