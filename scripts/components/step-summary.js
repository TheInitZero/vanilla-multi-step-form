export class SubscriptionSummary {
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

export class TotalSummary {
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

export class AddOnsSummary {
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

export class AddOnsSummaryDescription {
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