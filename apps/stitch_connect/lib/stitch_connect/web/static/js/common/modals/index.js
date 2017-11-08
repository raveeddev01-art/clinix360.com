import { createConfirmation } from "react-confirm";

import Confirm from "./confirm";
import Alert from "./alert";

const confirm = createConfirmation(Confirm);
const alert = createConfirmation(Alert);

export { confirm, alert };
