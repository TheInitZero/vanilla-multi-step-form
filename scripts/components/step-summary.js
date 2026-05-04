export class StepSummary {
    constructor(node, onChangeSubscription, onBack) {
        this.node = node;

        this.subscriptionSummary = new SubscriptionSummary(
            this.node.querySelector("[data-component='SubscriptionSummary']"),
            onChangeSubscription,
        );

        this.addOnsSummary = new AddOnsSummary(
            this.node.querySelector("[data-component='AddOnsSummary']"),
            this.node.querySelector("template[data-for='AddOnsSummaryDescription']")
        );

        this.totalSummary = new TotalSummary(
            this.node.querySelector("[data-component='TotalSummary']")
        );

        this.buttonBack = this.node.querySelector(
            "[data-component='StepSummary_button'][data-action='back']"
        );

        this.buttonBack.addEventListener("click", onBack);

        document.addEventListener("SIGNUP_PROGRESS.UPDATE", (event) => {
            let model = event.detail;
            this.node.hidden = model.currentStep != "summary";
        });

        document.addEventListener("SUMMARY.RENDER", (event) => this.render(event.detail));
    }

    render({
        subscriptionPrice,
        priceSuffix,
        totalPrice,
        addOnsSummaryDescriptionProps,
        billingFrequency,
        subscriptionLevel,
        isAddOnsSummaryHidden,
    }) {
        this.subscriptionSummary.setPlan(subscriptionLevel, billingFrequency);
        this.subscriptionSummary.setPrice(subscriptionPrice, priceSuffix);
        this.addOnsSummary.render(isAddOnsSummaryHidden, addOnsSummaryDescriptionProps);
        this.totalSummary.setBilling(billingFrequency);
        this.totalSummary.setPrice(totalPrice, priceSuffix);
    }
}

class SubscriptionSummary {
    constructor(node, onChangeSubscription) {
        this.node = node;

        this.plan = this.node.querySelector(
            "[data-component='SubscriptionSummary_plan']"
        );

        this.price = this.node.querySelector(
            "[data-component='SubscriptionSummary_price']"
        );

        this.button = this.node.querySelector(
            "[data-component='SubscriptionSummary_button']"
        );

        this.button.addEventListener("click", onChangeSubscription);
    }

    setPlan(subscriptionLevel, billingFrequency) {
        this.plan.innerText = `${subscriptionLevel} (${billingFrequency})`;
    }

    setPrice(price, suffix) {
        this.price.innerText = `$${price}/${suffix}`;
    }
}

class TotalSummary {
    constructor(node) {
        this.node = node;

        this.billing = this.node.querySelector(
            "[data-component='TotalSummary_billing']"
        );

        this.price = this.node.querySelector(
            "[data-component='TotalSummary_price']"
        );
    }

    setBilling(frequency) {
        this.billing.innerText = `Total (${frequency})`;
    }

    setPrice(price, suffix) {
        this.price.innerText = `$${price}/${suffix}`;
    }
}

class AddOnsSummary {
    constructor(node, descriptionTemplate) {
        this.node = node;
        this.description = new AddOnsSummaryDescription(descriptionTemplate);
    }

    render(isHidden, descriptionProps) {
        if (isHidden) {
            this.node.hidden = true;
        } else {
            this.node.hidden = false;
            this.node.innerHTML = "";

            for (let prop of descriptionProps) {
                let descriptionNode = this.description.render(prop.name, prop.price);
                this.node.appendChild(descriptionNode);
            }
        }
    }
}

class AddOnsSummaryDescription {
    constructor(template) {
        this.template = template;
    }

    render(name, price) {
        let clone = this.template.content.cloneNode(true);

        let nodeName = clone.querySelector(
            "[data-component='AddOnsSummaryDescription_name']"
        );

        let nodePrice = clone.querySelector(
            "[data-component='AddOnsSummaryDescription_price']"
        );

        nodeName.innerText = name;
        nodePrice.innerText = `+$${price.value}/${price.suffix}`;

        return clone;
    }
}