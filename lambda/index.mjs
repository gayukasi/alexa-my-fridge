import Alexa from "ask-sdk-core";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

// ── Supabase helpers ───────────────────────────────────────────────

async function supabaseInsert(item, category, location) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/fridge_items`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: item,
      category,
      location,
      added_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase insert failed (${res.status}): ${body}`);
  }
}

async function supabaseDelete(item) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/fridge_items?name=eq.${encodeURIComponent(item)}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase delete failed (${res.status}): ${body}`);
  }
}

// ── Intent handlers ────────────────────────────────────────────────

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(
        "Welcome to your fridge. What would you like to add or remove?"
      )
      .reprompt("What would you like to add or remove?")
      .getResponse();
  },
};

const AddInventoryIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AddInventoryIntent"
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const item = slots.item?.value;
    const category = slots.category?.value || "other";
    const location = slots.location?.value || "fridge";
    const action = slots.action?.value || "add";

    if (!item) {
      return handlerInput.responseBuilder
        .speak("Sorry, I didn't catch the item name. What would you like to add?")
        .reprompt("What item should I add?")
        .getResponse();
    }

    try {
      if (action === "remove") {
        await supabaseDelete(item);
        return handlerInput.responseBuilder
          .speak(`Got it, ${item} removed. Anything else?`)
          .reprompt("What else would you like to add or remove?")
          .getResponse();
      }

      await supabaseInsert(item, category, location);
      return handlerInput.responseBuilder
        .speak(`Got it, ${item} added to ${category}. Anything else?`)
        .reprompt("What else would you like to add or remove?")
        .getResponse();
    } catch (err) {
      console.error("Supabase error:", err);
      return handlerInput.responseBuilder
        .speak(`Sorry, I had trouble updating your inventory. Try again?`)
        .reprompt("What would you like to add or remove?")
        .getResponse();
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(
        'You can say things like "add milk to dairy" or "remove eggs". What would you like to do?'
      )
      .reprompt("What would you like to add or remove?")
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Goodbye! Your fridge is sorted.")
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(
        "Sorry, I didn't understand that. Try saying add milk to dairy, or remove eggs."
      )
      .reprompt("What would you like to add or remove?")
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      "Session ended:",
      JSON.stringify(handlerInput.requestEnvelope.request)
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error("Unhandled error:", error);
    return handlerInput.responseBuilder
      .speak("Sorry, something went wrong. Please try again.")
      .reprompt("What would you like to do?")
      .getResponse();
  },
};

// ── Lambda entry point ─────────────────────────────────────────────

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AddInventoryIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
