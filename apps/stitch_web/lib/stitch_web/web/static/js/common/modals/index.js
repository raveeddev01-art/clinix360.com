import { createConfirmation } from "react-confirm";

import CallingModal from "./calling-modal";
import ConfirmModal from "./confirm-modal";
import AlertModal from "./alert-modal";
import ReadonlyInputModal from "./readonly-input-modal";

const callingModal = createConfirmation(CallingModal);
const confirmModal = createConfirmation(ConfirmModal);
const alertModal = createConfirmation(AlertModal);
const readonlyInputModal = createConfirmation(ReadonlyInputModal);

export { callingModal, confirmModal, alertModal, readonlyInputModal };
