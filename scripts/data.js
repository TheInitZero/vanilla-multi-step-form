let subscriptions = {
    arcade: {
        id: "arcade",
        name: "Arcade",
        price: {
            monthly: 9,
            yearly: 90,
        }
    },
    advanced: {
        id: "advanced",
        name: "Advanced",
        price: {
            monthly: 12,
            yearly: 120,
        }
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: {
            monthly: 15,
            yearly: 150,
        }
    },
};

let addOns = {
    "online-service": {
        id: "online-service",
        name: "Online service",
        price: {
            monthly: 1,
            yearly: 10,
        },
    },
    "larger-storage": {
        id: "larger-storage",
        name: "Larger storage",
        price: {
            monthly: 2,
            yearly: 20,
        },
    },
    "customizable-profile": {
        id: "customizable-profile",
        name: "Customizable profile",
        price: {
            monthly: 2,
            yearly: 20,
        },
    },
}

export let data = { subscriptions, addOns };