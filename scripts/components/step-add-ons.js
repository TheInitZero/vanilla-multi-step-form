export class StepAddOns {
    constructor(node, onBack, onNext) {
        this.node = node;

        this.nodesAddOnOptionPrice = this.node.querySelectorAll(
            "[data-component='AddOnOption_price']"
        );

        this.buttonBack = this.node.querySelector(
            "[data-component='StepAddOns_button'][data-action='back']"
        );

        this.buttonNext = this.node.querySelector(
            "[data-component='StepAddOns_button'][data-action='next']"
        );

        this.buttonBack.addEventListener("click", onBack);
        this.buttonNext.addEventListener("click", onNext);

        document.addEventListener("BILLING_FREQ.CHANGE", (event) => {
            let billingFrequency = event.detail;

            for (let node of this.nodesAddOnOptionPrice) {
                node.innerText =
                    billingFrequency == "monthly"
                        ? node.dataset.priceMonthly
                        : node.dataset.priceYearly;
            }
        });

        document.addEventListener("SIGNUP_PROGRESS.UPDATE", (event) => {
            let model = event.detail;
            this.node.hidden = model.currentStep != "add-ons";
        });
    }
}