import { InputField, validateEmail, validateName, validateTel } from "./input-field.js";

export class StepYourInfo {
    constructor(node, onNext) {
        this.node = node;

        this.inputFieldName = new InputField(
            this.node.querySelector(
                "[data-component='InputField'][data-for='name']"
            ),
            validateName
        );

        this.inputFieldEmail = new InputField(
            this.node.querySelector(
                "[data-component='InputField'][data-for='email']"
            ),
            validateEmail
        );

        this.inputFieldTel = new InputField(
            this.node.querySelector(
                "[data-component='InputField'][data-for='tel']"
            ),
            validateTel
        );

        this.buttonNext = this.node.querySelector(
            "[data-component='StepYourInfo_button'][data-action='next']"
        );

        this.buttonNext.addEventListener("click", () => onNext(this.isInfoValid));

        document.addEventListener("YOUR_INFO.UPDATE", () => {
            if (this.isInfoValid) {
                this.buttonNext.removeAttribute("disabled");
            } else {
                this.buttonNext.setAttribute("disabled", "");
            }
        });

        document.addEventListener("SIGNUP_PROGRESS.UPDATE", (event) => {
            let model = event.detail;
            this.node.hidden = model.currentStep != "your-info";
        });
    }

    get isInfoValid() {
        return this.inputFieldName.isValid &&
            this.inputFieldEmail.isValid &&
            this.inputFieldTel.isValid
    }
}