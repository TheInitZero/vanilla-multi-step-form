export class StepSelectPlan {
    constructor(node, onBack, onNext) {
        this.node = node;

        this.nodeBillingOptionInputMonthly = this.node.querySelector(
            "[data-component='BillingOption_input'][value='monthly']"
        );

        this.nodeBillingOptionInputYearly = this.node.querySelector(
            "[data-component='BillingOption_input'][value='yearly']"
        );

        this.nodesSubscriptionOptionPrice = this.node.querySelectorAll(
            "[data-component='SubscriptionOption_price']"
        );

        this.nodesSubscriptionOptionBonus = this.node.querySelectorAll(
            "[data-component='SubscriptionOption_bonus']"
        );

        this.buttonBack = this.node.querySelector(
            "[data-component='StepSelectPlan_button'][data-action='back']"
        );

        this.buttonNext = this.node.querySelector(
            "[data-component='StepSelectPlan_button'][data-action='next']"
        );

        this.nodeBillingOptionInputMonthly.addEventListener("change", () => {
            let customEvent = new CustomEvent("BILLING_FREQ.CHANGE", {
                detail: this.nodeBillingOptionInputMonthly.value,
            });
            document.dispatchEvent(customEvent);
        });

        this.nodeBillingOptionInputYearly.addEventListener("change", () => {
            let customEvent = new CustomEvent("BILLING_FREQ.CHANGE", {
                detail: this.nodeBillingOptionInputYearly.value,
            });
            document.dispatchEvent(customEvent);
        });


        this.buttonBack.addEventListener("click", onBack);
        this.buttonNext.addEventListener("click", onNext);

        document.addEventListener("BILLING_FREQ.CHANGE", (event) => {
            let billingFrequency = event.detail;

            for (let node of this.nodesSubscriptionOptionPrice) {
                node.innerText =
                    billingFrequency == "monthly"
                        ? node.dataset.priceMonthly
                        : node.dataset.priceYearly;
            }

            for (let node of this.nodesSubscriptionOptionBonus) {
                node.hidden = billingFrequency == "monthly";
            }
        });

        document.addEventListener("SIGNUP_PROGRESS.UPDATE", (event) => {
            let model = event.detail;
            this.node.hidden = model.currentStep != "select-plan";
        });
    }
}