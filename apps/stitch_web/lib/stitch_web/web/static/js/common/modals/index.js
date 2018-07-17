import { createConfirmation } from "react-confirm";

import ConfirmModal from "./confirm-modal";
import AlertModal from "./alert-modal";
import ReadonlyInputModal from "./readonly-input-modal";

const confirmModal = createConfirmation(ConfirmModal);
const alertModal = createConfirmation(AlertModal);
const readonlyInputModal = createConfirmation(ReadonlyInputModal);

export { confirmModal, alertModal, readonlyInputModal };
