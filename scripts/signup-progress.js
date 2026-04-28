export function ProgressStep(node) {
    let description = node.querySelector(`#${node.id}-description`);

    let statusDescriptions = {
        completed: "Completed",
        started: "Started",
        notStarted: "Not started",
    };

    return { getId, getStatus, setStatus, getIsCurrent, setIsCurrent };

    function getId() {
        return node.id;
    }

    function getStatus() {
        return node.dataset.status ?? "notStarted";
    }

    function setStatus(status) {
        node.dataset.status = status;
        description.innerText = statusDescriptions[status];
    }

    function getIsCurrent() {
        return node.ariaCurrent == "step";
    }

    function setIsCurrent(isCurrent) {
        node.ariaCurrent = isCurrent ? "step" : null;
    }
}

export function SignupProgressActor() {
    let model = {
        currentStep: "step-your-info",
        statuses: {
            "step-your-info": "started",
            "step-select-plan": "notStarted",
            "step-add-ons": "notStarted",
            "step-summary": "notStarted",
        },
    };

    return { send };

    function update(model, event) {
        switch (event.type) {
            case "YOUR_INFO.NEXT": {
                if (model.currentStep != "step-your-info") {
                    return model;
                }

                if (!event.isInfoValid) {
                    return model;
                }

                let nextStatuses = (function () {
                    let statuses = { ...model.statuses };

                    statuses["step-your-info"] = "completed";

                    statuses["step-select-plan"] =
                        statuses["step-select-plan"] == "completed"
                            ? "completed"
                            : "started";

                    return statuses;
                })();

                let nextStep = "step-select-plan";

                return {
                    ...model,
                    statuses: nextStatuses,
                    currentStep: nextStep,
                };
            }

            case "SELECT_PLAN.BACK": {
                if (model.currentStep != "step-select-plan") {
                    return model;
                }

                let nextStep = "step-your-info";

                return {
                    ...model,
                    currentStep: nextStep,
                };
            }

            case "SELECT_PLAN.NEXT": {
                if (model.currentStep != "step-select-plan") {
                    return model;
                }

                let nextStatuses = (function () {
                    let statuses = { ...model.statuses };

                    statuses["step-select-plan"] = "completed";

                    statuses["step-add-ons"] =
                        statuses["step-add-ons"] == "completed" ? "completed" : "started";

                    return statuses;
                })();

                let nextStep = "step-add-ons";

                return {
                    ...model,
                    statuses: nextStatuses,
                    currentStep: nextStep,
                };
            }

            case "ADD_ONS.BACK": {
                if (model.currentStep != "step-add-ons") {
                    return model;
                }

                let nextStep = "step-select-plan";

                return {
                    ...model,
                    currentStep: nextStep,
                };
            }

            case "ADD_ONS.NEXT": {
                if (model.currentStep != "step-add-ons") {
                    return model;
                }

                let nextStatuses = {
                    ...model.statuses,
                    "step-add-ons": "completed",
                    "step-summary": "started",
                };

                let nextStep = "step-summary";

                return {
                    ...model,
                    statuses: nextStatuses,
                    currentStep: nextStep,
                };
            }

            case "SUMMARY.BACK": {
                if (model.currentStep != "step-summary") {
                    return model;
                }

                let nextStep = "step-add-ons";

                return {
                    ...model,
                    currentStep: nextStep,
                };
            }

            case "SUMMARY.CHANGE_SUBSCRIPTION": {
                if (model.currentStep != "step-summary") {
                    return model;
                }

                let nextStatuses = model.statuses;
                let nextStep = "step-select-plan";

                return {
                    ...model,
                    statuses: nextStatuses,
                    currentStep: nextStep,
                };
            }

            case "SUMMARY.CONFIRM": {
                if (model.currentStep != "step-summary") {
                    return model;
                }

                let nextStatuses = {
                    ...model.statuses,
                    "step-summary": "completed",
                };

                let nextStep = "step-summary";

                return {
                    ...model,
                    statuses: nextStatuses,
                    currentStep: nextStep,
                };
            }

            default: {
                return model;
            }
        }
    }

    function send(event) {
        model = update(model, event);

        let customEvent = new CustomEvent("SIGNUP_PROGRESS.UPDATE", {
            detail: model,
        });

        document.dispatchEvent(customEvent);
    }
}
