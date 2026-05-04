import { SignupProgressStep, SignupProgressActor } from "./components/signup-progress.js";
import { StepYourInfo } from "./components/step-your-info.js";
import { StepSelectPlan } from "./components/step-select-plan.js";
import { StepAddOns } from "./components/step-add-ons.js";
import { StepSummary } from "./components/step-summary.js";
import { data } from "./data.js";

let nodeSignupForm = document.querySelector("[data-component='SignupForm']");
let signupProgressActor = SignupProgressActor();
let componentsSignupProgressStep = Array
    .from(document.querySelectorAll("[data-component='SignupProgressStep']"))
    .map(SignupProgressStep);

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

new StepSummary(
    nodeSignupForm.querySelector("[data-component='StepSummary']"),
    function onChangeSubscription() {
        signupProgressActor.send({ type: "SUMMARY.CHANGE_SUBSCRIPTION" });
    },
    function onBack() {
        signupProgressActor.send({ type: "SUMMARY.BACK" });
    }
);

document.addEventListener("SIGNUP_PROGRESS.UPDATE", function (event) {
    let model = event.detail;

    for (let component of componentsSignupProgressStep) {
        component.setStatus(model.statuses[component.getKey()]);
        component.setIsCurrent(component.getKey() == model.currentStep);
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

    let addOnsSummaryDescriptionProps = (function () {
        let res = [];

        for (let id of addOns) {
            let addOnData = data.addOns[id];

            let descriptionProp = {
                name: addOnData.name,
                price: {
                    value: addOnData.price[billingFreq],
                    suffix: priceSuffix
                }
            };

            res.push(descriptionProp);
        }

        return res;
    })();

    let customEvent = new CustomEvent("SUMMARY.RENDER", {
        detail: {
            subscriptionPrice,
            priceSuffix,
            totalPrice,
            addOnsSummaryDescriptionProps,
            billingFrequency: capitalize(billingFreq),
            subscriptionLevel: capitalize(subLevel),
            isAddOnsSummaryHidden: addOns.length == 0,
        }
    });

    document.dispatchEvent(customEvent);

    function capitalize(word) {
        return word[0].toUpperCase() + word.slice(1);
    }
});

nodeSignupForm.addEventListener("submit", function () {
    signupProgressActor.send({ type: "SUMMARY.CONFIRM" });
});
