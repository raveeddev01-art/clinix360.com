import { createConfirmation } from "react-confirm";

import ConfirmModal from "./confirm-modal";
import AlertModal from "./alert-modal";

const confirmModal = createConfirmation(ConfirmModal);
const alertModal = createConfirmation(AlertModal);

export { confirmModal, alertModal };
