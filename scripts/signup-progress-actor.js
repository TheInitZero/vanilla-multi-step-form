export function createSignupProgressActor() {
  let model = {
    currentStep: 'your-info',
    statuses: {
      'your-info': 'started',
      'select-plan': 'not-started',
      'add-ons': 'not-started',
      summary: 'not-started',
    },
  };

  function send(event) {
    model = update(model, event);

    let customEvent = new CustomEvent('SIGNUP_PROGRESS.UPDATE', {
      detail: model,
    });

    document.dispatchEvent(customEvent);
  }

  return { send };
}

function update(model, event) {
  switch (event.type) {
    case 'YOUR_INFO.NEXT': {
      if (model.currentStep != 'your-info') {
        return model;
      }

      if (!event.isInfoValid) {
        return model;
      }

      let nextStatuses = (function () {
        let statuses = { ...model.statuses };

        statuses['your-info'] = 'completed';

        statuses['select-plan'] =
          statuses['select-plan'] == 'completed' ? 'completed' : 'started';

        return statuses;
      })();

      let nextStep = 'select-plan';

      return {
        ...model,
        statuses: nextStatuses,
        currentStep: nextStep,
      };
    }

    case 'SELECT_PLAN.BACK': {
      if (model.currentStep != 'select-plan') {
        return model;
      }

      let nextStep = 'your-info';

      return {
        ...model,
        currentStep: nextStep,
      };
    }

    case 'SELECT_PLAN.NEXT': {
      if (model.currentStep != 'select-plan') {
        return model;
      }

      let nextStatuses = (function () {
        let statuses = { ...model.statuses };

        statuses['select-plan'] = 'completed';

        statuses['add-ons'] =
          statuses['add-ons'] == 'completed' ? 'completed' : 'started';

        return statuses;
      })();

      let nextStep = 'add-ons';

      return {
        ...model,
        statuses: nextStatuses,
        currentStep: nextStep,
      };
    }

    case 'ADD_ONS.BACK': {
      if (model.currentStep != 'add-ons') {
        return model;
      }

      let nextStep = 'select-plan';

      return {
        ...model,
        currentStep: nextStep,
      };
    }

    case 'ADD_ONS.NEXT': {
      if (model.currentStep != 'add-ons') {
        return model;
      }

      let nextStatuses = {
        ...model.statuses,
        'add-ons': 'completed',
        summary: 'started',
      };

      let nextStep = 'summary';

      return {
        ...model,
        statuses: nextStatuses,
        currentStep: nextStep,
      };
    }

    case 'SUMMARY.BACK': {
      if (model.currentStep != 'summary') {
        return model;
      }

      let nextStep = 'add-ons';

      return {
        ...model,
        currentStep: nextStep,
      };
    }

    case 'SUMMARY.CHANGE_SUBSCRIPTION': {
      if (model.currentStep != 'summary') {
        return model;
      }

      let nextStatuses = model.statuses;
      let nextStep = 'select-plan';

      return {
        ...model,
        statuses: nextStatuses,
        currentStep: nextStep,
      };
    }

    case 'SUMMARY.CONFIRM': {
      if (model.currentStep != 'summary') {
        return model;
      }

      let nextStatuses = {
        ...model.statuses,
        summary: 'completed',
      };

      let nextStep = 'summary';

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
