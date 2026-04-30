import { SignupProgressStep, SignupProgressActor } from "./components/signup-progress.js";
import {
    InputField,
    validateEmail,
    validateName,
    validateTel,
} from "./components/input-field.js";
import { data } from "./data.js";

let nodeSignupForm = document.querySelector("[data-component='SignupForm']");

let nodeStepYourInfo = nodeSignupForm.querySelector("[data-component='StepYourInfo']");
let componentInputFieldName = new InputField(
    nodeStepYourInfo.querySelector("[data-component='InputField'][data-for='name']"),
    validateName
);
let componentInputFieldEmail = new InputField(
    nodeStepYourInfo.querySelector("[data-component='InputField'][data-for='email']"),
    validateEmail
);
let componentInputFieldTel = new InputField(
    nodeStepYourInfo.querySelector("[data-component='InputField'][data-for='tel']"),
    validateTel
);

let nodeStepSelectPlan = document.querySelector("[data-component='StepSelectPlan']");
let nodeBillingOptionInputMonthly = nodeStepSelectPlan.querySelector(
    "[data-component='BillingOption_input'][value='monthly']"
);
let nodeBillingOptionInputYearly = nodeStepSelectPlan.querySelector(
    "[data-component='BillingOption_input'][value='yearly']"
);
let nodesSubscriptionOptionPrice = document.querySelectorAll("[data-component='SubscriptionOption_price']");
let nodesSubscriptionOptionBonus = document.querySelectorAll("[data-component='SubscriptionOption_bonus']");

let fieldsetStepAddOns = document.getElementById("fieldset-step-add-ons");
let sectionStepSummary = document.getElementById("section-step-summary");

let addOnPrices = document.querySelectorAll("[data-selector='addOnPrice']");

let summarySubscriptionPlan = document.getElementById("summarySubscriptionPlan");
let summarySubscriptionPrice = document.getElementById("summarySubscriptionPrice");
let ulAddOnsSummary = document.querySelector("ul#addOnsSummary");
let templateAddOnsSummaryDescription = document.querySelector("template#addOnsSummaryDescription");
let totalSummaryBillingFreq = document.getElementById("totalSummaryBillingFreq");
let totalSummaryPrice = document.getElementById("totalSummaryPrice");

let buttonNextYourInfo = document.getElementById("button-next-your-info");
let buttonBackSelectPlan = document.getElementById("button-back-select-plan");
let buttonNextSelectPlan = document.getElementById("button-next-select-plan");
let buttonBackAddOns = document.getElementById("button-back-add-ons");
let buttonNextAddOns = document.getElementById("button-next-add-ons");
let buttonChangeSubscriptionSummary = document.getElementById(
    "button-change-subscription-summary",
);
let buttonBackSummary = document.getElementById("button-back-summary");

let componentsSignupProgressStep = Array.from(document.querySelectorAll("[data-component='SignupProgressStep']")).map(SignupProgressStep);

