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