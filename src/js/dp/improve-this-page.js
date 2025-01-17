import { clearValidation, validateFields, setFormValidation } from "./validation";

document.addEventListener("DOMContentLoaded", function () {
  const pageURL = window.location.href;
  const feedbackPath = "/feedback";
  const positiveFeedbackPath = `${feedbackPath}/thanks`;
  const feedbackFormHeader = document.querySelector("#feedback-form-header");
  const feedbackMessage =
    '<span id="feedback-form-confirmation">Thank you. Your feedback will help us as we continue to improve the service.</span>';
  const feedbackMessageError =
    '<span id="feedback-form-error role="alert"">Something went wrong, try using our <a href="/feedback">feedback form</a>.</span>';
  let feedbackPositive = false;
  const title = document.title;

  const useFeedbackAPI = document.querySelector("#feedback-api-enabled");
  const feedbackAPIURL = document.querySelector("#feedback-api-url");

  const feedbackFormURL = document.querySelector("#feedback-form-url");
  if (feedbackFormURL) {
    feedbackFormURL.value = pageURL;
  }

  const feedbackToggles = document.querySelectorAll("a.js-toggle");
  if (feedbackToggles) {
    feedbackToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        const feedbackForm = document.querySelector("#feedback-form");
        if (feedbackForm) {
          feedbackForm.classList.toggle("js-hidden");
        }
        if (feedbackFormHeader) {
          feedbackFormHeader.classList.toggle("js-hidden");
        }
        const id = toggle.id;
        if (id !== "feedback-form-close") {
          const descriptionField = document.querySelector("#description-field");
          if (descriptionField) {
            descriptionField.focus();
          }
        }
      });
    });
  }

  const feedbackFormYes = document.querySelector("#feedback-form-yes");
  if (feedbackFormYes && feedbackFormHeader) {
    feedbackFormYes.addEventListener("click", function (e) {
      feedbackPositive = true;
      e.preventDefault();
      const feedbackFormContainer = document.querySelector(
        "#feedback-form-container"
      );

      if (useFeedbackAPI && useFeedbackAPI.value === "true" && feedbackAPIURL) {
        const postObject = {
          is_page_useful: true,
          is_general_feedback: false,
          ons_url: pageURL,
        };
        const postJson = JSON.stringify(postObject);
        fetchFeedbackAPI(
          feedbackAPIURL.value,
          feedbackFormHeader,
          postJson,
          feedbackMessageError,
          feedbackMessage
        );
      } else {
        fetchFeedbackAPI(
          positiveFeedbackPath,
          feedbackFormHeader,
          serializeFormData(feedbackFormContainer),
          feedbackMessageError,
          feedbackMessage
        );
      }
    });
  }

  const feedbackFormContainer = document.querySelector(
    "#feedback-form-container"
  );
  if (feedbackFormContainer) {
    const cancelBtn = feedbackFormContainer.querySelector("#btn__cancel");
    const feedbackForm = document.querySelector("#feedback-form");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        feedbackFormHeader.classList.toggle("js-hidden");
        feedbackForm.classList.toggle("js-hidden");
      });
    }

    feedbackFormContainer.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailField = document.querySelector("#email-field");
      const descriptionField = document.querySelector("#description-field");
      const nameField = document.querySelector("#name-field");

      clearValidation("feedback-form-container", "feedback-form", title);

      const validationErrs = validateFields([
        descriptionField,
        nameField,
        emailField,
      ]);
      if (validationErrs.length > 0) {
        setFormValidation(title, validationErrs, feedbackForm);
        return;
      }

      if (useFeedbackAPI && useFeedbackAPI.value === "true" && feedbackAPIURL) {
        const postObject = {
          is_page_useful: false,
          is_general_feedback: false,
          ons_url: pageURL,
          name: nameField.value,
          email_address: emailField.value,
        };
        const postJson = JSON.stringify(postObject);
        fetchFeedbackAPI(
          false,
          feedbackAPIURL.value,
          feedbackFormHeader,
          postJson,
          feedbackMessageError,
          feedbackMessage
        );
      } else {
        fetchFeedbackAPI(
          true,
          feedbackPath,
          feedbackFormHeader,
          serializeFormData(feedbackFormContainer),
          feedbackMessageError,
          feedbackMessage
        );
        feedbackFormHeader.classList.toggle("js-hidden");
        feedbackForm.classList.toggle("js-hidden");
      }
    });
  }
});

function fetchFeedbackAPI(
  useUrlEncoding,
  url,
  feedbackFormHeader,
  form,
  feedbackMessageError,
  feedbackMessage
) {

  const contentType = useUrlEncoding ? "application/x-www-form-urlencoded" : "application/json; charset=UTF-8"
  const fetchConfig = {
    method: "POST",
    body: form,
    headers: new Headers({
      "Content-Type": contentType,
    }),
  };

  fetch(url, fetchConfig)
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
    })
    .then((response) => {
      feedbackFormHeader.innerHTML = feedbackMessage;
    })
    .catch((error) => {
      console.error(error);
      feedbackFormHeader.innerHTML = feedbackMessageError;
    });
}

function serializeFormData(form) {
  const data = new FormData(form);
  const serializedData = new URLSearchParams(data).toString();
  return serializedData;
}
