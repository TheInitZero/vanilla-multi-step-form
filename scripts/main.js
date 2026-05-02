import { SignupProgressStep, SignupProgressActor } from "./components/signup-progress.js";
import { StepYourInfo } from "./components/step-your-info.js";
import { StepSelectPlan } from "./components/step-select-plan.js";
import { StepAddOns } from "./components/step-add-ons.js";
import { data } from "./data.js";

let nodeSignupForm = document.querySelector("[data-component='SignupForm']");
let signupProgressActor = SignupProgressActor();

new StepYourInfo(
    nodeSignupForm.querySelector("[data-component='StepYourInfo']"),
    function onNext(isInfoValid) {
        signupProgressActor.send({ type: "YOUR_INFO.NEXT", isInfoValid });
    }
);

new StepSelectPlan(
    nodeSignupForm.querySelector("[data-component='StepSelectPlan']"),
    function onBack() {
        signupProgressActor.send({ type: "SELECT_PLAN.BACK" });
    },
    function onNext() {
        signupProgressActor.send({ type: "SELECT_PLAN.NEXT" });
    }
);

new StepAddOns(
    nodeSignupForm.querySelector("[data-component='StepAddOns']"),
    function onBack() {
        signupProgressActor.send({ type: "ADD_ONS.BACK" });
    },
    function onNext() {
        signupProgressActor.send({ type: "ADD_ONS.NEXT" });
    }
);

let nodeStepSummary = nodeSignupForm.querySelector("[data-component='StepSummary']");
let nodeSubscriptionSummaryDescriptionPlan = nodeStepSummary.querySelector(
    "[data-component='SubscriptionSummaryDescription_plan']"
);
let nodeSubscriptionSummaryDescriptionPrice = nodeStepSummary.querySelector(
    "[data-component='SubscriptionSummaryDescription_price']"
);
let nodeAddOnsSummary = nodeStepSummary.querySelector(
    "[data-component='AddOnsSummary']"
);
let templateAddOnsSummaryDescription = nodeStepSummary.querySelector(
    "template[data-for='AddOnsSummaryDescription']"
);
let nodeTotalSummaryBilling = nodeStepSummary.querySelector(
    "[data-component='TotalSummary_billing']"
);
let nodeTotalSummaryPrice = nodeStepSummary.querySelector(
    "[data-component='TotalSummary_price']"
);

let buttonChangeSubscriptionSummary = document.getElementById(
    "button-change-subscription-summary",
);
let buttonBackSummary = document.getElementById("button-back-summary");

let componentsSignupProgressStep = Array.from(document.querySelectorAll("[data-component='SignupProgressStep']")).map(SignupProgressStep);

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;

    for (let component of componentsSignupProgressStep) {
        component.setStatus(model.statuses[component.getKey()]);
        component.setIsCurrent(component.getKey() == model.currentStep);
    }
});

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;
    nodeStepSummary.hidden = model.currentStep != "summary";
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

    nodeSubscriptionSummaryDescriptionPlan.innerText = `${capitalize(subLevel)} (${capitalize(billingFreq)})`;
    nodeSubscriptionSummaryDescriptionPrice.innerText = `$${subscriptionPrice}/${priceSuffix}`;

    if (addOns.length == 0) {
        nodeAddOnsSummary.hidden = true;
    } else {
        nodeAddOnsSummary.innerHTML = "";

        for (let id of addOns) {
            let addOnData = data.addOns[id];

            /**@type {HTMLLIElement} */
            let li = templateAddOnsSummaryDescription.content.cloneNode(true);
            let summaryAddOnName = li.querySelector(
                "[data-component='AddOnsSummaryDescription_name']"
            );
            let summaryAddOnPrice = li.querySelector(
                "[data-component='AddOnsSummaryDescription_price']"
            );

            summaryAddOnName.innerText = addOnData.name;
            summaryAddOnPrice.innerText = `+$${addOnData.price[billingFreq]}/${priceSuffix}`;

            nodeAddOnsSummary.appendChild(li);
        }

        nodeAddOnsSummary.hidden = false;
    }

    nodeTotalSummaryBilling.innerText = `Total (${capitalize(billingFreq)})`;
    nodeTotalSummaryPrice.innerText = `$${totalPrice}/${priceSuffix}`;

    function capitalize(word) {
        return word[0].toUpperCase() + word.slice(1);
    }
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