let signupProgressActor = SignupProgressActor();

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;

    for (let component of componentsSignupProgressStep) {
        component.setStatus(model.statuses[component.getKey()]);
        component.setIsCurrent(component.getKey() == model.currentStep);
    }
});

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;

    if (model.currentStep == "your-info") {
        nodeStepYourInfo.hidden = false;
        nodeStepSelectPlan.hidden = true;
        fieldsetStepAddOns.hidden = true;
        sectionStepSummary.hidden = true;
        return;
    }

    if (model.currentStep == "select-plan") {
        nodeStepYourInfo.hidden = true;
        nodeStepSelectPlan.hidden = false;
        fieldsetStepAddOns.hidden = true;
        sectionStepSummary.hidden = true;
        return;
    }

    if (model.currentStep == "add-ons") {
        nodeStepYourInfo.hidden = true;
        nodeStepSelectPlan.hidden = true;
        fieldsetStepAddOns.hidden = false;
        sectionStepSummary.hidden = true;
        return;
    }

    if (model.currentStep == "summary") {
        nodeStepYourInfo.hidden = true;
        nodeStepSelectPlan.hidden = true;
        fieldsetStepAddOns.hidden = true;
        sectionStepSummary.hidden = false;
        return;
    }
});

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;

    if (model.currentStep != "summary") return;

    let formData = new FormData(nodeSignupForm);
    let billingFreq = formData.get("billingFreq");
    let subLevel = formData.get("subLevel");
    let addOns = formData.getAll("addOns");

    let priceSuffix = billingFreq == "monthly" ? "mo" : "yr";
    let subscriptionPrice = data.subscriptions[subLevel].price[billingFreq];
    let totalPrice = (function () {
        let res = subscriptionPrice;

        for (let id of addOns) {
            let addOnData = data.addOns[id];
            let price = addOnData.price[billingFreq];
            res += price;
        }

        return res;
    })();

    summarySubscriptionPlan.innerText = `${capitalize(subLevel)} (${capitalize(billingFreq)})`;
    summarySubscriptionPrice.innerText = `$${subscriptionPrice}/${priceSuffix}`;

    if (addOns.length == 0) {
        ulAddOnsSummary.hidden = true;
    } else {
        ulAddOnsSummary.innerHTML = "";

        for (let id of addOns) {
            let addOnData = data.addOns[id];

            /**@type {HTMLLIElement} */
            let li = templateAddOnsSummaryDescription.content.cloneNode(true);
            let summaryAddOnName = li.querySelector("[data-selector='summaryAddOnName']");
            let summaryAddOnPrice = li.querySelector("[data-selector='summaryAddOnPrice']");

            summaryAddOnName.innerText = addOnData.name;
            summaryAddOnPrice.innerText = `+$${addOnData.price[billingFreq]}/${priceSuffix}`;

            ulAddOnsSummary.appendChild(li);
        }

        ulAddOnsSummary.hidden = false;
    }

    totalSummaryBillingFreq.innerText = `Total (${capitalize(billingFreq)})`;
    totalSummaryPrice.innerText = `$${totalPrice}/${priceSuffix}`;

    function capitalize(word) {
        return word[0].toUpperCase() + word.slice(1);
    }
});

document.addEventListener("YOUR_INFO.UPDATE", function () {
    let isInfoValid =
        componentInputFieldName.isValid &&
        componentInputFieldEmail.isValid &&
        componentInputFieldTel.isValid;

    if (isInfoValid) {
        buttonNextYourInfo.removeAttribute("disabled");
    } else {
        buttonNextYourInfo.setAttribute("disabled", "");
    }
});

document.addEventListener("BILLING_FREQ.CHANGE", function (event) {
    let billingFreq = event.detail;

    for (let node of nodesSubscriptionOptionPrice) {
        node.innerText =
            billingFreq == "monthly"
                ? node.dataset.priceMonthly
                : node.dataset.priceYearly;
    }

    for (let node of nodesSubscriptionOptionBonus) {
        node.hidden = billingFreq == "monthly";
    }

    for (let node of addOnPrices) {
        node.innerText =
            billingFreq == "monthly"
                ? node.dataset.priceMonthly
                : node.dataset.priceYearly;
    }
});

nodeBillingOptionInputMonthly.addEventListener("change", function () {
    let customEvent = new CustomEvent("BILLING_FREQ.CHANGE", {
        detail: nodeBillingOptionInputMonthly.value,
    });
    document.dispatchEvent(customEvent);
});

nodeBillingOptionInputYearly.addEventListener("change", function () {
    let customEvent = new CustomEvent("BILLING_FREQ.CHANGE", {
        detail: nodeBillingOptionInputYearly.value,
    });
    document.dispatchEvent(customEvent);
});

buttonNextYourInfo.addEventListener("click", function () {
    let isInfoValid =
        componentInputFieldName.isValid &&
        componentInputFieldEmail.isValid &&
        componentInputFieldTel.isValid;

    signupProgressActor.send({ type: "YOUR_INFO.NEXT", isInfoValid });
});

buttonBackSelectPlan.addEventListener("click", function () {
    signupProgressActor.send({ type: "SELECT_PLAN.BACK" });
});

buttonNextSelectPlan.addEventListener("click", function () {
    signupProgressActor.send({ type: "SELECT_PLAN.NEXT" });
});

buttonBackAddOns.addEventListener("click", function () {
    signupProgressActor.send({ type: "ADD_ONS.BACK" });
});

buttonNextAddOns.addEventListener("click", function () {
    signupProgressActor.send({ type: "ADD_ONS.NEXT" });
});

buttonChangeSubscriptionSummary.addEventListener("click", function () {
    signupProgressActor.send({ type: "SUMMARY.CHANGE_SUBSCRIPTION" });
});

buttonBackSummary.addEventListener("click", function () {
    signupProgressActor.send({ type: "SUMMARY.BACK" });
});

nodeSignupForm.addEventListener("submit", function () {
    signupProgressActor.send({ type: "SUMMARY.CONFIRM" });
});
